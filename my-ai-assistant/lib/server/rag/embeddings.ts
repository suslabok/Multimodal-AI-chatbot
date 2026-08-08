import "server-only"

import { createOpenAI } from "@ai-sdk/openai"
import { embed, embedMany } from "ai"

const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY,
})

const embeddingModel = openai.embedding("text-embedding-3-small")

async function generateEmbeddings(values: string[]) {
  const result = await embedMany({
    model: embeddingModel,
    values,
  })

  return result.embeddings
}

async function generateEmbedding(value: string) {
  const result = await embed({
    model: embeddingModel,
    value,
  })

  return result.embedding
}

function formatVector(embedding: number[]) {
  return `[${embedding.map((value) => Number(value.toFixed(6))).join(",")}]`
}

export { formatVector, generateEmbedding, generateEmbeddings }