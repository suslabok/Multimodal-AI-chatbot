"use client"

import { Loader2, Sparkles, Volume2, VolumeX } from "lucide-react"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
  const [audioState, setAudioState] = React.useState<"idle" | "loading" | "playing">("idle")
  const [speechError, setSpeechError] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = React.useRef<string | null>(null)

  const cleanupAudio = () => {
    audioRef.current?.pause()
    audioRef.current = null

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  React.useEffect(() => {
    return () => cleanupAudio()
  }, [])

  const handleSpeakClick = async () => {
    if (audioState === "playing") {
      cleanupAudio()
      setAudioState("idle")
      return
    }

    if (audioState === "loading" || !message.content) {
      return
    }

    setSpeechError(null)
    setAudioState("loading")

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.content }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Unable to generate speech.")
      }

      const audioBlob = await response.blob()
      const objectUrl = URL.createObjectURL(audioBlob)
      objectUrlRef.current = objectUrl

      const audio = new Audio(objectUrl)
      audioRef.current = audio

      audio.addEventListener("ended", () => {
        cleanupAudio()
        setAudioState("idle")
      })

      await audio.play()
      setAudioState("playing")
    } catch (error) {
      setSpeechError(error instanceof Error ? error.message : "Unable to generate speech.")
      setAudioState("idle")
    }
  }

  return (
    <div className="flex items-end gap-3">
      <Avatar size="sm" className="hidden ring-1 ring-border md:flex">
        <AvatarImage src="/logo.png" alt="Assistant" />
        <AvatarFallback className="bg-accent text-accent-foreground">AI</AvatarFallback>
      </Avatar>
      <div className="max-w-[min(100%,42rem)] rounded-[28px] rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            Assistant
          </div>
          {message.status !== "streaming" && message.content ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 rounded-full text-muted-foreground hover:text-foreground"
              aria-label={audioState === "playing" ? "Stop speaking" : "Read response aloud"}
              onClick={handleSpeakClick}
            >
              {audioState === "loading" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : audioState === "playing" ? (
                <VolumeX className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
            </Button>
          ) : null}
        </div>
        {message.status === "streaming" && !message.content ? (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            Generating response...
          </div>
        ) : null}
        {message.content ? (
          <div
            className={cn(
              "prose prose-sm max-w-none text-foreground",
              "prose-headings:font-heading prose-headings:font-medium prose-headings:text-foreground",
              "prose-p:my-2 prose-p:leading-6 first:prose-p:mt-0 last:prose-p:mb-0",
              "prose-strong:text-foreground prose-strong:font-semibold",
              "prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4 hover:prose-a:text-primary/80",
              "prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[13px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
              "prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:text-foreground",
              "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
              "prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground",
              "prose-hr:border-border",
              "prose-table:text-sm prose-th:border-border prose-td:border-border"
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        ) : null}
        {speechError ? (
          <p className="mt-2 text-[11px] text-destructive">{speechError}</p>
        ) : null}
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