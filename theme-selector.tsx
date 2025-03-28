"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/lib/theme-context"
import { themes } from "@/lib/themes"

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 py-1 h-8">
          <Palette className="h-4 w-4" />
          <span className="text-xs">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.values(themes).map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            className={`flex items-center gap-2 cursor-pointer ${theme === themeOption.id ? "bg-muted" : ""}`}
            onClick={() => {
              setTheme(themeOption.id)
              setOpen(false)
            }}
          >
            <div
              className="h-4 w-4 rounded-full border"
              style={{
                background:
                  themeOption.id === "berry"
                    ? "linear-gradient(to right, #FF69B4, #FF1493)"
                    : themeOption.id === "forest"
                      ? "linear-gradient(to right, #32CD32, #228B22)"
                      : themeOption.id === "beach"
                        ? "linear-gradient(to right, #FFA500, #FF8C00)"
                        : "linear-gradient(to right, #9370DB, #8A2BE2)",
              }}
            />
            <span>{themeOption.name}</span>
            {theme === themeOption.id && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

