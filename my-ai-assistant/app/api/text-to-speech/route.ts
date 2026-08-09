const geminiApiKey = process.env.AI_API_KEY
const ttsModel = "gemini-2.5-flash-preview-tts"
const voiceName = "Kore"
const sampleRate = 24000
const channels = 1
const bitsPerSample = 16

const maxTextLength = 2000

// Gemini's TTS models return raw 16-bit PCM audio (no container), so we
// have to wrap it in a standard WAV header ourselves before the browser's
// <audio> element can play it.
function pcmToWav(pcmData: Buffer): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8
  const blockAlign = (channels * bitsPerSample) / 8
  const dataSize = pcmData.length
  const header = Buffer.alloc(44)

  header.write("RIFF", 0, "ascii")
  header.writeUInt32LE(36 + dataSize, 4)
  header.write("WAVE", 8, "ascii")
  header.write("fmt ", 12, "ascii")
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM format
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write("data", 36, "ascii")
  header.writeUInt32LE(dataSize, 40)

  return Buffer.concat([header, pcmData])
}

export async function POST(request: Request) {
  if (!geminiApiKey) {
    return Response.json(
      { error: "Missing AI_API_KEY environment variable." },
      { status: 500 }
    )
  }

  const body = (await request.json()) as { text?: string }
  const text = body.text?.trim()

  if (!text) {
    return Response.json({ error: "No text was provided." }, { status: 400 })
  }

  const truncatedText = text.length > maxTextLength ? text.slice(0, maxTextLength) : text

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${ttsModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: truncatedText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Gemini TTS request failed (${response.status}): ${errorBody}`)
    }

    const data = await response.json()
    const base64Audio: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

    if (!base64Audio) {
      throw new Error("No audio was returned by the model.")
    }

    const pcmBuffer = Buffer.from(base64Audio, "base64")
    const wavBuffer = pcmToWav(pcmBuffer)

    return new Response(wavBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(wavBuffer.length),
      },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to generate speech right now."

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}