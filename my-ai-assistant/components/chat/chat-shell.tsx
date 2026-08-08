"use client"

import { Menu, MessageSquareText, Plus } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import {
  type ChatAttachment,
  initialConversations,
  type ChatMessage,
  type Conversation,
} from "./mock-data"
import { ChatComposer } from "./chat-composer"
import { ChatMessageList } from "./chat-message-list"
import { ChatSidebar } from "./chat-sidebar"

type ModelMessagePart =
  | { type: "text"; text: string }
  | { type: "file"; data: string; mediaType: string; filename?: string }

type ChatRequestMessage = {
  role: "user" | "assistant"
  content: string | ModelMessagePart[]
}

function toRequestMessage(message: ChatMessage): ChatRequestMessage {
  if (!message.image) {
    return {
      role: message.role,
      content: message.content,
    }
  }

  const parts: ModelMessagePart[] = [
    {
      type: "file",
      data: message.image.dataUrl,
      mediaType: message.image.mimeType,
      filename: message.image.name,
    },
  ]

  if (message.content.trim()) {
    parts.push({
      type: "text",
      text: message.content,
    })
  }

  return {
    role: message.role,
    content: parts,
  }
}

function ChatShell() {
  const [conversations, setConversations] = React.useState(initialConversations)
  const [activeConversationId, setActiveConversationId] = React.useState(
    initialConversations[0]?.id ?? ""
  )
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState<ChatAttachment | null>(null)
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null)
  const [isSending, setIsSending] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  )

  const updateConversation = React.useCallback(
    (conversationId: string, updater: (conversation: Conversation) => Conversation) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId ? updater(conversation) : conversation
        )
      )
    },
    []
  )

  const handleNewChat = React.useCallback(() => {
    const id = `conv-${crypto.randomUUID()}`
    const newConversation: Conversation = {
      id,
      title: "New chat",
      preview: "Fresh thread ready for a prompt.",
      updatedAt: "Just now",
      messages: [],
    }

    setConversations((current) => [newConversation, ...current])
    setActiveConversationId(id)
    setDraft("")
    setSidebarOpen(false)
  }, [])

  const handleSelectConversation = React.useCallback((conversationId: string) => {
    setActiveConversationId(conversationId)
    setSidebarOpen(false)
  }, [])

  const handleSend = React.useCallback(() => {
    const trimmed = draft.trim()

    if ((!trimmed && !selectedImage) || !activeConversation) {
      return
    }

    if (isSending) {
      return
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      image: selectedImage ?? undefined,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    const assistantMessageId = `msg-${Date.now() + 1}`
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      time: "Generating...",
      status: "streaming",
    }

    const requestMessages = [...activeConversation.messages, userMessage].map(
      toRequestMessage
    )

    setIsSending(true)
    setDraft("")
    setErrorMessage(null)
    setAttachmentError(null)
    setSelectedImage(null)

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      title:
        conversation.title === "New chat"
          ? (trimmed || "Image message").slice(0, 42)
          : conversation.title,
      preview: trimmed || (selectedImage ? "Image attached" : trimmed),
      updatedAt: "Just now",
      messages: [...conversation.messages, userMessage, assistantPlaceholder],
    }))

    void (async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: requestMessages }),
        })

        if (!response.ok || !response.body) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ""

        while (true) {
          const { value, done } = await reader.read()

          if (done) {
            break
          }

          assistantContent += decoder.decode(value, { stream: true })

          updateConversation(activeConversation.id, (conversation) => ({
            ...conversation,
            preview: assistantContent || "Generating response...",
            updatedAt: "Just now",
            messages: conversation.messages.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: assistantContent,
                    status: "streaming",
                  }
                : message
            ),
          }))
        }

        assistantContent += decoder.decode()

        updateConversation(activeConversation.id, (conversation) => ({
          ...conversation,
          preview: assistantContent,
          updatedAt: "Just now",
          messages: conversation.messages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: assistantContent,
                }
              : message
          ),
        }))
      } catch {
        const fallbackMessage =
          "I hit an error while generating a response. Please try again."

        setErrorMessage(fallbackMessage)
        updateConversation(activeConversation.id, (conversation) => ({
          ...conversation,
          preview: fallbackMessage,
          updatedAt: "Just now",
          messages: conversation.messages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: fallbackMessage,
                  status: undefined,
                }
              : message
          ),
        }))
      } finally {
        setIsSending(false)
      }
    })()
  }, [activeConversation, draft, isSending, selectedImage, updateConversation])

  const handlePromptSelect = React.useCallback(
    (prompt: string) => {
      setDraft(prompt)
    },
    []
  )

  const displayedMessages = activeConversation?.messages ?? []
  const activeTitle = activeConversation?.title ?? "Chat"

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--primary)/8%,transparent_30%),radial-gradient(circle_at_top_right,var(--foreground)/6%,transparent_28%),linear-gradient(to_bottom,var(--background),color-mix(in_oklch,var(--background)_92%,var(--foreground)_8%))] text-foreground">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_16%,transparent),transparent)] opacity-70" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1600px] gap-0 px-3 py-3 sm:px-4 lg:px-5">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
        />

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[36px] border border-border/70 bg-card/65 shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setSidebarOpen(true)}
                className="rounded-full border-border/70 bg-background/80 md:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleNewChat}
                className="hidden rounded-full border-border/70 bg-background/80 md:inline-flex"
                aria-label="Start a new chat"
              >
                <Plus className="size-4" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {activeTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mock chat workspace · no API connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                <MessageSquareText className="size-3.5" />
                {displayedMessages.length} messages
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-5">
            <section className="min-h-0 flex-1">
              <ChatMessageList
                messages={displayedMessages}
                onPromptSelect={handlePromptSelect}
              />
            </section>

            {errorMessage ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}

            <section className="pb-1">
              <ChatComposer
                value={draft}
                onChange={setDraft}
                onSubmit={handleSend}
                isSending={isSending}
                attachment={selectedImage}
                attachmentError={attachmentError}
                onAttachmentChange={setSelectedImage}
                onAttachmentError={setAttachmentError}
              />
            </section>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/70 to-transparent" />
        </main>
      </div>
    </div>
  )
}

export { ChatShell }
