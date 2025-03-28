"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  type SkillId,
  type PlayerSkills,
  initialPlayerSkills,
  unlockSkill,
  addExperience,
  applySkillEffects,
  type SkillEffectType,
} from "./skills"

interface SkillsContextType {
  playerSkills: PlayerSkills
  skillEffects: Record<SkillEffectType, number>
  unlockSkill: (skillId: SkillId) => void
  addExperience: (amount: number) => void
  resetSkills: () => void
}

const SkillsContext = createContext<SkillsContextType | undefined>(undefined)

export function SkillsProvider({ children }: { children: React.ReactNode }) {
  const [playerSkills, setPlayerSkills] = useState<PlayerSkills>(initialPlayerSkills)
  const [skillEffects, setSkillEffects] = useState<Record<SkillEffectType, number>>(
    applySkillEffects(initialPlayerSkills.unlockedSkills),
  )

  // Load skills from localStorage on mount
  useEffect(() => {
    const savedSkills = localStorage.getItem("whackABerryPlayerSkills")
    if (savedSkills) {
      try {
        const parsedSkills = JSON.parse(savedSkills)
        setPlayerSkills(parsedSkills)
        setSkillEffects(applySkillEffects(parsedSkills.unlockedSkills))
      } catch (error) {
        console.error("Error loading skills from localStorage:", error)
      }
    }
  }, [])

  // Save skills to localStorage when they change
  useEffect(() => {
    localStorage.setItem("whackABerryPlayerSkills", JSON.stringify(playerSkills))
  }, [playerSkills])

  // Unlock a skill
  const handleUnlockSkill = (skillId: SkillId) => {
    setPlayerSkills((prevSkills) => {
      const updatedSkills = unlockSkill(prevSkills, skillId)
      // If skills were updated, update effects
      if (updatedSkills !== prevSkills) {
        setSkillEffects(applySkillEffects(updatedSkills.unlockedSkills))
      }
      return updatedSkills
    })
  }

  // Add experience
  const handleAddExperience = (amount: number) => {
    setPlayerSkills((prevSkills) => {
      const updatedSkills = addExperience(prevSkills, amount)
      return updatedSkills
    })
  }

  // Reset skills
  const resetSkills = () => {
    setPlayerSkills(initialPlayerSkills)
    setSkillEffects(applySkillEffects(initialPlayerSkills.unlockedSkills))
    localStorage.removeItem("whackABerryPlayerSkills")
  }

  return (
    <SkillsContext.Provider
      value={{
        playerSkills,
        skillEffects,
        unlockSkill: handleUnlockSkill,
        addExperience: handleAddExperience,
        resetSkills,
      }}
    >
      {children}
    </SkillsContext.Provider>
  )
}

export function useSkills() {
  const context = useContext(SkillsContext)
  if (context === undefined) {
    throw new Error("useSkills must be used within a SkillsProvider")
  }
  return context
}

