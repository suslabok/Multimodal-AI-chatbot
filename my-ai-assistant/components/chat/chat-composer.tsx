"use client"

import { Paperclip, Mic, SendHorizonal } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSending,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSending: boolean
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-full border-border/70 bg-background/80"
              aria-label="Attach file"
            >
              <Paperclip className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-full border-border/70 bg-background/80"
              aria-label="Use microphone"
            >
              <Mic className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSending || !value.trim()}
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
