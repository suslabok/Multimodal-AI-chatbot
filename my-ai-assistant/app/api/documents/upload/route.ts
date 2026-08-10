import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/server/db/prisma"
import { ConversationAccessDeniedError, ensureConversationExists } from "@/lib/server/rag/upsert-uploaded-file"
import { extractPdfPages } from "@/lib/server/rag/pdf-processing"
import { chunkExtractedPdfPages } from "@/lib/server/rag/text-chunking"
import { generateEmbeddings, formatVector } from "@/lib/server/rag/embeddings"

const maxPdfSizeBytes = 20 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const conversationId = String(formData.get("conversationId") ?? "").trim()
    const file = formData.get("file")

    if (!conversationId) {
      return Response.json({ error: "Missing conversation id." }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return Response.json({ error: "No PDF file was provided." }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return Response.json({ error: "Only PDF files are supported." }, { status: 400 })
    }

    if (file.size > maxPdfSizeBytes) {
      return Response.json({ error: "PDF files must be smaller than 20 MB." }, { status: 413 })
    }

try {
      await ensureConversationExists(conversationId, userId)
    } catch (error) {
      if (error instanceof ConversationAccessDeniedError) {
        return Response.json({ error: error.message }, { status: 403 })
      }

      throw error
    }

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        conversationId,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        status: "PROCESSING",
      },
    })

    try {
      const extracted = await extractPdfPages(await file.arrayBuffer())
      const chunks = chunkExtractedPdfPages(extracted.pages)
      const embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.text))

      await prisma.uploadedFile.update({
        where: { id: uploadedFile.id },
        data: {
          status: "READY",
          pageCount: extracted.pageCount,
          extractedText: extracted.extractedText,
          errorMessage: null,
        },
      })

      // Build one multi-row INSERT instead of looping many individual
      // $executeRaw calls inside an interactive transaction. Neon's pooled
      // connection uses PgBouncer in transaction-pooling mode, which can
      // drop/reassign the underlying connection mid-transaction if it runs
      // long - a single statement avoids that entirely and is much faster.
      const rows = chunks.map((chunk, index) => {
        const embedding = embeddings[index]

        if (!embedding) {
          throw new Error("Failed to generate an embedding for a PDF chunk.")
        }

        return Prisma.sql`(
          ${crypto.randomUUID()},
          ${uploadedFile.id},
          ${conversationId},
          ${"anonymous"},
          ${chunk.pageNumber},
          ${chunk.chunkIndex},
          ${chunk.text},
          CAST(${formatVector(embedding)} AS vector(768)),
          ${new Date()}
        )`
      })

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "DocumentChunk" (
          "id",
          "uploadedFileId",
          "conversationId",
          "userId",
          "pageNumber",
          "chunkIndex",
          "text",
          "embedding",
          "createdAt"
        ) VALUES ${Prisma.join(rows)}
      `)

      return Response.json(
        {
          uploadedFile: {
            id: uploadedFile.id,
            originalName: file.name,
            pageCount: extracted.pageCount,
            status: "READY",
          },
        },
        { status: 200 }
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to process this PDF right now."

      await prisma.uploadedFile.update({
        where: { id: uploadedFile.id },
        data: {
          status: "FAILED",
          errorMessage,
        },
      })

      return Response.json(
        {
          error: errorMessage,
        },
        { status: 422 }
      )
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to upload this PDF right now."

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}