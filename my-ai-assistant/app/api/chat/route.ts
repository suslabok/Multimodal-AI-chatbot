import { createOpenAI } from "@ai-sdk/openai"
import { streamText, type ModelMessage } from "ai"

import { ensureConversationExists } from "@/lib/server/rag/upsert-uploaded-file"
import { retrieveDocumentContext } from "@/lib/server/rag/document-retrieval"

type ChatRequestMessage = ModelMessage

const openai = createOpenAI({
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

  if (conversationId && latestQuestion) {
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
        model: openai("gpt-4o-mini"),
        instructions: [
          "You are the Multimodal AI Assistant. Be concise, helpful, and friendly.",
          "Answer the user's question using only the retrieved PDF context below.",
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
    model: openai("gpt-4o-mini"),
    instructions:
      "You are the Multimodal AI Assistant. Be concise, helpful, and friendly. If the user provides an image, analyze it directly and answer the user's question about the image.",
    messages,
  })

  return result.toTextStreamResponse()
}