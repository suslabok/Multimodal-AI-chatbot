import "server-only"

import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { embed, embedMany } from "ai"

const google = createGoogleGenerativeAI({
  apiKey: process.env.AI_API_KEY,
})

// gemini-embedding-001 outputs 3072 dimensions by default. We cap it at 768
// via outputDimensionality to keep the pgvector column small and fast -
// this MUST match the vector(768) dimension used in the DB column and in
// the CAST(... AS vector(768)) calls in vector-search.ts / the upload route.
const embeddingModel = google.textEmbeddingModel("gemini-embedding-001")
const embeddingProviderOptions = {
  google: {
    outputDimensionality: 768,
    taskType: "RETRIEVAL_DOCUMENT" as const,
  },
}

async function generateEmbeddings(values: string[]) {
  const result = await embedMany({
    model: embeddingModel,
    values,
    providerOptions: embeddingProviderOptions,
  })

  return result.embeddings
}

async function generateEmbedding(value: string) {
  const result = await embed({
    model: embeddingModel,
    value,
    providerOptions: {
      google: {
        outputDimensionality: 768,
        taskType: "RETRIEVAL_QUERY" as const,
      },
    },
  })

  return result.embedding
}

function formatVector(embedding: number[]) {
  return `[${embedding.map((value) => Number(value.toFixed(6))).join(",")}]`
}

export { formatVector, generateEmbedding, generateEmbeddings }