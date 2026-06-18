"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Light/dark toggle. Renders a stable placeholder until mounted to avoid
 *  hydration mismatch (theme is only known client-side). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Theme is only known client-side. Until mounted, render a stable state
  // (light/Moon) so server and client markup match — no hydration mismatch.
  const dark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Mode terang" : "Mode gelap"}
      title={dark ? "Mode terang" : "Mode gelap"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
