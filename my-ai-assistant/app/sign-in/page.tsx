import { Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/server/auth/auth"

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
          <Bot className="size-6" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Multimodal AI Assistant</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Sign in to save your conversations and pick up where you left off.
        </p>
      </div>

      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/" })
        }}
      >
        <Button type="submit" className="min-w-56 rounded-full">
          Sign in with Google
        </Button>
      </form>
    </div>
  )
}