"use client"

import { Bot, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChatAttachmentPreview } from "./chat-image-preview"
import type { ChatMessage as ChatMessageType } from "./mock-data"

function UserMessage({ message }: { message: ChatMessageType }) {
  const attachment = message.attachment

  return (
    <div className="flex items-end justify-end gap-3">
      <div className="max-w-[min(100%,42rem)] rounded-[28px] rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-lg shadow-black/10">
        <div className="space-y-3">
          {attachment ? (
            <ChatAttachmentPreview
              kind={attachment.kind}
              src={attachment.dataUrl}
              alt={attachment.name}
              title={attachment.name}
              status={attachment.status}
              statusMessage={
                attachment.kind === "pdf"
                  ? attachment.status === "processing"
                    ? "Processing..."
                    : attachment.status === "error"
                      ? attachment.errorMessage ?? "Upload failed"
                      : `Ready${attachment.pageCount ? ` · ${attachment.pageCount} pages` : ""}`
                  : "Image ready"
              }
            />
          ) : null}
          {message.content ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : null}
        </div>
        <p className="mt-2 text-right text-[11px] text-primary-foreground/70">
          {message.time}
        </p>
      </div>
      <Avatar size="sm" className="hidden ring-1 ring-border md:flex">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          You
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

function AssistantMessage({ message }: { message: ChatMessageType }) {
  return (
    <div className="flex items-end gap-3">
      <Avatar size="sm" className="hidden ring-1 ring-border md:flex">
        <AvatarFallback className="bg-foreground text-background">
          <Bot className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[min(100%,42rem)] rounded-[28px] rounded-bl-md border border-border/70 bg-background/90 px-4 py-3 text-sm leading-6 shadow-sm backdrop-blur-sm dark:bg-card/70">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          Assistant
        </div>
        {message.status === "streaming" && !message.content ? (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            Generating response...
          </div>
        ) : null}
        <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {message.status === "streaming" ? "Generating..." : message.time}
        </p>
      </div>
    </div>
  )
}

function ChatMessageItem({ message }: { message: ChatMessageType }) {
  return message.role === "user" ? (
    <UserMessage message={message} />
  ) : (
    <AssistantMessage message={message} />
  )
}

export { AssistantMessage, ChatMessageItem, UserMessage }
