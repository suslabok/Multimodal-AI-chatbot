"use client"

import { ArrowRight, MessageSquarePlus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Conversation } from "./mock-data"

function ChatSidebar({
  conversations,
  activeConversationId,
  isOpen,
  onClose,
  onNewChat,
  onSelectConversation,
}: {
  conversations: Conversation[]
  activeConversationId: string
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onSelectConversation: (conversationId: string) => void
}) {
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[86vw] max-w-sm border-r border-border/70 bg-background/95 backdrop-blur-xl transition-transform duration-300 md:static md:z-auto md:w-[19rem] md:translate-x-0 md:bg-transparent md:backdrop-blur-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col gap-4 p-4 md:p-5">
          <div className="rounded-[28px] border border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Multimodal AI Assistant
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  Conversations
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={onClose}
                className="rounded-full md:hidden"
                aria-label="Close sidebar"
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <Button
              type="button"
              className="mt-4 w-full justify-start rounded-2xl px-4 py-3"
              onClick={onNewChat}
            >
              <MessageSquarePlus className="size-4" />
              New Chat
            </Button>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
              <Search className="size-4" />
              Search conversations
            </div>
          </div>

          <ScrollArea className="flex-1 rounded-[28px] border border-border/70 bg-card/70 shadow-sm">
            <div className="p-3">
              <div className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Recent chats
              </div>
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => onSelectConversation(conversation.id)}
                      className={cn(
                        "w-full rounded-[22px] border px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-border hover:bg-background/80",
                        isActive
                          ? "border-primary/30 bg-primary/10 shadow-sm dark:bg-primary/15"
                          : "border-transparent bg-background/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {conversation.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                            {conversation.preview}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {conversation.updatedAt}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Close sidebar backdrop"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/35 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
    </>
  )
}

export { ChatSidebar }
