const geminiApiKey = process.env.AI_API_KEY
const transcriptionModel = "gemini-3.5-flash"
const maxAudioSizeBytes = 20 * 1024 * 1024

export async function POST(request: Request) {
  if (!geminiApiKey) {
    return Response.json(
      { error: "Missing AI_API_KEY environment variable." },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const file = formData.get("audio")

  if (!(file instanceof File)) {
    return Response.json({ error: "No audio file was provided." }, { status: 400 })
  }

  if (file.size === 0) {
    return Response.json({ error: "The recording was empty." }, { status: 400 })
  }

  if (file.size > maxAudioSizeBytes) {
    return Response.json({ error: "Recordings must be smaller than 20 MB." }, { status: 413 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${transcriptionModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Transcribe this audio recording exactly as spoken. Respond with ONLY the transcribed text - no preamble, no quotation marks, no commentary. If the audio is silent or unintelligible, respond with an empty string.",
                },
                {
                  inlineData: {
                    mimeType: file.type || "audio/webm",
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Gemini transcription request failed (${response.status}): ${errorBody}`)
    }

    const data = await response.json()
    const transcript: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text

    return Response.json({ transcript: transcript?.trim() ?? "" }, { status: 200 })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to transcribe this recording right now."

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}