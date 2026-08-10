import "server-only"

import { prisma } from "@/lib/server/db/prisma"

class ConversationAccessDeniedError extends Error {
  constructor() {
    super("You don't have access to this conversation.")
    this.name = "ConversationAccessDeniedError"
  }
}

async function ensureConversationExists(conversationId: string, userId: string) {
  const existing = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  })

  if (existing && existing.userId !== userId) {
    throw new ConversationAccessDeniedError()
  }

  await prisma.conversation.upsert({
    where: {
      id: conversationId,
    },
    create: {
      id: conversationId,
      userId,
      title: "New chat",
    },
    update: {
      updatedAt: new Date(),
    },
  })
}

export { ensureConversationExists, ConversationAccessDeniedError }