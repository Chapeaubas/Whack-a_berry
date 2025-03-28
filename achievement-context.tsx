"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSkills } from "@/lib/skills-context"

// Achievement type definition
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: {
    type: "score" | "combo" | "character" | "grid" | "skill" | "time" | "special"
    target: number
    characterType?: "berry" | "carlo" | "scott" | "toli" | "blueberry"
  }
  reward?: {
    type: "xp" | "skillPoint" | "cosmetic"
    amount: number
    itemId?: string
  }
  tier: 1 | 2 | 3 // Bronze, Silver, Gold
  completed: boolean
  progress: number
  completedDate?: string
  secret?: boolean // Hidden until discovered
}

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: "1",
    name: "Berry Master",
    description: "Score 100 points in a single game",
    icon: "🍓",
    requirement: { type: "score", target: 100 },
    reward: { type: "xp", amount: 50 },
    tier: 1,
    completed: false,
    progress: 0,
  },
  {
    id: "2",
    name: "Combo King",
    description: "Reach a 20x combo",
    icon: "⚡",
    requirement: { type: "combo", target: 20 },
    reward: { type: "xp", amount: 75 },
    tier: 2,
    completed: false,
    progress: 0,
  },
  {
    id: "3",
    name: "Speed Demon",
    description: "Complete a game in under 60 seconds",
    icon: "⏱️",
    requirement: { type: "time", target: 60 },
    reward: { type: "xp", amount: 50 },
    tier: 1,
    completed: false,
    progress: 0,
  },
  {
    id: "4",
    name: "Grid Master",
    description: "Win on a 6x6 grid",
    icon: "🎮",
    requirement: { type: "grid", target: 6 },
    reward: { type: "xp", amount: 100 },
    tier: 3,
    completed: false,
    progress: 0,
  },
  {
    id: "5",
    name: "Skill Tree Guru",
    description: "Unlock 10 skills",
    icon: "🌳",
    requirement: { type: "skill", target: 10 },
    reward: { type: "skillPoint", amount: 1 },
    tier: 2,
    completed: false,
    progress: 0,
  },
  {
    id: "6",
    name: "Blueberry Hunter",
    description: "Hit 50 blueberries",
    icon: "🫐",
    requirement: { type: "character", target: 50, characterType: "blueberry" },
    reward: { type: "xp", amount: 125 },
    tier: 3,
    completed: false,
    progress: 0,
  },
]

// Context type
interface AchievementContextType {
  achievements: Achievement[]
  progress: Record<string, number>
  updateProgress: (type: string, value: number, characterType?: string) => void
  claimReward: (achievementId: string) => void
  latestAchievement: Achievement | null
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null)
  const { addExperience } = useSkills()

  // Load achievements from localStorage on mount
  useEffect(() => {
    const savedAchievements = localStorage.getItem("whackABerryAchievements")
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements))
    }

    const savedProgress = localStorage.getItem("whackABerryAchievementProgress")
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  // Save achievements to localStorage when they change
  useEffect(() => {
    localStorage.setItem("whackABerryAchievements", JSON.stringify(achievements))
  }, [achievements])

  // Save progress to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("whackABerryAchievementProgress", JSON.stringify(progress))
  }, [progress])

  // Update achievement progress
  const updateProgress = (type: string, value: number, characterType?: string) => {
    // Update progress for matching achievements
    let newlyCompleted = null

    setAchievements((prev) => {
      const updated = prev.map((achievement) => {
        if (
          achievement.requirement.type === type &&
          (!characterType || achievement.requirement.characterType === characterType)
        ) {
          // Calculate new progress
          const newProgress = Math.min(value / achievement.requirement.target, 1)

          // Check if achievement is newly completed
          const isNewlyCompleted = !achievement.completed && newProgress >= 1

          if (isNewlyCompleted) {
            newlyCompleted = {
              ...achievement,
              progress: newProgress,
              completed: true,
              completedDate: new Date().toISOString(),
            }
          }

          return {
            ...achievement,
            progress: newProgress,
            completed: newProgress >= 1,
            completedDate: isNewlyCompleted ? new Date().toISOString() : achievement.completedDate,
          }
        }
        return achievement
      })

      return updated
    })

    // Update raw progress tracking
    setProgress((prev) => ({
      ...prev,
      [type + (characterType ? `-${characterType}` : "")]: Math.max(
        prev[type + (characterType ? `-${characterType}` : "")] || 0,
        value,
      ),
    }))

    // If a new achievement was completed, set it as latest and grant reward
    if (newlyCompleted) {
      setLatestAchievement(newlyCompleted)

      // Grant reward
      if (newlyCompleted.reward) {
        if (newlyCompleted.reward.type === "xp") {
          addExperience(newlyCompleted.reward.amount)
        } else if (newlyCompleted.reward.type === "skillPoint") {
          // Handle skill point reward
          // This would require modifying the skills context to support adding skill points directly
        }
      }

      // Clear the notification after 5 seconds
      setTimeout(() => {
        setLatestAchievement(null)
      }, 5000)
    }
  }

  // Claim a reward for an achievement
  const claimReward = (achievementId: string) => {
    setAchievements((prev) => {
      return prev.map((achievement) => {
        if (achievement.id === achievementId && achievement.completed && achievement.reward) {
          // Process reward...
          return { ...achievement, rewardClaimed: true }
        }
        return achievement
      })
    })
  }

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        progress,
        updateProgress,
        claimReward,
        latestAchievement,
      }}
    >
      {children}
    </AchievementContext.Provider>
  )
}

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error("useAchievements must be used within an AchievementProvider")
  }
  return context
}

