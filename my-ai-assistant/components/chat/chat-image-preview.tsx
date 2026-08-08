"use client"

import { X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"

function ChatImagePreview({
  alt,
  src,
  title,
  onRemove,
}: {
  alt: string
  src: string
  title?: string
  onRemove?: () => void
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-border/70 bg-muted/40 shadow-sm">
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          unoptimized
          className="h-auto w-full object-cover"
        />
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
      {title ? (
        <div className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
          {title}
        </div>
      ) : null}
    </div>
  )
}

export { ChatImagePreview }