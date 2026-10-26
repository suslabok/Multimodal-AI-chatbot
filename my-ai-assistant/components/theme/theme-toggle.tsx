"use client"

import { MoonStar, SunMedium } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // Until the page has loaded in the browser, assume light mode so the server
  // render and the first browser render match. Then switch to the real theme.
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="rounded-full border-border/70 bg-background/80 backdrop-blur-sm"
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  )
}

export { ThemeToggle }