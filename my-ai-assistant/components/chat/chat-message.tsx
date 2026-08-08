"use client"

import { Bot, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ChatMessage as ChatMessageType } from "./mock-data"

function UserMessage({ message }: { message: ChatMessageType }) {
  return (
    <div className="flex items-end justify-end gap-3">
      <div className="max-w-[min(100%,42rem)] rounded-[28px] rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-lg shadow-black/10">
        <p className="whitespace-pre-wrap">{message.content}</p>
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
        <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">{message.time}</p>
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
