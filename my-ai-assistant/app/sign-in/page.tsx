import Image from "next/image";
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/server/auth/auth"

export default function SignInPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_35%,transparent),transparent)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] h-80 w-[32rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--accent)_60%,transparent),transparent)] blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center">
         <img src="/logo.png" alt="Logo" />
        </div>
        <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          Multimodal AI Assistant
        </h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Sign in to save your conversations and pick up where you left off.
        </p>
      </div>

      <form
        className="relative"
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