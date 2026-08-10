import { auth } from "@/lib/server/auth/auth"
import { prisma } from "@/lib/server/db/prisma"

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  const payload = conversations.map((conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1]

    return {
      id: conversation.id,
      title: conversation.title,
      preview: lastMessage?.content?.slice(0, 80) || "No messages yet.",
      updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map((message) => ({
        id: message.id,
        role: message.role === "USER" ? "user" : "assistant",
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        attachment:
          message.attachmentKind === "image"
            ? {
                id: message.id,
                kind: "image" as const,
                status: "ready" as const,
                name: message.attachmentName ?? "image",
                mimeType: message.attachmentMimeType ?? "image/png",
              }
            : message.attachmentKind === "pdf"
              ? {
                  id: message.id,
                  kind: "pdf" as const,
                  status: "ready" as const,
                  name: message.attachmentName ?? "document.pdf",
                  mimeType: message.attachmentMimeType ?? "application/pdf",
                  documentId: message.uploadedFileId ?? undefined,
                }
              : undefined,
      })),
    }
  })

  return Response.json({ conversations: payload }, { status: 200 })
}