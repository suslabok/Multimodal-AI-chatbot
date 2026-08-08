import { createOpenAI } from "@ai-sdk/openai"
import { streamText, type ModelMessage } from "ai"

type ChatRequestMessage = ModelMessage
 
const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY,
})

export async function POST(request: Request) {
  if (!process.env.AI_API_KEY) {
    return Response.json(
      { error: "Missing AI_API_KEY environment variable." },
      { status: 500 }
    )
  }

  const body = (await request.json()) as {
    messages?: ChatRequestMessage[]
  }

  const messages = body.messages ?? []

  const result = streamText({
    model: openai("gpt-4o-mini"),
    instructions:
      "You are the Multimodal AI Assistant. Be concise, helpful, and friendly. If the user provides an image, analyze it directly and answer the user's question about the image.",
    messages,
  })

  return result.toTextStreamResponse()
}