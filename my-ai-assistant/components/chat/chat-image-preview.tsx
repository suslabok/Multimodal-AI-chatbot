"use client"

import { FileText, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"

type ChatAttachmentPreviewProps = {
  kind: "image" | "pdf"
  src?: string
  alt: string
  title?: string
  status?: "uploading" | "processing" | "ready" | "error"
  statusMessage?: string
  onRemove?: () => void
}

function ChatAttachmentPreview({
  kind,
  src,
  alt,
  title,
  status,
  statusMessage,
  onRemove,
}: ChatAttachmentPreviewProps) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-border/70 bg-muted/40 shadow-sm">
      <div className="relative flex min-h-40 items-center justify-center bg-background/80 p-4">
        {kind === "image" && src ? (
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            unoptimized
            className="h-auto w-full rounded-[18px] object-cover"
          />
        ) : (
          <div className="flex w-full items-center gap-3 rounded-[18px] border border-border/70 bg-background/95 px-4 py-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {title ?? alt}
              </p>
              <p className="text-xs text-muted-foreground">
                {statusMessage ?? "Ready"}
              </p>
            </div>
          </div>
        )}
        {onRemove ? (
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={onRemove}
            className="absolute top-2 right-2 rounded-full bg-background/90 text-foreground shadow-md backdrop-blur-sm"
            aria-label="Remove attached image"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      {title && kind === "image" ? (
        <div className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
          {title}
        </div>
      ) : null}
    </div>
  )
}

export { ChatAttachmentPreview }