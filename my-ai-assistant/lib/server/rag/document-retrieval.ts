import "server-only"

import { generateEmbedding } from "./embeddings"
import { searchDocumentChunks } from "./vector-search"

const relevanceThreshold = 0.2

async function retrieveDocumentContext({
  conversationId,
  question,
  userId,
}: {
  conversationId: string
  question: string
  userId: string
}) {
  const embedding = await generateEmbedding(question)
  const chunks = await searchDocumentChunks({
    conversationId,
    userId,
    embedding,
    topK: 6,
  })

  const relevantChunks = chunks.filter((chunk) => chunk.similarity >= relevanceThreshold)

  if (relevantChunks.length === 0) {
    return {
      found: false,
      context: "",
      sources: [] as string[],
    }
  }

  const uniqueSources = new Set<string>()
  const context = relevantChunks
    .map((chunk) => {
      const sourceLabel = chunk.pageNumber
        ? `${chunk.originalName} - Page ${chunk.pageNumber}`
        : chunk.originalName

      uniqueSources.add(sourceLabel)

      return [
        `Source: ${sourceLabel}`,
        `Excerpt: ${chunk.text}`,
      ].join("\n")
    })
    .join("\n\n")

  return {
    found: true,
    context,
    sources: Array.from(uniqueSources),
  }
}

export { retrieveDocumentContext }