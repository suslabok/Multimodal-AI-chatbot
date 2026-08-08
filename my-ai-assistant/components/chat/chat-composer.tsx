"use client"

import { Paperclip, Mic, SendHorizonal } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ChatImagePreview } from "./chat-image-preview"
import type { ChatAttachment } from "./mock-data"

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"]
const maxImageSizeBytes = 8 * 1024 * 1024

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Unable to read image file."))
    }

    reader.onerror = () => reject(new Error("Unable to read image file."))
    reader.readAsDataURL(file)
  })
}

function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  attachment,
  attachmentError,
  onAttachmentChange,
  onAttachmentError,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSending: boolean
  attachment: ChatAttachment | null
  attachmentError: string | null
  onAttachmentChange: (attachment: ChatAttachment | null) => void
  onAttachmentError: (error: string | null) => void
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!allowedImageTypes.includes(file.type)) {
      onAttachmentError("Only JPG, JPEG, PNG, and WEBP files are supported.")
      event.target.value = ""
      return
    }

    if (file.size > maxImageSizeBytes) {
      onAttachmentError("Images must be smaller than 8 MB.")
      event.target.value = ""
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      onAttachmentChange({
        name: file.name,
        dataUrl,
        mimeType: file.type,
      })
      onAttachmentError(null)
    } catch {
      onAttachmentError("Could not read that image. Please try another file.")
    } finally {
      event.target.value = ""
    }
  }

  React.useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = "0px"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
  }, [value])

  return (
    <div className="rounded-[32px] border border-border/70 bg-background/85 p-3 shadow-lg shadow-black/5 backdrop-blur-xl sm:p-4">
      <div className="flex flex-col gap-3">
        {attachment ? (
          <ChatImagePreview
            src={attachment.dataUrl}
            alt={attachment.name}
            title={attachment.name}
            onRemove={() => {
              onAttachmentChange(null)
              onAttachmentError(null)
            }}
          />
        ) : null}

        {attachmentError ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {attachmentError}
          </p>
        ) : null}

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Message the assistant..."
          rows={1}
          className={cn(
            "min-h-14 resize-none rounded-[24px] border-border/70 bg-background/80 px-4 py-3 text-[15px] leading-6 shadow-inner shadow-black/5"
          )}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
            }
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-full border-border/70 bg-background/80"
              aria-label="Attach file"
              onClick={handleFileClick}
              disabled={isSending}
            >
              <Paperclip className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-full border-border/70 bg-background/80"
              aria-label="Use microphone"
              disabled={isSending}
            >
              <Mic className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSending || (!value.trim() && !attachment)}
            className="min-w-24 rounded-full px-5"
          >
            <SendHorizonal className="size-4" />
            {isSending ? "Sending" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ChatComposer }
