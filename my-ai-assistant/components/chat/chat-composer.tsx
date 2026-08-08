"use client"

import { Paperclip, Mic, SendHorizonal } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ChatAttachmentPreview } from "./chat-image-preview"
import type { ChatAttachment } from "./mock-data"

const allowedFileTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
const maxAttachmentSizeBytes = 20 * 1024 * 1024

function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  attachment,
  attachmentError,
  isUploadingAttachment,
  onAttachmentSelected,
  onAttachmentError,
  onAttachmentRemoved,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSending: boolean
  attachment: ChatAttachment | null
  attachmentError: string | null
  isUploadingAttachment: boolean
  onAttachmentSelected: (file: File) => void
  onAttachmentError: (error: string | null) => void
  onAttachmentRemoved: () => void
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

    if (!allowedFileTypes.includes(file.type)) {
      onAttachmentError("Only JPG, JPEG, PNG, WEBP, and PDF files are supported.")
      event.target.value = ""
      return
    }

    if (file.size > maxAttachmentSizeBytes) {
      onAttachmentError("Files must be smaller than 20 MB.")
      event.target.value = ""
      return
    }

    onAttachmentError(null)
    onAttachmentSelected(file)
    event.target.value = ""
  }

  const statusMessage = attachment
    ? attachment.kind === "pdf"
      ? attachment.status === "processing"
        ? "Processing..."
        : attachment.status === "error"
          ? attachment.errorMessage ?? "Upload failed"
          : `Ready${attachment.pageCount ? ` · ${attachment.pageCount} pages` : ""}`
      : "Image ready"
    : null

  const canSend = Boolean(value.trim()) || attachment?.kind === "image"

  const removeAttachment = () => {
    onAttachmentRemoved()
    onAttachmentError(null)
  }

  const allowSend = canSend && !isUploadingAttachment

  React.useEffect(() => {
    if (!attachment && attachmentError) {
      onAttachmentError(null)
    }
  }, [attachment, attachmentError, onAttachmentError])

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
          <ChatAttachmentPreview
            kind={attachment.kind}
            src={attachment.dataUrl}
            alt={attachment.name}
            title={attachment.name}
            status={attachment.status}
            statusMessage={statusMessage ?? undefined}
            onRemove={removeAttachment}
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
          accept="image/jpeg,image/png,image/webp,application/pdf"
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
              disabled={isSending || isUploadingAttachment}
            >
              <Paperclip className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-full border-border/70 bg-background/80"
              aria-label="Use microphone"
              disabled={isSending || isUploadingAttachment}
            >
              <Mic className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSending || isUploadingAttachment || !allowSend}
            className="min-w-24 rounded-full px-5"
          >
            <SendHorizonal className="size-4" />
            {isSending ? "Sending" : isUploadingAttachment ? "Processing" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ChatComposer }
