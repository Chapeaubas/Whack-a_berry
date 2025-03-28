import type React from "react"
import { Inter, Bangers } from "next/font/google"
import "./globals.css"
import AbstractWalletWrapper from "@/components/abstract-wallet-wrapper"
import { ThemeProvider } from "@/lib/theme-context"
import { SkillsProvider } from "@/lib/skills-context"
import { AchievementProvider } from "@/contexts/achievement-context"
import { GameHistoryProvider } from "@/contexts/game-history-context"

const inter = Inter({ subsets: ["latin"] })
const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
})

export const metadata = {
  title: "Whack-a-Berry Game",
  description: "A fun berry-whacking game with skills and upgrades",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${bangers.variable}`}>
        <ThemeProvider>
          <SkillsProvider>
            <AchievementProvider>
              <GameHistoryProvider>
                <AbstractWalletWrapper>{children}</AbstractWalletWrapper>
              </GameHistoryProvider>
            </AchievementProvider>
          </SkillsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'