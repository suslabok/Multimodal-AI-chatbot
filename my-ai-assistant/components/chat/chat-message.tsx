"use client"

import { Bot, Loader2, Sparkles, Volume2, VolumeX } from "lucide-react"
import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
        <AvatarFallback className="bg-accent text-accent-foreground">
          <Bot className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[min(100%,42rem)] rounded-[28px] rounded-bl-md border border-border/70 bg-background/90 px-4 py-3 text-sm leading-6 shadow-sm backdrop-blur-sm dark:bg-card/70">
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
        <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
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