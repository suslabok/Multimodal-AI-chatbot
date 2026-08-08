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
        "flex min-h-[28rem] flex-col items-center justify-center rounded-[32px] border border-dashed border-border/70 bg-background/70 px-6 py-12 text-center shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-black/10 dark:bg-secondary dark:text-secondary-foreground">
        <Wand2 className="size-5" />
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Ready when you are
      </p>
      <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Start a new conversation and the interface will keep the rest of the
        workspace in sync.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        This Phase 1 build uses mock content only, so you can explore the full
        layout, message flow, and responsive behavior before wiring in any real
        AI features.
      </p>
      <div className="mt-8 flex w-full max-w-2xl flex-wrap justify-center gap-2">
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
