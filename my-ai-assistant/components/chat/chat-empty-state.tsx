"use client"

import { Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { suggestedPrompts } from "./mock-data"

function ChatEmptyState({
  className,
  onPromptSelect,
}: {
  className?: string
  onPromptSelect: (prompt: string) => void
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[28rem] flex-col items-center justify-center overflow-hidden rounded-[32px] border border-dashed border-border/70 bg-background/70 px-6 py-12 text-center shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_35%,transparent),transparent)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-[28rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--accent)_55%,transparent),transparent)] blur-3xl"
      />

      <div className="relative mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Wand2 className="size-5" />
      </div>
      <p className="relative text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Ready when you are
      </p>
      <h2 className="relative mt-3 max-w-xl font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Ask a question, drop in an image or PDF, or just say hello.
      </h2>
      <p className="relative mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        Type, talk, or upload this assistant reads images and documents and
        can read its answers back to you too.
      </p>
      <div className="relative mt-8 flex w-full max-w-2xl flex-wrap justify-center gap-2">
        {suggestedPrompts.map((prompt) => (
          <Button
            key={prompt}
            type="button"
            variant="outline"
            onClick={() => onPromptSelect(prompt)}
            className="h-auto rounded-full border-border/70 bg-background px-4 py-2 text-left text-sm whitespace-normal"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}

export { ChatEmptyState }