"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface GameHistoryEntry {
  id: string
  date: string
  score: number
  gridSize: number
  maxCombo: number
  duration: string
  characters: {
    berry: number
    carlo: number
    scott: number
    toli: number
    blueberry: number
  }
  ultimatesUsed?: {
    goldenHammer: number
    timeWarp: number
    comboFrenzy: number
    berryExplosion: number
  }
}

export interface PlayerStats {
  totalGames: number
  totalScore: number
  averageScore: number
  highestScore: number
  totalPlayTime: string
  favoriteGridSize: number
  highestCombo: number
  charactersWhacked: {
    berry: number
    carlo: number
    scott: number
    toli: number
    blueberry: number
  }
  ultimatesUsed: {
    goldenHammer: number
    timeWarp: number
    comboFrenzy: number
    berryExplosion: number
  }
}

interface GameHistoryContextType {
  gameHistory: GameHistoryEntry[]
  playerStats: PlayerStats
  addGameEntry: (entry: Omit<GameHistoryEntry, "id" | "date">) => void
  clearHistory: () => void
}

const GameHistoryContext = createContext<GameHistoryContextType | undefined>(undefined)

export function GameHistoryProvider({ children }: { children: React.ReactNode }) {
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    highestScore: 0,
    totalPlayTime: "00:00:00",
    favoriteGridSize: 3,
    highestCombo: 0,
    charactersWhacked: {
      berry: 0,
      carlo: 0,
      scott: 0,
      toli: 0,
      blueberry: 0,
    },
    ultimatesUsed: {
      goldenHammer: 0,
      timeWarp: 0,
      comboFrenzy: 0,
      berryExplosion: 0,
    },
  })

  // Load game history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("whackABerryGameHistory")
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory))
    }

    const savedStats = localStorage.getItem("whackABerryPlayerStats")
    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats))
    }
  }, [])

  // Save game history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("whackABerryGameHistory", JSON.stringify(gameHistory))

    // Recalculate player stats when history changes
    if (gameHistory.length > 0) {
      const totalGames = gameHistory.length
      const totalScore = gameHistory.reduce((sum, game) => sum + game.score, 0)
      const highestScore = Math.max(...gameHistory.map((game) => game.score))
      const highestCombo = Math.max(...gameHistory.map((game) => game.maxCombo))

      // Calculate favorite grid size
      const gridSizeCounts = gameHistory.reduce(
        (counts, game) => {
          counts[game.gridSize] = (counts[game.gridSize] || 0) + 1
          return counts
        },
        {} as Record<number, number>,
      )

      const favoriteGridSize = Object.entries(gridSizeCounts).sort((a, b) => b[1] - a[1])[0][0]

      // Calculate total characters whacked
      const charactersWhacked = gameHistory.reduce(
        (total, game) => {
          return {
            berry: total.berry + (game.characters.berry || 0),
            carlo: total.carlo + (game.characters.carlo || 0),
            scott: total.scott + (game.characters.scott || 0),
            toli: total.toli + (game.characters.toli || 0),
            blueberry: total.blueberry + (game.characters.blueberry || 0),
          }
        },
        { berry: 0, carlo: 0, scott: 0, toli: 0, blueberry: 0 },
      )

      // Calculate total play time
      const totalSeconds = gameHistory.reduce((sum, game) => {
        const [minutes, seconds] = game.duration.split(":").map(Number)
        return sum + minutes * 60 + seconds
      }, 0)

      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const totalPlayTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

      // Calculate ultimates used
      const ultimatesUsed = gameHistory.reduce(
        (total, game) => {
          if (!game.ultimatesUsed) return total
          return {
            goldenHammer: total.goldenHammer + (game.ultimatesUsed.goldenHammer || 0),
            timeWarp: total.timeWarp + (game.ultimatesUsed.timeWarp || 0),
            comboFrenzy: total.comboFrenzy + (game.ultimatesUsed.comboFrenzy || 0),
            berryExplosion: total.berryExplosion + (game.ultimatesUsed.berryExplosion || 0),
          }
        },
        { goldenHammer: 0, timeWarp: 0, comboFrenzy: 0, berryExplosion: 0 },
      )

      const updatedStats = {
        totalGames,
        totalScore,
        averageScore: Math.round(totalScore / totalGames),
        highestScore,
        totalPlayTime,
        favoriteGridSize: Number(favoriteGridSize),
        highestCombo,
        charactersWhacked,
        ultimatesUsed,
      }

      setPlayerStats(updatedStats)
      localStorage.setItem("whackABerryPlayerStats", JSON.stringify(updatedStats))
    }
  }, [gameHistory])

  // Add a new game entry
  const addGameEntry = (entry: Omit<GameHistoryEntry, "id" | "date">) => {
    const newEntry: GameHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }

    setGameHistory((prev) => {
      // Keep only the most recent 50 games
      const updatedHistory = [newEntry, ...prev].slice(0, 50)
      return updatedHistory
    })
  }

  // Clear game history
  const clearHistory = () => {
    setGameHistory([])
    setPlayerStats({
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      highestScore: 0,
      totalPlayTime: "00:00:00",
      favoriteGridSize: 3,
      highestCombo: 0,
      charactersWhacked: {
        berry: 0,
        carlo: 0,
        scott: 0,
        toli: 0,
        blueberry: 0,
      },
      ultimatesUsed: {
        goldenHammer: 0,
        timeWarp: 0,
        comboFrenzy: 0,
        berryExplosion: 0,
      },
    })
    localStorage.removeItem("whackABerryGameHistory")
    localStorage.removeItem("whackABerryPlayerStats")
  }

  return (
    <GameHistoryContext.Provider
      value={{
        gameHistory,
        playerStats,
        addGameEntry,
        clearHistory,
      }}
    >
      {children}
    </GameHistoryContext.Provider>
  )
}

export function useGameHistory() {
  const context = useContext(GameHistoryContext)
  if (context === undefined) {
    throw new Error("useGameHistory must be used within a GameHistoryProvider")
  }
  return context
}

