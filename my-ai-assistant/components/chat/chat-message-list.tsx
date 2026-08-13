"use client"

import { ChatEmptyState } from "./chat-empty-state"
import { ChatMessageItem } from "./chat-message"
import type { ChatMessage } from "./mock-data"
import { ScrollArea } from "@/components/ui/scroll-area"

function ChatMessageList({
  messages,
  onPromptSelect,
}: {
  messages: ChatMessage[]
  onPromptSelect: (prompt: string) => void
}) {
  if (messages.length === 0) {
    return (
      <ChatEmptyState className="min-h-[36rem]" onPromptSelect={onPromptSelect} />
    )
  }

  return (
    <ScrollArea className="h-full rounded-[32px] border border-border/70 bg-background/75 shadow-sm backdrop-blur-sm">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,var(--background),color-mix(in_oklch,var(--background)_85%,var(--primary)_15%))] p-5 shadow-sm">
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Chat with your multimodal assistant workspace.
          </h2>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

export { ChatMessageList }
