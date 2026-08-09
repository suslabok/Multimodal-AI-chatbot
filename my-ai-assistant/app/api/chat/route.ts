import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText, type ModelMessage } from "ai"

import { prisma } from "@/lib/server/db/prisma"
import { ensureConversationExists } from "@/lib/server/rag/upsert-uploaded-file"
import { retrieveDocumentContext } from "@/lib/server/rag/document-retrieval"

type ChatRequestMessage = ModelMessage

const google = createGoogleGenerativeAI({
  apiKey: process.env.AI_API_KEY,
})

function getLatestUserQuestion(messages: ChatRequestMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]

    if (message?.role !== "user") {
      continue
    }

    if (typeof message.content === "string") {
      return message.content.trim()
    }

    return message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .trim()
  }

  return ""
}

export async function POST(request: Request) {
  if (!process.env.AI_API_KEY) {
    return Response.json(
      { error: "Missing AI_API_KEY environment variable." },
      { status: 500 }
    )
  }

  const body = (await request.json()) as {
    conversationId?: string
    messages?: ChatRequestMessage[]
  }

  const messages = body.messages ?? []
  const conversationId = body.conversationId?.trim() || ""
  const latestQuestion = getLatestUserQuestion(messages)

  if (conversationId) {
    await ensureConversationExists(conversationId)
  }

  // Only take the RAG path if this conversation actually has a PDF that
  // finished processing. Otherwise every plain text/image chat would be
  // routed through document retrieval and get a "not found in document"
  // reply even though no document was ever uploaded.
  const hasReadyDocument =
    conversationId.length > 0
      ? (await prisma.uploadedFile.count({
          where: { conversationId, status: "READY" },
        })) > 0
      : false

  if (conversationId && latestQuestion && hasReadyDocument) {
    try {
      const context = await retrieveDocumentContext({
        conversationId,
        question: latestQuestion,
        userId: "anonymous",
      })

      if (!context.found) {
        return new Response("I couldn't find this information in the uploaded document.", {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        })
      }

      const result = streamText({
        model: google("gemini-3.5-flash-lite"),
        instructions: [
  "You are the Multimodal AI Assistant.",
  "Answer the user's question using only the retrieved PDF context below.",
  "Be specific and detailed: pull concrete facts, numbers, names, and wording directly from the context rather than giving a vague summary. Synthesize across multiple excerpts if they're related.",
  "Write in full sentences with enough detail to be genuinely useful, not just a one-line answer.",
  "If the context does not contain the answer, say exactly: I couldn't find this information in the uploaded document.",
  context.sources.length > 0 ? `Sources:\n${context.sources.map((source) => `- ${source}`).join("\n")}` : "",
  `Retrieved context:\n${context.context}`,
]
          .filter(Boolean)
          .join("\n\n"),
        messages,
      })

      return result.toTextStreamResponse()
    } catch {
      // Fall back to the general text/image path if retrieval fails.
    }
  }

  const result = streamText({
    model: google("gemini-3.5-flash-lite"),
    instructions:
      "You are the Multimodal AI Assistant. Be concise, helpful, and friendly. If the user provides an image, analyze it directly and answer the user's question about the image.",
    messages,
  })

  return result.toTextStreamResponse()
}