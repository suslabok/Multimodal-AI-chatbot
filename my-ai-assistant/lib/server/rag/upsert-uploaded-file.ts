import "server-only"

import { prisma } from "@/lib/server/db/prisma"

async function ensureConversationExists(conversationId: string) {
  await prisma.conversation.upsert({
    where: {
      id: conversationId,
    },
    create: {
      id: conversationId,
      title: "New chat",
    },
    update: {
      updatedAt: new Date(),
    },
  })
}

export { ensureConversationExists }