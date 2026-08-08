import "server-only"

import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/server/db/prisma"
import { formatVector } from "./embeddings"
import type { RetrievedDocumentChunk } from "./types"

const embeddingDimensions = 1536

async function searchDocumentChunks({
  conversationId,
  userId,
  embedding,
  topK = 5,
}: {
  conversationId: string
  userId: string
  embedding: number[]
  topK?: number
}) {
  const vectorLiteral = formatVector(embedding)

  const rows = await prisma.$queryRaw<RetrievedDocumentChunk[]>(Prisma.sql`
    SELECT
      dc."id",
      dc."uploadedFileId",
      uf."originalName",
      dc."pageNumber",
      dc."chunkIndex",
      dc."text",
      1 - (dc."embedding" <=> CAST(${vectorLiteral} AS vector(${embeddingDimensions}))) AS "similarity"
    FROM "DocumentChunk" dc
    INNER JOIN "UploadedFile" uf ON uf."id" = dc."uploadedFileId"
    WHERE dc."conversationId" = ${conversationId}
      AND dc."userId" = ${userId}
      AND uf."status" = 'READY'
    ORDER BY dc."embedding" <=> CAST(${vectorLiteral} AS vector(${embeddingDimensions}))
    LIMIT ${topK}
  `)

  return rows
}

export { searchDocumentChunks }