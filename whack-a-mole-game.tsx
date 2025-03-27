"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Timer, Zap, Info, Trophy, Play, Clock, Home, Star, Award, Sparkles, User } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Bangers } from "next/font/google"
import { fetchLeaderboard, addLeaderboardEntry, getHighScore } from "@/lib/leaderboard"

// Add this import at the top of the file
import { useTheme } from "@/lib/theme-context"
import ThemeSelector from "@/components/theme-selector"
import { defaultTheme, themes } from "@/lib/themes"

// Add the SkillsProvider import at the top of the file
import { useSkills } from "@/lib/skills-context"
import SkillsView from "@/components/skills-view"
// Add the UltimateAbilities import at the top of the file
import UltimateAbilities from "@/components/ultimate-abilities"

// Add these imports at the top of the file
import { useAchievements } from "@/contexts/achievement-context"
import { useGameHistory } from "@/contexts/game-history-context"
import { AchievementNotification } from "@/components/achievement-notification"
import ProfilePage from "@/components/profile-page"

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
})

type LeaderboardEntry = {
  id: string
  name: string
  score: number
  date: string
  gridSize: number
  maxCombo?: number
}

type CharacterType = "berry" | "carlo" | "scott" | "toli" | "blueberry"

type HoleContent = {
  visible: boolean
  character: CharacterType | null
  timerId?: NodeJS.Timeout | null
  fadeOut?: boolean
}

// Add 'skills' to the GameView type
type GameView = "menu" | "game" | "info" | "leaderboard" | "name-input" | "skills" | "profile"
type GridSize = 3 | 4 | 5 | 6

// Add this after the GridSize type
type PowerUpType = "freeze" | "double" | "slow"

type PowerUp = {
  type: PowerUpType
  active: boolean
  endTime: number | null
  position: number | null
}

export default function WhackAMoleGame() {
  const [view, setView] = useState<GameView>("menu")
  const [gridSize, setGridSize] = useState<GridSize>(3)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameActive, setGameActive] = useState(false)
  const [holes, setHoles] = useState<HoleContent[]>([])
  const [highScore, setHighScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [lastScoreChange, setLastScoreChange] = useState<{ value: number; timestamp: number } | null>(null)
  const [timeSpeedUp, setTimeSpeedUp] = useState(false)
  const [timeSpeedUpEndTime, setTimeSpeedUpEndTime] = useState<number | null>(null)
  const [timeBonus, setTimeBonus] = useState<{ amount: number; timestamp: number } | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [finalScore, setFinalScore] = useState(0)
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; color: string; speed: number }[]>([])
  const [showParticles, setShowParticles] = useState(false)
  const [whackEffect, setWhackEffect] = useState<{ index: number; timestamp: number } | null>(null)
  const [hammerPosition, setHammerPosition] = useState<{ x: number; y: number } | null>(null)
  const [showHammer, setShowHammer] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [showHooray, setShowHooray] = useState(false)

  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [comboTimeLeft, setComboTimeLeft] = useState(0)

  // Blue berry special character state
  const [blueberryCount, setBlueberryCount] = useState(0)
  const [blueberryMultiplier, setBlueberryMultiplier] = useState(1)
  const [blueberryMultiplierActive, setBlueberryMultiplierActive] = useState(false)
  const [blueberryMultiplierEndTime, setBlueberryMultiplierEndTime] = useState<number | null>(null)
  const maxBlueberryAppearances = 3
  const blueberryTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Add this inside the WhackAMoleGame component, near the top with other state variables
  const { currentTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Add these state variables after the existing state variables
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: "freeze", active: false, endTime: null, position: null },
    { type: "double", active: false, endTime: null, position: null },
    { type: "slow", active: false, endTime: null, position: null },
    { type: "slow", active: false, endTime: null, position: null },
  ])
  const [powerUpChance, setPowerUpChance] = useState(0.05) // 5% chance per spawn cycle
  const [lastPowerUpTime, setLastPowerUpTime] = useState(0)
  const powerUpMinInterval = 10000 // Minimum 10 seconds between power-ups

  // Add state for ultimate ability charges
  const [goldenHammerCharges, setGoldenHammerCharges] = useState(0)
  const [timeWarpCharges, setTimeWarpCharges] = useState(0)
  const [comboFrenzyCharges, setComboFrenzyCharges] = useState(0)
  const [berryExplosionCharges, setBerryExplosionCharges] = useState(0)
  const [comboFrenzyActive, setComboFrenzyActive] = useState(false)
  const [comboFrenzyEndTime, setComboFrenzyEndTime] = useState<number | null>(null)
  const comboFrenzyRef = useRef<NodeJS.Timeout | null>(null)

  // Visual enhancement states
  const [backgroundIntensity, setBackgroundIntensity] = useState(1)
  const [dayNightProgress, setDayNightProgress] = useState(0)
  const [ambientParticles, setAmbientParticles] = useState<
    { x: number; y: number; size: number; color: string; speed: number; opacity: number }[]
  >([])
  const [characterRotations, setCharacterRotations] = useState<{ [key: number]: { x: number; y: number } }>({})
  const [lastComboMilestone, setLastComboMilestone] = useState(0)
  const [showComboEffect, setShowComboEffect] = useState(false)
  const [comboEffectPosition, setComboEffectPosition] = useState<{ x: number; y: number } | null>(null)

  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const speedUpTimerRef = useRef<NodeJS.Timeout | null>(null)
  const timeSpeedFactor = useRef<number>(1)
  const particlesRef = useRef<NodeJS.Timeout | null>(null)
  const gameActiveRef = useRef<boolean>(false)
  const lastSpawnTimeRef = useRef<number>(0)
  const gameLoopActiveRef = useRef<boolean>(false)
  const scoreRef = useRef<number>(0)
  const hammerTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const hoorayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null)
  const comboIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const powerUpTimersRef = useRef<NodeJS.Timeout[]>([])

  // Inside the WhackAMoleGame component, add the useSkills hook
  const { playerSkills, skillEffects, addExperience } = useSkills()

  // Add these state variables after the existing state variables
  const [characterCounts, setCharacterCounts] = useState({
    berry: 0,
    carlo: 0,
    scott: 0,
    toli: 0,
    blueberry: 0,
  })

  const [ultimateUseCounts, setUltimateUseCounts] = useState({
    goldenHammer: 0,
    timeWarp: 0,
    comboFrenzy: 0,
    berryExplosion: 0,
  })

  const [gameDuration, setGameDuration] = useState(0)
  const gameStartTimeRef = useRef<number | null>(null)
  const gameDurationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Use a fallback theme until mounted
  const theme = isMounted ? currentTheme : themes[defaultTheme]

  // Keep gameActiveRef in sync with gameActive state
  useEffect(() => {
    gameActiveRef.current = gameActive
  }, [gameActive])

  // Keep scoreRef in sync with score state
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  // Add localStorage for leaderboard persistence
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Fetch leaderboard data
        const data = await fetchLeaderboard()
        if (data && data.length > 0) {
          setLeaderboard(data)

          // Get high score
          const highScoreValue = await getHighScore()
          setHighScore(highScoreValue)

          // Also save to localStorage as backup
          localStorage.setItem("whackABerryHighScore", highScoreValue.toString())
        } else {
          // Fallback to localStorage
          const savedLeaderboard = localStorage.getItem("whackABerryLeaderboard")
          if (savedLeaderboard) {
            setLeaderboard(JSON.parse(savedLeaderboard))
          }

          const savedHighScore = localStorage.getItem("whackABerryHighScore")
          if (savedHighScore) {
            setHighScore(Number.parseInt(savedHighScore, 10))
          }
        }
      } catch (error) {
        console.error("Error loading leaderboard:", error)

        // Fallback to localStorage
        const savedLeaderboard = localStorage.getItem("whackABerryLeaderboard")
        if (savedLeaderboard) {
          setLeaderboard(JSON.parse(savedLeaderboard))
        }

        const savedHighScore = localStorage.getItem("whackABerryHighScore")
        if (savedHighScore) {
          setHighScore(Number.parseInt(savedHighScore, 10))
        }
      }
    }

    loadLeaderboard()
  }, [])

  // Initialize holes based on grid size
  useEffect(() => {
    const totalHoles = gridSize * gridSize
    const initialHoles = Array(totalHoles)
      .fill(null)
      .map(() => ({ visible: false, character: null }))
    setHoles(initialHoles)
  }, [gridSize])

  // Track mouse movement for hammer
  useEffect(() => {
    if (view === "game" && gameActive) {
      const handleMouseMove = (e: MouseEvent) => {
        if (gameAreaRef.current) {
          const rect = gameAreaRef.current.getBoundingClientRect()
          setHammerPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          })
        }
      }

      window.addEventListener("mousemove", handleMouseMove)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [view, gameActive])

  // Update blueberry multiplier countdown
  useEffect(() => {
    if (blueberryMultiplierActive && blueberryMultiplierEndTime) {
      const updateInterval = setInterval(() => {
        const now = Date.now()
        if (now >= blueberryMultiplierEndTime) {
          clearInterval(updateInterval)
          setBlueberryMultiplierActive(false)
          setBlueberryMultiplier(1)
        } else {
          // Force re-render to update countdown
          setBlueberryMultiplierEndTime(blueberryMultiplierEndTime)
        }
      }, 100)

      return () => clearInterval(updateInterval)
    }
  }, [blueberryMultiplierActive, blueberryMultiplierEndTime])

  // Clear all hole timers
  const clearAllHoleTimers = () => {
    console.log("Clearing all hole timers")

    // Clear all timers stored in the holes state
    setHoles((prevHoles) => {
      return prevHoles.map((hole) => {
        if (hole.timerId) {
          clearTimeout(hole.timerId)
        }
        return { ...hole, visible: false, character: null, timerId: null, fadeOut: false }
      })
    })

    // Clear all power-up timers
    powerUpTimersRef.current.forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    powerUpTimersRef.current = []

    // Reset power-ups
    setPowerUps((prev) => prev.map((p) => ({ ...p, active: false, endTime: null, position: null })))

    // Clear blueberry timer
    if (blueberryTimerRef.current) {
      clearTimeout(blueberryTimerRef.current)
      blueberryTimerRef.current = null
    }
  }

  // Start the game
  const startGame = () => {
    setScore(0)
    scoreRef.current = 0

    // Apply starting time bonus from skills
    const startingTimeBonus = skillEffects.startingTimeBonus || 0
    setTimeLeft(30 + startingTimeBonus)

    setGameActive(true)
    setIsNewHighScore(false)
    setShowHooray(false)

    // Reset blueberry state
    setBlueberryCount(0)
    console.log("Reset blueberry count to 0")
    setBlueberryMultiplier(1)
    setBlueberryMultiplierActive(false)
    setBlueberryMultiplierEndTime(null)
    if (blueberryTimerRef.current) {
      clearTimeout(blueberryTimerRef.current)
      blueberryTimerRef.current = null
    }

    // Reset combo system
    // Apply starting combo from skills
    const startingCombo = skillEffects.startingCombo || 0
    setCombo(startingCombo)
    setMaxCombo(startingCombo)
    setComboMultiplier(startingCombo >= 10 ? 3 : startingCombo >= 5 ? 2 : startingCombo >= 3 ? 1.5 : 1)
    setComboTimeLeft(0)

    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current)
      comboTimerRef.current = null
    }
    if (comboIntervalRef.current) {
      clearInterval(comboIntervalRef.current)
      comboIntervalRef.current = null
    }

    // Add this to the startGame function to initialize ultimate charges
    // Apply ultimate ability charges from skills
    setGoldenHammerCharges(Math.floor(skillEffects.goldenHammerCharges || 0))
    setTimeWarpCharges(Math.floor(skillEffects.timeWarpCharges || 0))
    setComboFrenzyCharges(Math.floor(skillEffects.comboFrenzyCharges || 0))
    setBerryExplosionCharges(Math.floor(skillEffects.berryExplosionCharges || 0))
    setComboFrenzyActive(false)
    setComboFrenzyEndTime(null)

    const totalHoles = gridSize * gridSize
    const initialHoles = Array(totalHoles)
      .fill(null)
      .map(() => ({ visible: false, character: null }))
    setHoles(initialHoles)

    setLastScoreChange(null)
    setTimeSpeedUp(false)
    setTimeSpeedUpEndTime(null)
    setTimeBonus(null)
    setConfirmExit(false)
    timeSpeedFactor.current = 1
    lastSpawnTimeRef.current = Date.now()
    gameLoopActiveRef.current = true

    // Reset character counts
    setCharacterCounts({
      berry: 0,
      carlo: 0,
      scott: 0,
      toli: 0,
      blueberry: 0,
    })

    // Reset ultimate use counts
    setUltimateUseCounts({
      goldenHammer: 0,
      timeWarp: 0,
      comboFrenzy: 0,
      berryExplosion: 0,
    })

    // Start tracking game duration
    gameStartTimeRef.current = Date.now()

    if (gameDurationIntervalRef.current) {
      clearInterval(gameDurationIntervalRef.current)
    }

    gameDurationIntervalRef.current = setInterval(() => {
      if (gameStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
        setGameDuration(elapsed)
      }
    }, 1000)

    setView("game")
    setLastComboMilestone(0)

    // Clear any existing timers
    clearAllHoleTimers()

    if (speedUpTimerRef.current) {
      clearTimeout(speedUpTimerRef.current)
      speedUpTimerRef.current = null
    }

    // Reset power-ups
    setPowerUps([
      { type: "freeze", active: false, endTime: null, position: null },
      { type: "double", active: false, endTime: null, position: null },
      { type: "slow", active: false, endTime: null, position: null },
      { type: "slow", active: false, endTime: null, position: null },
    ])

    // Apply power-up spawn rate from skills
    const skillPowerUpBonus = skillEffects.powerupSpawnRate || 0
    setLastPowerUpTime(0)
    setPowerUpChance(0.05 + skillPowerUpBonus)
  }

  // Return to menu (with confirmation if game is active)
  const returnToMenu = () => {
    if (gameActive && !confirmExit) {
      setConfirmExit(true)
      return
    }

    // Stop the game and return to menu
    setGameActive(false)
    setConfirmExit(false)
    gameLoopActiveRef.current = false

    // Clear all timers
    if (timerRef.current) clearInterval(timerRef.current)
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current)
    if (speedUpTimerRef.current) clearTimeout(speedUpTimerRef.current)
    clearAllHoleTimers()

    setView("menu")
  }

  // Helper function to interpolate colors
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    // Convert hex to RGB
    const parseColor = (hexColor: string) => {
      const hex = hexColor.replace("#", "")
      return {
        r: Number.parseInt(hex.substring(0, 2), 16),
        g: Number.parseInt(hex.substring(2, 4), 16),
        b: Number.parseInt(hex.substring(4, 6), 16),
      }
    }

    const c1 = parseColor(color1)
    const c2 = parseColor(color2)

    // Interpolate
    const r = Math.round(c1.r + factor * (c2.r - c1.r))
    const g = Math.round(c1.g + factor * (c2.g - c1.g))
    const b = Math.round(c1.b + factor * (c2.b - c1.b))

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16, "0")}`
  }

  // Generate ambient particles
  const generateAmbientParticles = () => {
    if (!gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const newParticles = []

    // Number of particles based on score
    const particleCount = Math.min(5 + Math.floor(score / 10), 20)

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * 3 + 1,
        color: theme?.particleColors.berry[Math.floor(Math.random() * theme?.particleColors.berry.length)],
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    setAmbientParticles(newParticles)
  }

  // Update ambient particles
  const updateAmbientParticles = () => {
    if (!gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()

    setAmbientParticles((prev) =>
      prev.map((particle) => {
        // Move particles upward
        let y = particle.y - particle.speed

        // Reset if out of bounds
        if (y < -10) {
          y = rect.height + 10
          return {
            ...particle,
            y,
            x: Math.random() * rect.width,
            opacity: Math.random() * 0.5 + 0.2,
          }
        }

        return {
          ...particle,
          y,
        }
      }),
    )
  }

  // Show combo milestone effect
  const showComboMilestoneEffect = (x: number, y: number) => {
    setComboEffectPosition({ x, y })
    setShowComboEffect(true)

    setTimeout(() => {
      setShowComboEffect(false)
    }, 1500)
  }

  // Generate particles for visual effects
  const generateParticles = (
    x: number,
    y: number,
    count: number,
    character: CharacterType | null,
    customColors?: string[],
  ) => {
    const newParticles = []

    // Define colors based on character or use custom colors
    let colors = customColors || ["#FF69B4", "#FF1493", "#DB7093"] // Pink colors for berries

    if (!customColors) {
      if (character === "carlo") {
        colors = ["#FF0000", "#FF6347", "#FF4500", "#8B0000"] // Red colors for Carlo
      } else if (character === "scott") {
        colors = ["#1E90FF", "#00BFFF", "#87CEFA", "#4682B4"] // Blue colors for Scott
      } else if (character === "toli") {
        colors = ["#32CD32", "#00FA9A", "#7FFF00", "#ADFF2F"] // Green colors for Toli
      } else if (character === "blueberry") {
        colors = ["#4169E1", "#1E90FF", "#00BFFF", "#87CEFA"] // Blue colors for blueberry
      }
    }

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 6 + 2

      newParticles.push({
        x: x + (Math.random() * 40 - 20),
        y: y + (Math.random() * 40 - 20),
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 2 + 1,
      })
    }

    setParticles(newParticles)
    setShowParticles(true)

    // Clear particles after animation
    if (particlesRef.current) {
      clearTimeout(particlesRef.current)
    }

    particlesRef.current = setTimeout(() => {
      setShowParticles(false)
      particlesRef.current = null
    }, 1000)
  }

  // Activate blueberry multiplier
  const activateBlueberryMultiplier = () => {
    // Set blueberry multiplier
    setBlueberryMultiplier(5)
    setBlueberryMultiplierActive(true)

    // Calculate end time (2 seconds from now)
    const endTime = Date.now() + 2000
    setBlueberryMultiplierEndTime(endTime)

    // Clear any existing blueberry timer
    if (blueberryTimerRef.current) {
      clearTimeout(blueberryTimerRef.current)
    }

    // Set timer to reset multiplier after 2 seconds
    blueberryTimerRef.current = setTimeout(() => {
      setBlueberryMultiplier(1)
      setBlueberryMultiplierActive(false)
      setBlueberryMultiplierEndTime(null)
      blueberryTimerRef.current = null
    }, 2000)
  }

  // Handle whacking a hole - simplified to fix issues
  const whackHole = (index: number, event: React.MouseEvent) => {
    // Stop event propagation and prevent default
    event.preventDefault()
    event.stopPropagation()

    // Check if the game is active
    if (!gameActive) return

    // Check if this hole has a power-up
    const powerUpIndex = powerUps.findIndex((p) => p.position === index)
    const hasPowerUp = powerUpIndex !== -1

    if (hasPowerUp) {
      const powerUp = powerUps[powerUpIndex]

      // Generate particles for power-up
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      // Different particles for power-ups
      const colors =
        powerUp.type === "freeze"
          ? ["#00BFFF", "#1E90FF", "#87CEFA"]
          : powerUp.type === "double"
            ? ["#FFD700", "#FFA500", "#FF8C00"]
            : ["#9370DB", "#8A2BE2", "#9400D3"]

      generateParticles(clickX, clickY, 20, null, colors)

      // Activate the power-up
      activatePowerUp(powerUp.type)

      // Hide the power-up
      setPowerUps((prev) => prev.map((p, i) => (i === powerUpIndex ? { ...p, position: null } : p)))

      // Show hammer animation
      setHammerPosition({
        x: clickX,
        y: clickY,
      })
      setShowHammer(true)

      // Clear any existing hammer timer
      if (hammerTimerRef.current) {
        clearTimeout(hammerTimerRef.current)
      }

      // Hide hammer after animation
      hammerTimerRef.current = setTimeout(() => {
        setShowHammer(false)
        hammerTimerRef.current = null
      }, 300)

      return // Exit early after activating power-up
    }

    // Get the current hole state directly from the state
    const currentHole = holes[index]

    // Check if the hole has a visible character
    if (!currentHole?.visible) {
      return
    }

    console.log(`Whacking hole ${index} with character ${currentHole.character}`)

    const character = currentHole.character

    // Create whack effect
    setWhackEffect({ index, timestamp: Date.now() })

    // Generate particles at click position with enhanced effects
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Generate character-specific particles
    if (character === "carlo") {
      // Angry bear particles
      generateParticles(clickX, clickY, 20, character)
    } else if (character === "scott") {
      // Smart bear particles
      generateParticles(clickX, clickY, 15, character)
    } else if (character === "toli") {
      // Chill bear particles
      generateParticles(clickX, clickY, 15, character)
    } else if (character === "blueberry") {
      // Extra fancy blueberry particles
      generateParticles(clickX, clickY, 25, character)
    } else {
      // Regular berry
      generateParticles(clickX, clickY, 15, character)
    }

    // Show hammer animation
    setHammerPosition({
      x: clickX,
      y: clickY,
    })
    setShowHammer(true)

    // Clear any existing hammer timer
    if (hammerTimerRef.current) {
      clearTimeout(hammerTimerRef.current)
    }

    // Hide hammer after animation
    hammerTimerRef.current = setTimeout(() => {
      setShowHammer(false)
      hammerTimerRef.current = null
    }, 300)

    // Apply double hit chance from skills
    const doubleHitChance = skillEffects.doubleHitChance || 0
    const isDoubleHit = Math.random() < doubleHitChance

    // Find the double points power-up
    const doublePointsPowerUp = powerUps.find((p) => p.type === "double" && p.active)
    const pointsMultiplier = doublePointsPowerUp ? 2 : 1

    // Calculate total multiplier (combo × power-up × blueberry)
    const totalMultiplier = comboMultiplier * pointsMultiplier * blueberryMultiplier * (isDoubleHit ? 2 : 1)

    // Update score based on character
    if (character === "carlo") {
      // Apply Carlo point loss reduction from skills
      const carloReduction = skillEffects.carloPointLossReduction || 0
      const pointsLost = Math.max(0, 2 * (1 - carloReduction))

      if (pointsLost > 0) {
        setScore((prevScore) => Math.max(0, prevScore - pointsLost))
        setLastScoreChange({ value: -pointsLost, timestamp: Date.now() })
      }

      // Apply combo retention from skills
      const comboRetention = skillEffects.comboRetentionRate || 0
      if (comboRetention > 0 && combo > 0) {
        const retainedCombo = Math.floor(combo * comboRetention)
        setCombo(retainedCombo)
        // Update multiplier based on retained combo
        setComboMultiplier(retainedCombo >= 10 ? 3 : retainedCombo >= 5 ? 2 : retainedCombo >= 3 ? 1.5 : 1)
      } else {
        // Reset combo when hitting Carlo
        resetCombo()
      }
    } else if (character === "blueberry") {
      // Activate blueberry multiplier
      activateBlueberryMultiplier()

      // Add 1 point with current multipliers
      setScore((prevScore) => prevScore + 1 * totalMultiplier)
      setLastScoreChange({ value: 1 * totalMultiplier, timestamp: Date.now() })

      // Increment combo
      incrementCombo()
    } else {
      // First increment combo (which will update the multiplier)
      incrementCombo()

      // Then apply the updated multiplier to the score
      if (character === "scott") {
        // Apply Scott speed boost duration bonus from skills
        const scottDurationBonus = skillEffects.scottSpeedBoostDuration || 0
        // Apply Scott speed boost multiplier bonus from skills
        const scottMultiplierBonus = skillEffects.scottSpeedBoostMultiplier || 0

        // Speed up time when hitting Scott with skill bonuses
        activateTimeSpeedUp(scottDurationBonus, scottMultiplierBonus)
        setScore((prevScore) => prevScore + 1 * totalMultiplier)
        setLastScoreChange({ value: 1 * totalMultiplier, timestamp: Date.now() })
      } else if (character === "toli") {
        // Apply Toli time bonus from skills
        const toliBonus = skillEffects.toliTimeBonus || 0
        const totalTimeBonus = 2 + toliBonus

        // Add seconds to the timer when hitting Toli
        setTimeLeft((prevTime) => prevTime + totalTimeBonus)
        setTimeBonus({ amount: totalTimeBonus, timestamp: Date.now() })
        setScore((prevScore) => prevScore + 1 * totalMultiplier)
        setLastScoreChange({ value: 1 * totalMultiplier, timestamp: Date.now() })
      } else {
        // Regular berry
        setScore((prevScore) => prevScore + 1 * totalMultiplier)
        setLastScoreChange({ value: 1 * totalMultiplier, timestamp: Date.now() })
      }
    }

    // Apply random freeze chance from skills
    const randomFreezeChance = skillEffects.randomFreezeChance || 0
    if (Math.random() < randomFreezeChance) {
      // Activate a brief time freeze
      activatePowerUp("freeze")
    }

    // Apply area hit chance from skills
    const areaHitChance = skillEffects.areaHitChance || 0
    if (Math.random() < areaHitChance) {
      // Find adjacent holes and hit them
      const adjacentIndices = getAdjacentHoles(index, gridSize)
      adjacentIndices.forEach((adjIndex) => {
        const adjHole = holes[adjIndex]
        if (adjHole?.visible && adjHole.character) {
          // Apply area hit bonus points from skills
          const areaHitBonus = skillEffects.areaHitBonusPoints || 0
          const areaMultiplier = 1 + areaHitBonus

          // Don't hit Carlo with area damage
          if (adjHole.character !== "carlo") {
            setScore((prevScore) => prevScore + 1 * totalMultiplier * areaMultiplier)

            // Generate smaller particles for area hits
            const holeElement = document.querySelector(`.game-hole:nth-child(${adjIndex + 1})`)
            if (holeElement) {
              const rect = holeElement.getBoundingClientRect()
              const centerX = rect.left + rect.width / 2
              const centerY = rect.top + rect.height / 2
              generateParticles(centerX - rect.left, centerY - rect.top, 8, adjHole.character)
            }

            // Hide the character that was hit by area damage
            setHoles((prev) => {
              const newHoles = [...prev]
              if (newHoles[adjIndex].timerId) {
                clearTimeout(newHoles[adjIndex].timerId)
              }
              newHoles[adjIndex] = { visible: false, character: null, timerId: null, fadeOut: false }
              return newHoles
            })
          }
        }
      })
    }

    // Update state to hide the clicked character immediately and clear its timer
    setHoles((prevHoles) => {
      const newHoles = [...prevHoles]

      // Clear the timer for this hole if it exists
      if (newHoles[index].timerId) {
        clearTimeout(newHoles[index].timerId)
      }

      // Hide the character
      newHoles[index] = { visible: false, character: null, timerId: null, fadeOut: false }
      return newHoles
    })

    // Update character counts
    if (character) {
      setCharacterCounts((prev) => ({
        ...prev,
        [character]: prev[character] + 1,
      }))

      // Update achievement progress for character hits
      updateProgress("character", characterCounts[character] + 1, character)
    }
  }

  // Helper function to get adjacent hole indices
  const getAdjacentHoles = (index: number, gridSize: number): number[] => {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize

    const adjacent: number[] = []

    // Check all 8 directions
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]

    directions.forEach(([dr, dc]) => {
      const newRow = row + dr
      const newCol = col + dc

      if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
        adjacent.push(newRow * gridSize + newCol)
      }
    })

    return adjacent
  }

  // Add these ultimate ability handler functions
  const useGoldenHammer = () => {
    if (goldenHammerCharges <= 0 || !gameActive) return

    // Hit all visible characters
    setHoles((prevHoles) => {
      const newHoles = [...prevHoles]
      let pointsGained = 0

      newHoles.forEach((hole, index) => {
        if (hole.visible && hole.character) {
          // Don't hit Carlo with golden hammer
          if (hole.character !== "carlo") {
            pointsGained += 1

            // Generate particles
            const holeElement = document.querySelector(`.game-hole:nth-child(${index + 1})`)
            if (holeElement) {
              const rect = holeElement.getBoundingClientRect()
              const centerX = rect.width / 2
              const centerY = rect.height / 2
              generateParticles(centerX, centerY, 10, hole.character, ["#FFD700", "#FFA500", "#F0E68C"])
            }

            // Clear timer
            if (hole.timerId) {
              clearTimeout(hole.timerId)
            }

            // Hide character
            newHoles[index] = { visible: false, character: null, timerId: null, fadeOut: false }
          }
        }
      })

      // Add points
      if (pointsGained > 0) {
        setScore((prev) => prev + pointsGained * comboMultiplier * blueberryMultiplier)
        setLastScoreChange({ value: pointsGained * comboMultiplier * blueberryMultiplier, timestamp: Date.now() })
        incrementCombo()
      }

      return newHoles
    })

    // Show special effect
    const gameArea = gameAreaRef.current
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      generateParticles(centerX, centerY, 30, null, ["#FFD700", "#FFA500", "#F0E68C"])
    }

    // Track usage
    setUltimateUseCounts((prev) => ({
      ...prev,
      goldenHammer: prev.goldenHammer + 1,
    }))

    // Decrease charges
    setGoldenHammerCharges((prev) => prev - 1)
  }

  const useTimeWarp = () => {
    if (timeWarpCharges <= 0 || !gameActive) return

    // Add 5 seconds to the timer
    setTimeLeft((prev) => prev + 5)
    setTimeBonus({ amount: 5, timestamp: Date.now() })

    // Show special effect
    const gameArea = gameAreaRef.current
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      generateParticles(centerX, centerY, 20, null, ["#00BFFF", "#1E90FF", "#87CEFA"])
    }

    // Track usage
    setUltimateUseCounts((prev) => ({
      ...prev,
      timeWarp: prev.timeWarp + 1,
    }))

    // Decrease charges
    setTimeWarpCharges((prev) => prev - 1)
  }

  const useComboFrenzy = () => {
    if (comboFrenzyCharges <= 0 || !gameActive || comboFrenzyActive) return

    // Activate combo frenzy mode
    setComboFrenzyActive(true)
    const endTime = Date.now() + 10000 // 10 seconds
    setComboFrenzyEndTime(endTime)

    // Show special effect
    const gameArea = gameAreaRef.current
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      generateParticles(centerX, centerY, 25, null, ["#9370DB", "#8A2BE2", "#9400D3"])
    }

    // Track usage
    setUltimateUseCounts((prev) => ({
      ...prev,
      comboFrenzy: prev.comboFrenzy + 1,
    }))

    // Set timer to end combo frenzy
    if (comboFrenzyRef.current) {
      clearTimeout(comboFrenzyRef.current)
    }

    comboFrenzyRef.current = setTimeout(() => {
      setComboFrenzyActive(false)
      setComboFrenzyEndTime(null)
      comboFrenzyRef.current = null
    }, 10000)

    // Decrease charges
    setComboFrenzyCharges((prev) => prev - 1)
  }

  const useBerryExplosion = () => {
    if (berryExplosionCharges <= 0 || !gameActive) return

    // Hit all visible characters
    setHoles((prevHoles) => {
      const newHoles = [...prevHoles]
      let pointsGained = 0

      newHoles.forEach((hole, index) => {
        if (hole.visible && hole.character) {
          // Don't hit Carlo with berry explosion
          if (hole.character !== "carlo") {
            pointsGained += 1

            // Generate particles
            const holeElement = document.querySelector(`.game-hole:nth-child(${index + 1})`)
            if (holeElement) {
              const rect = holeElement.getBoundingClientRect()
              const centerX = rect.width / 2
              const centerY = rect.height / 2
              generateParticles(centerX, centerY, 10, hole.character, ["#FF69B4", "#FF1493", "#DB7093"])
            }

            // Clear timer
            if (hole.timerId) {
              clearTimeout(hole.timerId)
            }

            // Hide character
            newHoles[index] = { visible: false, character: null, timerId: null, fadeOut: false }
          }
        }
      })

      // Add points
      if (pointsGained > 0) {
        setScore((prev) => prev + pointsGained * comboMultiplier * blueberryMultiplier)
        setLastScoreChange({ value: pointsGained * comboMultiplier * blueberryMultiplier, timestamp: Date.now() })
        incrementCombo()
      }

      return newHoles
    })

    // Spawn 3 random power-ups
    const availablePositions = holes.map((_, index) => index).filter((index) => !holes[index].visible)

    if (availablePositions.length >= 3) {
      // Shuffle available positions
      availablePositions.sort(() => Math.random() - 0.5)

      // Get 3 random positions
      const powerUpPositions = availablePositions.slice(0, 3)

      // Spawn power-ups
      setPowerUps((prev) => {
        const newPowerUps = [...prev]
        const powerUpTypes: PowerUpType[] = ["freeze", "double", "slow"]

        powerUpTypes.forEach((type, i) => {
          const index = newPowerUps.findIndex((p) => p.type === type)
          if (index !== -1) {
            newPowerUps[index] = { ...newPowerUps[index], position: powerUpPositions[i] }
          }
        })

        return newPowerUps
      })
    }

    // Show special effect
    const gameArea = gameAreaRef.current
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      generateParticles(centerX, centerY, 30, null, ["#FF69B4", "#FF1493", "#DB7093"])
    }

    // Track usage
    setUltimateUseCounts((prev) => ({
      ...prev,
      berryExplosion: prev.berryExplosion + 1,
    }))

    // Decrease charges
    setBerryExplosionCharges((prev) => prev - 1)
  }

  // Modify the incrementCombo function to handle combo frenzy and show milestone effects
  const incrementCombo = () => {
    setCombo((prevCombo) => {
      // If combo frenzy is active, add 2 to combo instead of 1
      const comboIncrement = comboFrenzyActive ? 2 : 1
      const newCombo = prevCombo + comboIncrement

      // Update max combo if needed
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo)
      }

      // Set combo multiplier based on combo count
      // Apply combo multiplier threshold reduction from skills
      const thresholdReduction = skillEffects.comboMultiplierThreshold || 0

      if (newCombo >= 10 - thresholdReduction) {
        setComboMultiplier(3) // 3x points for 10+ combo
      } else if (newCombo >= 5 - thresholdReduction) {
        setComboMultiplier(2) // 2x points for 5-9 combo
      } else if (newCombo >= 3 - thresholdReduction) {
        setComboMultiplier(1.5) // 1.5x points for 3-4 combo
      } else {
        setComboMultiplier(1) // 1x points for 1-2 combo
      }

      // Reset combo timer
      if (comboTimerRef.current) {
        clearTimeout(comboTimerRef.current)
      }
      if (comboIntervalRef.current) {
        clearInterval(comboIntervalRef.current)
      }

      // Apply combo duration bonus from skills
      const comboDurationBonus = skillEffects.comboDuration || 0
      const totalComboDuration = 3 + comboDurationBonus

      // Set combo expiration timer
      setComboTimeLeft(totalComboDuration)
      comboIntervalRef.current = setInterval(() => {
        setComboTimeLeft((prev) => {
          if (prev <= 0.1) {
            if (comboIntervalRef.current) {
              clearInterval(comboIntervalRef.current)
            }
            return 0
          }
          return prev - 0.1
        })
      }, 100)

      comboTimerRef.current = setTimeout(() => {
        resetCombo()
      }, totalComboDuration * 1000)

      // Show special effects at combo milestones
      const milestones = [5, 10, 15, 20, 25, 30, 40, 50]
      for (const milestone of milestones) {
        if (prevCombo < milestone && newCombo >= milestone && lastComboMilestone < milestone) {
          // Get a random position in the game area for the effect
          if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect()
            const effectX = rect.width / 2
            const effectY = rect.height / 2

            // Show combo milestone effect
            showComboMilestoneEffect(effectX, effectY)

            // Generate special particles
            generateParticles(
              effectX,
              effectY,
              30,
              null,
              milestone >= 20
                ? ["#FFD700", "#FFA500", "#FF8C00", "#FFFF00"]
                : ["#FF69B4", "#FF1493", "#DB7093", "#C71585"],
            )

            // Shake the game area
            if (gameAreaRef.current) {
              gameAreaRef.current.classList.add("screen-shake")
              setTimeout(() => {
                if (gameAreaRef.current) {
                  gameAreaRef.current.classList.remove("screen-shake")
                }
              }, 500)
            }

            setLastComboMilestone(milestone)
            break
          }
        }
      }

      return newCombo
    })
  }

  // Reset combo and multiplier
  const resetCombo = () => {
    setCombo(0)
    setComboMultiplier(1)
    setComboTimeLeft(0)

    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current)
      comboTimerRef.current = null
    }

    if (comboIntervalRef.current) {
      clearInterval(comboIntervalRef.current)
      comboIntervalRef.current = null
    }
  }

  // Get lifetime multiplier based on grid size
  const getLifetimeMultiplier = () => {
    switch (gridSize) {
      case 4:
        return 1.2
      case 5:
        return 1.5
      case 6:
        return 1.8
      default:
        return 1
    }
  }

  // Activate a power-up
  const activatePowerUp = (type: PowerUpType) => {
    setPowerUps((prev) => {
      const newPowerUps = [...prev]
      const index = newPowerUps.findIndex((p) => p.type === type)

      if (index !== -1) {
        // Clear any existing timer for this power-up
        if (powerUpTimersRef.current[index]) {
          clearTimeout(powerUpTimersRef.current[index])
        }

        // Apply power-up duration bonus from skills
        const durationBonus = skillEffects.powerupDuration || 0

        // Set duration based on power-up type
        let duration = 5000 + durationBonus * 1000 // Default 5 seconds + bonus
        if (type === "freeze") duration = 3000 + durationBonus * 1000 // Freeze for 3 seconds + bonus
        if (type === "slow") duration = 8000 + durationBonus * 1000 // Slow for 8 seconds + bonus

        // Set end time
        const endTime = Date.now() + duration
        newPowerUps[index] = { ...newPowerUps[index], active: true, endTime, position: null }

        // Apply power-up effect
        if (type === "freeze") {
          // Pause the timer countdown
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }

          // Resume timer after duration
          powerUpTimersRef.current[index] = setTimeout(() => {
            // Only restart if game is still active
            if (gameActiveRef.current) {
              timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                  // Apply time saver chance from skills
                  const timeSaverChance = skillEffects.timeSaverChance || 0
                  const skipTimeLoss = Math.random() < timeSaverChance

                  if (skipTimeLoss) {
                    return prevTime // Don't decrease time
                  }

                  const decrease = timeSpeedFactor.current
                  if (prevTime <= decrease) {
                    clearInterval(timerRef.current as NodeJS.Timeout)
                    setGameActive(false)
                    gameLoopActiveRef.current = false
                    const currentScore = scoreRef.current
                    setFinalScore(currentScore)
                    if (currentScore > highScore) {
                      setIsNewHighScore(true)
                    }
                    setView("name-input")
                    return 0
                  }
                  return prevTime - decrease
                })
              }, 1000)
            }

            // Deactivate power-up
            setPowerUps((current) => {
              const updated = [...current]
              updated[index] = { ...updated[index], active: false, endTime: null }
              return updated
            })
          }, duration)
        } else if (type === "slow") {
          // Slow down character disappearance by setting a global modifier
          timeSpeedFactor.current = 0.5

          // Reset after duration
          powerUpTimersRef.current[index] = setTimeout(() => {
            timeSpeedFactor.current = 1
            setPowerUps((current) => {
              const updated = [...current]
              updated[index] = { ...updated[index], active: false, endTime: null }
              return updated
            })
          }, duration)
        } else if (type === "double") {
          // Double points is handled in the whackHole function

          // Reset after duration
          powerUpTimersRef.current[index] = setTimeout(() => {
            setPowerUps((current) => {
              const updated = [...current]
              updated[index] = { ...updated[index], active: false, endTime: null }
              return updated
            })
          }, duration)
        }
      }

      return newPowerUps
    })
  }

  // Activate time speed up effect
  const activateTimeSpeedUp = (durationBonus = 0, multiplierBonus = 0) => {
    // Set time speed factor with skill bonus
    timeSpeedFactor.current = 1.5 + multiplierBonus
    setTimeSpeedUp(true)

    // Calculate end time (3 seconds + bonus from now)
    const duration = 3000 + durationBonus * 1000
    const endTime = Date.now() + duration
    setTimeSpeedUpEndTime(endTime)

    // Clear any existing speed up timer
    if (speedUpTimerRef.current) {
      clearTimeout(speedUpTimerRef.current)
    }

    // Set timer to reset speed after duration
    speedUpTimerRef.current = setTimeout(() => {
      timeSpeedFactor.current = 1
      setTimeSpeedUp(false)
      setTimeSpeedUpEndTime(null)
      speedUpTimerRef.current = null
    }, duration)
  }

  // Game timer
  useEffect(() => {
    if (gameActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          // Calculate time decrease based on speed factor
          const decrease = timeSpeedFactor.current

          if (prevTime <= decrease) {
            clearInterval(timerRef.current as NodeJS.Timeout)
            setGameActive(false)
            gameLoopActiveRef.current = false

            // Capture the current score when the game ends using the ref
            const currentScore = scoreRef.current
            console.log("Game ended with score:", currentScore)
            setFinalScore(currentScore)

            // Check if this is a new high score
            if (currentScore > highScore) {
              setIsNewHighScore(true)
            }

            // Always show name input when game ends
            setView("name-input")
            return 0
          }
          return prevTime - decrease
        })
      }, 1000)

      // Start the game loop
      gameLoopActiveRef.current = true
      runGameLoop()
    }

    return () => {
      // Clean up all timers
      if (timerRef.current) clearInterval(timerRef.current)
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current)
      if (speedUpTimerRef.current) clearTimeout(speedUpTimerRef.current)
      clearAllHoleTimers()
      gameLoopActiveRef.current = false
    }
  }, [gameActive, highScore]) // Added highScore as dependency to check for new high scores

  // Update background intensity based on score and day/night cycle based on time
  useEffect(() => {
    if (gameActive) {
      // Update background intensity based on score
      const intensity = Math.min(1 + (score / 100) * 0.5, 1.5)
      setBackgroundIntensity(intensity)

      // Update day/night cycle based on time remaining
      const progress = 1 - timeLeft / 30
      setDayNightProgress(progress)

      // Generate and update ambient particles
      const ambientInterval = setInterval(() => {
        updateAmbientParticles()
      }, 50)

      // Generate new ambient particles occasionally
      const newParticlesInterval = setInterval(() => {
        if (Math.random() < 0.3) {
          // 30% chance each second
          generateAmbientParticles()
        }
      }, 1000)

      return () => {
        clearInterval(ambientInterval)
        clearInterval(newParticlesInterval)
      }
    }
  }, [gameActive, score, timeLeft])

  // Track mouse movement for 3D character rotation
  useEffect(() => {
    if (view === "game" && gameActive) {
      const handleMouseMove = (e: MouseEvent) => {
        if (gameAreaRef.current) {
          const rect = gameAreaRef.current.getBoundingClientRect()
          const mouseX = e.clientX - rect.left
          const mouseY = e.clientY - rect.top

          // Update rotations for each hole
          const newRotations: { [key: number]: { x: number; y: number } } = {}

          holes.forEach((_, index) => {
            // Calculate hole center position
            const holeElement = document.querySelector(`.game-hole:nth-child(${index + 1})`) as HTMLElement
            if (holeElement) {
              const holeRect = holeElement.getBoundingClientRect()
              const holeX = holeRect.left + holeRect.width / 2 - rect.left
              const holeY = holeRect.top + holeRect.height / 2 - rect.top

              // Calculate distance and angle
              const deltaX = mouseX - holeX
              const deltaY = mouseY - holeY
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

              // Only apply rotation if mouse is close enough
              if (distance < 150) {
                // Calculate rotation angles (max 10 degrees)
                const rotateY = Math.max(-10, Math.min(10, deltaX * 0.1))
                const rotateX = Math.max(-10, Math.min(10, -deltaY * 0.1))

                newRotations[index] = { x: rotateX, y: rotateY }
              } else {
                newRotations[index] = { x: 0, y: 0 }
              }
            }
          })

          setCharacterRotations(newRotations)
        }
      }

      window.addEventListener("mousemove", handleMouseMove)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [view, gameActive, holes.length])

  // Update time speed up countdown
  useEffect(() => {
    if (timeSpeedUp && timeSpeedUpEndTime) {
      const updateInterval = setInterval(() => {
        const now = Date.now()
        if (now >= timeSpeedUpEndTime) {
          clearInterval(updateInterval)
        } else {
          // Force re-render to update countdown
          setTimeSpeedUpEndTime(timeSpeedUpEndTime)
        }
      }, 100)

      return () => clearInterval(updateInterval)
    }
  }, [timeSpeedUp, timeSpeedUpEndTime])

  // Clear time bonus notification after 1 second
  useEffect(() => {
    if (timeBonus) {
      const timer = setTimeout(() => {
        setTimeBonus(null)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [timeBonus])

  // Clear whack effect after animation
  useEffect(() => {
    if (whackEffect) {
      const timer = setTimeout(() => {
        setWhackEffect(null)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [whackEffect])

  // Calculate time speed up remaining time
  const calculateSpeedUpTimeRemaining = () => {
    if (timeSpeedUpEndTime === null) {
      return 0
    }
    const remaining = Math.max(0, timeSpeedUpEndTime - Date.now()) / 1000
    return remaining.toFixed(1)
  }

  // Calculate blueberry multiplier remaining time
  const calculateBlueberryMultiplierRemaining = () => {
    if (blueberryMultiplierEndTime === null) {
      return 0
    }
    const remaining = Math.max(0, blueberryMultiplierEndTime - Date.now()) / 1000
    return remaining.toFixed(1)
  }

  // Game loop function - completely rewritten for better reliability
  const runGameLoop = () => {
    if (!gameActiveRef.current || !gameLoopActiveRef.current) return

    // Cancel any existing game loop timer
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current)
      gameLoopRef.current = null
    }

    // Show random characters
    const showRandomCharacters = () => {
      // Enforce a minimum time between spawns to prevent rapid spawning
      const now = Date.now()
      const timeSinceLastSpawn = now - lastSpawnTimeRef.current
      const minSpawnInterval = 200 // ms

      if (timeSinceLastSpawn < minSpawnInterval) {
        // If we're trying to spawn too quickly, delay the next spawn
        gameLoopRef.current = setTimeout(runGameLoop, minSpawnInterval - timeSinceLastSpawn)
        return
      }

      // Get available positions (holes without characters)
      setHoles((currentHoles) => {
        if (!gameActiveRef.current) return currentHoles

        const availablePositions = []
        for (let i = 0; i < currentHoles.length; i++) {
          if (!currentHoles[i].visible && !currentHoles[i].fadeOut) {
            availablePositions.push(i)
          }
        }

        // Occasionally spawn a power-up if none are active
        const now = Date.now()
        const canSpawnPowerUp =
          now - lastPowerUpTime > powerUpMinInterval && !powerUps.some((p) => p.position !== null || p.active)

        if (canSpawnPowerUp && Math.random() < powerUpChance && availablePositions.length > 0) {
          // Choose a random power-up type
          const powerUpTypes: PowerUpType[] = ["freeze", "double", "slow"]
          const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]

          // Choose a random position
          const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)]

          // Update the power-up state
          setPowerUps((prev) => prev.map((p) => (p.type === randomType ? { ...p, position: randomPosition } : p)))

          // Update last power-up time
          setLastPowerUpTime(now)

          // Remove this position from available positions
          const index = availablePositions.indexOf(randomPosition)
          if (index > -1) {
            availablePositions.splice(index, 1)
          }
        }

        if (availablePositions.length === 0) {
          // If no holes are available, try again after a short delay
          gameLoopRef.current = setTimeout(runGameLoop, 100)
          return currentHoles // No changes
        }

        // Shuffle available positions
        availablePositions.sort(() => Math.random() - 0.5)

        // Show 1-3 random characters (more for larger grids)
        const maxCharacters = Math.min(Math.ceil(gridSize / 2), 3)
        const numToShow = Math.min(Math.floor(Math.random() * maxCharacters) + 1, availablePositions.length)

        // Create a copy of the current holes
        const newHoles = [...currentHoles]

        for (let i = 0; i < numToShow; i++) {
          const position = availablePositions[i]

          // Determine which character to spawn
          let character: CharacterType = "berry"
          const rand = Math.random()

          // Ensure at least 1 blueberry appears if we're halfway through the game and none have appeared yet
          const halfwayPoint = 15 // Half of the 30 second game time
          const forceBlueberry = timeLeft <= halfwayPoint && blueberryCount === 0 && rand < 0.15

          // Chance to spawn blueberry if we haven't reached max appearances (reduced probability)
          if ((blueberryCount < maxBlueberryAppearances && rand < 0.02) || forceBlueberry) {
            character = "blueberry"
            setBlueberryCount((prev) => prev + 1)
            console.log("Spawning blueberry, count:", blueberryCount + 1)
          } else if (rand < 0.15) {
            character = "carlo"
          } else if (rand < 0.25) {
            character = "scott"
          } else if (rand < 0.35) {
            character = "toli"
          }

          // Calculate lifetime based on grid size
          const lifetimeMultiplier = getLifetimeMultiplier()
          const baseLifetime = Math.floor(Math.random() * 900) + 500 // 500-1400ms
          const lifeTime = Math.floor(baseLifetime * lifetimeMultiplier)

          console.log(`Setting timer for position ${position} with lifetime ${lifeTime}ms`)

          // Clear any existing timer for this position
          if (newHoles[position].timerId) {
            clearTimeout(newHoles[position].timerId)
          }

          // Set a timer to hide the character after its lifetime
          const timerId = setTimeout(() => {
            // Only update if the game is still active
            if (gameActiveRef.current) {
              console.log(`Auto-hiding character at position ${position} after ${lifeTime}ms`)

              // Update the state to start fade-out animation
              setHoles((prevHoles) => {
                // Only update if the character is still visible at this position
                if (prevHoles[position].visible) {
                  const updatedHoles = [...prevHoles]
                  updatedHoles[position] = {
                    ...updatedHoles[position],
                    fadeOut: true,
                  }

                  // Set another timer to completely remove the character after fade-out
                  setTimeout(() => {
                    if (gameActiveRef.current) {
                      setHoles((currentHoles) => {
                        const finalHoles = [...currentHoles]
                        finalHoles[position] = {
                          visible: false,
                          character: null,
                          timerId: null,
                          fadeOut: false,
                        }
                        return finalHoles
                      })
                    }
                  }, 500) // 500ms for fade-out animation

                  return updatedHoles
                }
                return prevHoles
              })
            }
          }, lifeTime)

          // Update the hole to show the character and store the timer ID
          newHoles[position] = { visible: true, character, timerId, fadeOut: false }
        }

        // Update the last spawn time
        lastSpawnTimeRef.current = now

        // Schedule the next iteration - faster for larger grids
        const loopDelay = Math.max(450 - (gridSize - 3) * 50, 300)
        if (gameLoopActiveRef.current) {
          gameLoopRef.current = setTimeout(runGameLoop, loopDelay)
        }

        return newHoles
      })
    }

    // Run the character appearance logic
    showRandomCharacters()
  }

  // Clear score change notification after 1 second
  useEffect(() => {
    if (lastScoreChange) {
      const timer = setTimeout(() => {
        setLastScoreChange(null)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [lastScoreChange])

  // Modify the addToLeaderboard function to save to localStorage
  // Add this state to track XP gained in the current game
  const [xpGained, setXpGained] = useState(0)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [previousExperience, setPreviousExperience] = useState(0)
  const xpAnimationRef = useRef<NodeJS.Timeout | null>(null)

  // Modify the addToLeaderboard function to show XP gain and make XP harder to earn
  const addToLeaderboard = async () => {
    console.log("Adding to leaderboard, score:", finalScore, "name:", playerName, "maxCombo:", maxCombo)

    if (finalScore > 0) {
      // Save the current experience value before adding more
      setPreviousExperience(playerSkills.experience)

      // Calculate XP rewards (make it harder to earn)
      const baseXP = Math.floor(finalScore * 0.5) // Halved from before - only 0.5 XP per point
      const gameCompletionXP = Math.min(5, finalScore / 20) // Max 5 XP, scales with score
      const comboXP = Math.max(0, (maxCombo - 8) * 1) // Only combos above 8 count, less XP per combo
      const difficultyXP = (gridSize - 3) * 2 // Reward for playing on higher difficulties
      const highScoreXP = finalScore > highScore ? 25 : 0 // Reduced high score bonus

      // Apply a scaling factor to make higher XP harder to get
      const scalingFactor = 1 - Math.min(0.5, finalScore / 200) // Reduces XP by up to 50% for high scores

      const totalXP = Math.round((baseXP + gameCompletionXP + comboXP + difficultyXP + highScoreXP) * scalingFactor)

      // Store the XP gained for display
      setXpGained(totalXP)
      setShowXpAnimation(true)

      // Add the XP to the player
      addExperience(totalXP)

      // Schedule hiding the animation after a delay
      if (xpAnimationRef.current) {
        clearTimeout(xpAnimationRef.current)
      }
      xpAnimationRef.current = setTimeout(() => {
        setShowXpAnimation(false)
        xpAnimationRef.current = null
      }, 5000)

      // Rest of the function remains unchanged
      // Use player name or "Anonymous" if empty
      const name = playerName.trim() || "Anonymous"

      try {
        // Add to API
        await addLeaderboardEntry({
          name,
          score: finalScore,
          gridSize,
          maxCombo, // Add maxCombo to the entry
        })

        // Refresh leaderboard data
        const updatedLeaderboard = await fetchLeaderboard()
        setLeaderboard(updatedLeaderboard)

        // Update high score if needed
        if (finalScore > highScore) {
          setHighScore(finalScore)
          localStorage.setItem("whackABerryHighScore", finalScore.toString())
          console.log("New high score set:", finalScore)

          // Show Hooray for high score
          setShowHooray(true)

          // Set a timeout to hide the hooray after 5 seconds
          if (hoorayTimerRef.current) {
            clearTimeout(hoorayTimerRef.current)
          }
          hoorayTimerRef.current = setTimeout(() => {
            setShowHooray(false)
            hoorayTimerRef.current = null
          }, 5000)
        }
      } catch (error) {
        console.error("Error saving to leaderboard:", error)

        // Fallback to localStorage
        const newEntry = {
          id: Date.now().toString(),
          name,
          score: finalScore,
          date: new Date().toLocaleDateString(),
          gridSize,
          maxCombo, // Add maxCombo to the entry
        }

        // Update leaderboard state and save to localStorage
        const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)

        console.log("Updated leaderboard:", updatedLeaderboard)
        setLeaderboard(updatedLeaderboard)
        localStorage.setItem("whackABerryLeaderboard", JSON.stringify(updatedLeaderboard))

        // Update high score if needed
        if (finalScore > highScore) {
          setHighScore(finalScore)
          localStorage.setItem("whackABerryHighScore", finalScore.toString())
          console.log("New high score set:", finalScore)

          // Show Hooray for high score
          setShowHooray(true)
        }
      }

      // Calculate final game duration
      const minutes = Math.floor(gameDuration / 60)
      const seconds = gameDuration % 60
      const durationString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

      // Add entry to game history
      addGameEntry({
        score: finalScore,
        gridSize,
        maxCombo,
        duration: durationString,
        characters: characterCounts,
        ultimatesUsed: ultimateUseCounts,
      })

      // Update achievement progress
      updateProgress("score", finalScore)
      updateProgress("combo", maxCombo)
      updateProgress("grid", gridSize)
      updateProgress("time", gameDuration)

      // Reset name input
      setPlayerName("")

      // Show the leaderboard
      setView("leaderboard")
    } else {
      // If somehow there's no score, go back to menu
      setView("menu")
    }
  }

  // Skip adding to leaderboard
  const skipLeaderboard = () => {
    setPlayerName("")
    setView("menu")
  }

  // Calculate time speed up remaining time
  const getSpeedUpTimeRemaining = () => {
    if (!timeSpeedUp || !timeSpeedUpEndTime) return 0
    const remaining = Math.max(0, (timeSpeedUpEndTime - Date.now()) / 1000)
    return remaining.toFixed(1)
  }

  // Debug finalScore changes
  useEffect(() => {
    console.log("finalScore updated:", finalScore)
  }, [finalScore])

  // Add these hooks after the existing hooks
  const { updateProgress } = useAchievements()
  const { addGameEntry } = useGameHistory()

  // Add cleanup for game duration interval
  useEffect(() => {
    return () => {
      if (gameDurationIntervalRef.current) {
        clearInterval(gameDurationIntervalRef.current)
        gameDurationIntervalRef.current = null
      }
    }
  }, [])

  // Cleanup all timers when component unmounts
  useEffect(() => {
    return () => {
      console.log("Cleanup effect running")
      // Add this line to clean up XP animation timer
      if (xpAnimationRef.current) {
        clearTimeout(xpAnimationRef.current)
        xpAnimationRef.current = null
      }

      // Rest of the existing cleanup code
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current)
        gameLoopRef.current = null
      }
      if (speedUpTimerRef.current) {
        clearTimeout(speedUpTimerRef.current)
        speedUpTimerRef.current = null
      }
      if (particlesRef.current) {
        clearTimeout(particlesRef.current)
        particlesRef.current = null
      }
      if (hammerTimerRef.current) {
        clearTimeout(hammerTimerRef.current)
        hammerTimerRef.current = null
      }
      if (hoorayTimerRef.current) {
        clearTimeout(hoorayTimerRef.current)
        hoorayTimerRef.current = null
      }
      if (comboTimerRef.current) {
        clearTimeout(comboTimerRef.current)
        comboTimerRef.current = null
      }
      if (comboIntervalRef.current) {
        clearInterval(comboIntervalRef.current)
        comboIntervalRef.current = null
      }
      if (blueberryTimerRef.current) {
        clearTimeout(blueberryTimerRef.current)
        blueberryTimerRef.current = null
      }
      // Add cleanup for combo frenzy timer
      if (comboFrenzyRef.current) {
        clearTimeout(comboFrenzyRef.current)
        comboFrenzyRef.current = null
      }
      clearAllHoleTimers()
      gameLoopActiveRef.current = false
    }
  }, []) // Run only on unmount

  // Render the menu screen
  const renderMenu = () => {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 p-6">
        <div className="title-3d">
          <h1
            className={`text-5xl sm:text-6xl md:text-7xl font-bold text-center ${theme?.titleColor || "text-pink-500"}`}
          >
            Whack-A-Berry
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mt-2">V2</h2>
        </div>

        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium mb-2 text-center">Grid Size</label>
          <Select
            value={gridSize.toString()}
            onValueChange={(value) => setGridSize(Number.parseInt(value) as GridSize)}
          >
            <SelectTrigger className="w-full mb-6 shadow-lg border-2 hover:border-primary transition-all">
              <SelectValue placeholder="Select grid size" />
            </SelectTrigger>
            <SelectContent className="border-2 shadow-xl">
              <SelectItem value="3">3x3</SelectItem>
              <SelectItem value="4">4x4 (Slower berries)</SelectItem>
              <SelectItem value="5">5x5 (Much slower berries)</SelectItem>
              <SelectItem value="6">6x6 (Very slow berries)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col w-full max-w-xs space-y-4">
          <Button
            onClick={startGame}
            className={`py-8 text-xl font-bold bg-gradient-to-r ${theme?.buttonGradient || "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"} shadow-lg border-b-4 ${theme?.buttonBorder || "border-green-800"} hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150 transform hover:scale-105`}
          >
            <Play className="mr-2 h-5 w-5" />
            Play Game
          </Button>

          <Button
            onClick={() => setView("info")}
            className={`py-8 text-xl font-bold bg-gradient-to-r ${
              theme?.id === "forest"
                ? "from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                : theme?.id === "beach"
                  ? "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  : theme?.id === "space"
                    ? "from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    : "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            } shadow-lg border-b-4 ${
              theme?.id === "forest"
                ? "border-indigo-800"
                : theme?.id === "beach"
                  ? "border-amber-800"
                  : theme?.id === "space"
                    ? "border-violet-800"
                    : "border-blue-800"
            } hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150 transform hover:scale-105`}
          >
            <Info className="mr-2 h-5 w-5" />
            How to Play
          </Button>

          <Button
            onClick={() => setView("leaderboard")}
            className={`py-8 text-xl font-bold bg-gradient-to-r ${
              theme?.id === "forest"
                ? "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                : theme?.id === "beach"
                  ? "from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  : theme?.id === "space"
                    ? "from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700"
                    : "from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
            } shadow-lg border-b-4 ${
              theme?.id === "forest"
                ? "border-emerald-800"
                : theme?.id === "beach"
                  ? "border-orange-800"
                  : theme?.id === "space"
                    ? "border-fuchsia-800"
                    : "border-amber-800"
            } hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150 transform hover:scale-105`}
          >
            <Trophy className="mr-2 h-5 w-5" />
            Leaderboard
          </Button>

          <Button
            onClick={() => setView("skills")}
            className={`py-8 text-xl font-bold bg-gradient-to-r ${
              theme?.id === "forest"
                ? "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                : theme?.id === "beach"
                  ? "from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  : theme?.id === "space"
                    ? "from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                    : "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            } shadow-lg border-b-4 ${
              theme?.id === "forest"
                ? "border-purple-800"
                : theme?.id === "beach"
                  ? "border-cyan-800"
                  : theme?.id === "space"
                    ? "border-pink-800"
                    : "border-purple-800"
            } hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150 transform hover:scale-105`}
          >
            <Star className="mr-2 h-5 w-5" />
            Skills & Upgrades
          </Button>
          <Button
            onClick={() => setView("profile")}
            className={`py-8 text-xl font-bold bg-gradient-to-r ${
              theme?.id === "forest"
                ? "from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                : theme?.id === "beach"
                  ? "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  : theme?.id === "space"
                    ? "from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    : "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            } shadow-lg border-b-4 ${
              theme?.id === "forest"
                ? "border-teal-800"
                : theme?.id === "beach"
                  ? "border-amber-800"
                  : theme?.id === "space"
                    ? "border-violet-800"
                    : "border-purple-800"
            } hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150 transform hover:scale-105`}
          >
            <User className="mr-2 h-5 w-5" />
            Player Profile
          </Button>
        </div>

        {/* Add theme selector */}
        <div className="mt-4">
          <ThemeSelector />
        </div>

        {highScore > 0 && (
          <div className="high-score-badge">
            <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="font-bold">High Score: {highScore}</span>
          </div>
        )}
      </div>
    )
  }

  // Render the info screen
  const renderInfo = () => {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-shadow-lg">How to Play</h2>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg shadow-md transform hover:scale-102 transition-transform border-2 border-gray-200 dark:border-gray-700">
            <div className="h-16 w-16 relative flex-shrink-0 character-container">
              <Image src="/images/berry.png" alt="Berry" fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Berry</h3>
              <p>Click to earn 1 point. These are the most common characters.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg shadow-md transform hover:scale-102 transition-transform border-2 border-blue-200 dark:border-blue-800">
            <div className="h-16 w-16 relative flex-shrink-0 character-container">
              <Image src="/images/bounce.gif" alt="Blueberry" fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Blueberry</h3>
              <p>Rare special berry! Gives you 5x points for 2 seconds. Only appears 1-3 times per game.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg shadow-md transform hover:scale-102 transition-transform border-2 border-red-200 dark:border-red-800">
            <div className="h-16 w-16 relative flex-shrink-0 character-container">
              <Image src="/images/Carlov1.png" alt="Carlo" fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Carlo</h3>
              <p>Avoid clicking! You'll lose 2 points if you hit Carlo.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg shadow-md transform hover:scale-102 transition-transform border-2 border-blue-200 dark:border-blue-800">
            <div className="h-16 w-16 relative flex-shrink-0 character-container">
              <Image src="/images/scottv1.png" alt="Scott" fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Scott</h3>
              <p>Click to earn 1 point and speed up time by 1.5x for 3 seconds!</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg shadow-md transform hover:scale-102 transition-transform border-2 border-green-200 dark:border-green-800">
            <div className="h-16 w-16 relative flex-shrink-0 character-container">
              <Image src="/images/toliv1.png" alt="Toli" fill className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Toli</h3>
              <p>Click to earn 1 point and add 2 seconds to your timer!</p>
            </div>
          </div>

          <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg shadow-md transform hover:scale-102 transition-transform border-2 border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-bold mb-2">Grid Sizes</h3>
            <ul className="space-y-1 list-disc pl-5">
              <li>3x3: Standard speed</li>
              <li>4x4: Berries stay 1.2x longer</li>
              <li>5x5: Berries stay 1.5x longer</li>
              <li>6x6: Berries stay 1.8x longer</li>
            </ul>
            <p className="mt-2 text-sm">Larger grids have more characters appearing at once!</p>
          </div>

          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg shadow-md transform hover:scale-102 transition-transform border-2 border-indigo-200 dark:border-indigo-800 mt-6">
            <h3 className="text-lg font-bold mb-2">Power-Ups</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl text-blue-500">⏱️</span>
                <span className="font-medium">Time Freeze</span>
                <span className="text-sm text-muted-foreground">- Freezes the timer for 3 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl text-yellow-500">2️⃣</span>
                <span className="font-medium">Double Points</span>
                <span className="text-sm text-muted-foreground">- Doubles all points for 5 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl text-purple-500">🐢</span>
                <span className="font-medium">Slow Mode</span>
                <span className="text-sm text-muted-foreground">- Slows down time for 8 seconds</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setView("menu")}
          className="mt-8 w-full py-4 shadow-lg border-b-4 border-primary/70 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
        >
          Back to Bodega
        </Button>
      </div>
    )
  }

  // Find the renderLeaderboard function and replace it with this updated version:

  const renderLeaderboard = () => {
    // Group leaderboard entries by grid size
    const entriesByGrid: Record<string, LeaderboardEntry[]> = {}

    // Initialize with empty arrays for each grid size
    ;[3, 4, 5, 6].forEach((size) => {
      entriesByGrid[size] = []
    })

    // Group entries by grid size
    leaderboard.forEach((entry) => {
      if (!entriesByGrid[entry.gridSize]) {
        entriesByGrid[entry.gridSize] = []
      }
      entriesByGrid[entry.gridSize].push(entry)
    })

    // Sort entries within each grid size
    Object.keys(entriesByGrid).forEach((size) => {
      entriesByGrid[size].sort((a, b) => b.score - a.score)
    })

    // Find the grid size with the most entries to default to
    let defaultGridTab = "3"
    let maxEntries = 0
    Object.keys(entriesByGrid).forEach((size) => {
      if (entriesByGrid[size].length > maxEntries) {
        maxEntries = entriesByGrid[size].length
        defaultGridTab = size
      }
    })

    // If the player just finished a game, default to that grid size
    if (finalScore > 0) {
      defaultGridTab = gridSize.toString()
    }

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6 leaderboard-title">
          <Trophy className="inline-block mr-2 h-6 w-6 text-yellow-400" />
          Leaderboard
        </h2>

        {showHooray && (
          <div className="flex justify-center mb-4">
            <div className="w-40 h-40 relative animate-bounce-slow">
              <Image
                src="/images/Hooray-berries-caption.gif"
                alt="Hooray Berries"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
          </div>
        )}

        <Tabs defaultValue={defaultGridTab} className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="3">3×3 Grid</TabsTrigger>
            <TabsTrigger value="4">4×4 Grid</TabsTrigger>
            <TabsTrigger value="5">5×5 Grid</TabsTrigger>
            <TabsTrigger value="6">6×6 Grid</TabsTrigger>
          </TabsList>

          {[3, 4, 5, 6].map((size) => (
            <TabsContent key={size} value={size.toString()}>
              <div className="bg-muted/20 p-3 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {size}×{size} Grid
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {size > 3
                      ? `(Berries stay ${size === 4 ? 1.2 : size === 5 ? 1.5 : 1.8}× longer)`
                      : "(Standard speed)"}
                  </span>
                </h3>

                {entriesByGrid[size].length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {entriesByGrid[size].map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex justify-between p-4 rounded-lg shadow-md transform hover:scale-102 transition-transform ${
                          index === 0
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 animate-pulse-slow"
                            : index === 1
                              ? "bg-gray-100 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-600"
                              : index === 2
                                ? "bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700"
                                : "bg-muted/50 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full 
                        ${
                          index === 0
                            ? "bg-yellow-400 text-yellow-900"
                            : index === 1
                              ? "bg-gray-300 text-gray-800"
                              : index === 2
                                ? "bg-amber-400 text-amber-900"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                          >
                            {index + 1}
                          </div>

                          <div>
                            <div className="flex items-center">
                              <span className="text-lg font-bold">{entry.score} points</span>
                              {index < 3 && (
                                <Award
                                  className={`ml-1 h-4 w-4 ${
                                    index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-600"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-2 text-xs text-muted-foreground">
                              <span className="font-medium">{entry.name}</span>
                              {entry.maxCombo > 0 && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="flex items-center">
                                    <span
                                      className={`${entry.maxCombo >= 10 ? "text-purple-500 dark:text-purple-400 font-semibold" : entry.maxCombo >= 5 ? "text-blue-500 dark:text-blue-400 font-semibold" : ""}`}
                                    >
                                      {entry.maxCombo}x Combo
                                    </span>
                                    {entry.maxCombo >= 10 && <span className="ml-1 text-yellow-500">★</span>}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground self-center">{entry.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted/30 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
                    <p className="text-muted-foreground">
                      No scores yet for {size}×{size} grid. Play a game!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-3 mt-8">
          <Button
            onClick={() => setView("menu")}
            className="flex-1 py-4 shadow-lg border-b-4 border-primary/70 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Bodega
          </Button>

          <Button
            onClick={startGame}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 shadow-lg border-b-4 border-green-800 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
          >
            <Play className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </div>
      </div>
    )
  }

  // Find the renderNameInput function and update it to include the XP bar

  // Render the name input screen
  const renderNameInput = () => {
    console.log("Rendering name input with score:", finalScore)

    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-shadow-lg">Game Over!</h2>
          <div className="mt-2 text-3xl font-bold text-primary animate-pulse">{finalScore} points</div>
          {maxCombo > 2 && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Max Combo:</span> {maxCombo}x
              {maxCombo >= 10 ? " (Berry Master!)" : maxCombo >= 5 ? " (Combo Pro!)" : ""}
            </div>
          )}

          {isNewHighScore && (
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="text-yellow-500 font-bold mb-2 flex items-center">
                <Sparkles className="h-5 w-5 mr-1" />
                <span>New High Score!</span>
                <Sparkles className="h-5 w-5 ml-1" />
              </div>
              <div className="w-40 h-40 relative animate-bounce-slow">
                <Image
                  src="/images/Hooray-berries-caption.gif"
                  alt="Hooray Berries"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* XP gain display */}
          {showXpAnimation && (
            <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold mb-1 flex items-center justify-center">
                <Zap className="h-5 w-5 mr-1 text-yellow-500" />
                <span>+{xpGained} XP Gained!</span>
              </div>

              {/* XP bar showing previous level progress and new progress */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Level {playerSkills.level}</span>
                  <span>Level {playerSkills.level + 1}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  {/* Previous XP */}
                  <div
                    className="h-full bg-indigo-400 transition-all duration-300"
                    style={{ width: `${(previousExperience / playerSkills.experienceToNextLevel) * 100}%` }}
                  ></div>
                  {/* New XP (animated) */}
                  <div
                    className="h-full bg-indigo-600 animate-pulse transition-all duration-1000"
                    style={{
                      width: `${(playerSkills.experience / playerSkills.experienceToNextLevel) * 100 - (previousExperience / playerSkills.experienceToNextLevel) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                  {playerSkills.experience} / {playerSkills.experienceToNextLevel} XP
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <div className="font-medium mb-1">XP Breakdown:</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>Score:</div>
                  <div>+{Math.floor(finalScore * 0.5)} XP</div>

                  <div>Game Completion:</div>
                  <div>+{Math.min(5, finalScore / 20).toFixed(1)} XP</div>

                  {maxCombo > 8 && (
                    <>
                      <div>Max Combo:</div>
                      <div>+{Math.max(0, (maxCombo - 8) * 1)} XP</div>
                    </>
                  )}

                  {gridSize > 3 && (
                    <>
                      <div>Grid Difficulty:</div>
                      <div>+{(gridSize - 3) * 2} XP</div>
                    </>
                  )}

                  {finalScore > highScore && (
                    <>
                      <div>New High Score:</div>
                      <div>+25 XP</div>
                    </>
                  )}

                  <div className="col-span-2 text-xs italic mt-1">*XP scales down as you get better at the game</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 bg-white/50 dark:bg-gray-800/50 p-5 rounded-xl shadow-lg border-2 border-primary/30">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-lg font-medium">
              Enter your name for the leaderboard:
            </Label>
            <Input
              id="playerName"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="border-2 focus:border-primary shadow-inner py-6 text-lg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={addToLeaderboard}
              className="col-span-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-6 shadow-lg border-b-4 border-green-800 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Save Score
            </Button>

            <Button
              onClick={() => setView("leaderboard")}
              className="col-span-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-6 shadow-lg border-b-4 border-blue-800 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
            >
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render the game screen
  const renderGame = () => {
    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold">
            <div className="h-8 w-8 relative character-container">
              <Image src="/images/berry.png" alt="Berry" width={32} height={32} className="object-contain" />
            </div>
            <span className={`score-display text-2xl ${theme?.scoreColor || "text-pink-600 dark:text-pink-400"}`}>
              {score}
            </span>
            {/* Combo display */}
            {combo > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <div
                  className={`px-2 py-0.5 rounded-full text-sm font-bold ${
                    comboMultiplier >= 3
                      ? "bg-purple-500 text-white"
                      : comboMultiplier >= 2
                        ? "bg-blue-500 text-white"
                        : comboMultiplier > 1
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  } ${combo > 2 ? "combo-pulse" : ""}`}
                >
                  {combo}x
                </div>
                {comboMultiplier > 1 && (
                  <div className={`text-xs font-medium ${theme?.comboColor || "text-yellow-500"}`}>
                    {comboMultiplier}x points
                  </div>
                )}
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${theme?.accentColor || "bg-green-500"} transition-all duration-100`}
                    style={{ width: `${(comboTimeLeft / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {/* combo frenzy indicator */}
            {comboFrenzyActive && (
              <div className="flex items-center gap-1 ml-2">
                <div className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white animate-pulse">
                  Combo Frenzy
                  {comboFrenzyEndTime && (
                    <span className="ml-1">{Math.max(0, Math.ceil((comboFrenzyEndTime - Date.now()) / 1000))}s</span>
                  )}
                </div>
              </div>
            )}
            {/* Blueberry multiplier display */}
            {blueberryMultiplierActive && (
              <div className="flex items-center gap-1 ml-2">
                <div className="px-2 py-0.5 rounded-full text-sm font-bold bg-blue-500 text-white blueberry-pulse">
                  5x Points
                  <span className="ml-1">{calculateBlueberryMultiplierRemaining()}s</span>
                </div>
              </div>
            )}
            {lastScoreChange && (
              <span
                className={`ml-2 text-sm font-medium ${
                  lastScoreChange.value > 0 ? "text-green-500" : "text-red-500"
                } score-change`}
              >
                {lastScoreChange.value > 0 ? "+" : ""}
                {lastScoreChange.value}
              </span>
            )}
            {/* Power-up indicators */}
            {powerUps.some((p) => p.active) && (
              <div className="flex items-center gap-1 ml-2">
                {powerUps.map(
                  (powerUp) =>
                    powerUp.active && (
                      <div
                        key={powerUp.type}
                        className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${
                          powerUp.type === "freeze"
                            ? "bg-blue-500"
                            : powerUp.type === "double"
                              ? "bg-yellow-500"
                              : "bg-purple-500"
                        } power-up-pulse`}
                      >
                        {powerUp.type === "freeze"
                          ? "⏱️ Time Freeze"
                          : powerUp.type === "double"
                            ? "2️⃣ Double Points"
                            : "🐢 Slow Mode"}
                        {powerUp.endTime && (
                          <span className="ml-1">{Math.max(0, Math.ceil((powerUp.endTime - Date.now()) / 1000))}s</span>
                        )}
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xl font-bold">
            <Timer
              className={`h-6 w-6 ${timeSpeedUp ? "text-orange-500 animate-pulse" : theme?.timerColor || "text-blue-500"}`}
            />
            <span className={`timer-display ${theme?.timerColor || "text-blue-500"}`}>{timeLeft.toFixed(1)}s</span>
            {timeSpeedUp && (
              <div className="flex items-center gap-1 text-xs font-medium text-orange-500 speed-indicator">
                <Zap className="h-3 w-3" />
                <span>{calculateSpeedUpTimeRemaining()}s</span>
              </div>
            )}
            {timeBonus && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-500 time-bonus">
                <Clock className="h-3 w-3" />
                <span>+{timeBonus.amount}s</span>
              </div>
            )}
            <div className="ml-2 text-xs text-blue-500 opacity-70">
              🫐: {blueberryCount}/{maxBlueberryAppearances}
            </div>
          </div>
        </div>

        {gameActive && (
          <UltimateAbilities
            onUseGoldenHammer={useGoldenHammer}
            onUseTimeWarp={useTimeWarp}
            onUseComboFrenzy={useComboFrenzy}
            onUseBerryExplosion={useBerryExplosion}
            goldenHammerCharges={goldenHammerCharges}
            timeWarpCharges={timeWarpCharges}
            comboFrenzyCharges={comboFrenzyCharges}
            berryExplosionCharges={berryExplosionCharges}
            gameActive={gameActive}
          />
        )}

        <div
          ref={gameAreaRef}
          className="mb-6 game-grid relative"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gap: "0.5rem",
            position: "relative",
          }}
        >
          {/* Background with day/night cycle and dynamic intensity */}
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            {/* Base background image */}
            <Image
              src={theme?.background || "/placeholder.svg"}
              alt="Game background"
              fill
              className="object-cover transition-all duration-1000"
              style={{
                opacity: 0.8,
                filter: `brightness(${backgroundIntensity}) saturate(${100 + score / 10}%)`,
              }}
              priority
            />

            {/* Day/night overlay */}
            <div
              className="absolute inset-0 z-1 transition-opacity duration-1000"
              style={{
                background: `linear-gradient(to bottom, 
                  ${interpolateColor("#87CEEB", "#1A237E", dayNightProgress)}, 
                  ${interpolateColor("#E0F7FA", "#311B92", dayNightProgress)})`,
                opacity: 0.3,
                mixBlendMode: "overlay",
              }}
            />

            {/* Stars that appear at night */}
            <div
              className="absolute inset-0 z-1 transition-opacity duration-1000"
              style={{
                backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                backgroundSize: "50px 50px",
                opacity: dayNightProgress * 0.5,
              }}
            />
          </div>
          <AchievementNotification />
          {holes.map((hole, index) => {
            // Check if this hole has a power-up
            const powerUp = powerUps.find((p) => p.position === index)

            return (
              <div
                key={index}
                className={`relative cursor-pointer overflow-hidden rounded-full game-hole ${
                  whackEffect?.index === index ? "whack-animation" : ""
                }`}
                style={{
                  height: `${Math.min(28, 100 / gridSize)}vmin`,
                  maxHeight: "100px",
                  background: `linear-gradient(to bottom, ${theme?.holeGradient ? "var(--hole-gradient-start), var(--hole-gradient-end)" : "#2d6a4f, #1b4332"})`,
                  boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                  position: "relative",
                  zIndex: 1,
                }}
                onClick={(e) => whackHole(index, e)}
              >
                {/* Power-up display - separate from character display */}
                {powerUp && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 transform transition-all duration-300 pointer-events-none translate-y-0 z-10 power-up-glow"
                    style={{
                      height: `${Math.min(20, 70 / gridSize)}vmin`,
                      width: `${Math.min(20, 70 / gridSize)}vmin`,
                      maxHeight: "70px",
                      maxWidth: "70px",
                    }}
                  >
                    <div className="relative h-full w-full flex items-center justify-center">
                      <div
                        className={`text-2xl ${
                          powerUp.type === "freeze"
                            ? "text-blue-500"
                            : powerUp.type === "double"
                              ? "text-yellow-500"
                              : "text-purple-500"
                        }`}
                      >
                        {powerUp.type === "freeze" ? "⏱️" : powerUp.type === "double" ? "2️⃣" : "🐢"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Character display with 3D rotation */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 transform transition-all duration-300 character pointer-events-none ${
                    hole.visible ? "translate-y-0" : "translate-y-full"
                  } ${hole.fadeOut ? "opacity-0" : "opacity-100"}`}
                  style={{
                    height: `${Math.min(24, 90 / gridSize)}vmin`,
                    width: `${Math.min(24, 90 / gridSize)}vmin`,
                    maxHeight: "90px",
                    maxWidth: "90px",
                    zIndex: 2,
                    transform: `translate(-50%, ${hole.visible ? "0" : "100%"}) 
                      ${
                        characterRotations[index]
                          ? `perspective(500px) rotateY(${characterRotations[index].y}deg) rotateX(${characterRotations[index].x}deg)`
                          : ""
                      }`,
                    transformOrigin: "center bottom",
                    transition: "transform 0.3s ease, opacity 0.3s ease",
                  }}
                >
                  {(hole.visible || hole.fadeOut) && hole.character && (
                    <div
                      className={`relative h-full w-full ${
                        hole.character === "berry"
                          ? "character-bounce-berry"
                          : hole.character === "carlo"
                            ? "character-bounce-carlo"
                            : hole.character === "scott"
                              ? "character-bounce-scott"
                              : hole.character === "toli"
                                ? "character-bounce-toli"
                                : "character-bounce-blueberry"
                      }`}
                    >
                      <Image
                        src={
                          hole.character === "carlo"
                            ? "/images/Carlov1.png"
                            : hole.character === "scott"
                              ? "/images/scottv1.png"
                              : hole.character === "toli"
                                ? "/images/toliv1.png"
                                : hole.character === "blueberry"
                                  ? "/images/bounce.gif"
                                  : "/images/berry.png"
                        }
                        alt={hole.character}
                        fill
                        className={`object-contain ${hole.character === "blueberry" ? "blueberry-glow" : ""}`}
                      />

                      {/* Character shadow */}
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/30 blur-sm z-0"
                        style={{
                          width: "80%",
                          height: "10%",
                          transform: `scale(${
                            characterRotations[index]
                              ? Math.max(0.8, 1 - Math.abs(characterRotations[index].y) / 20)
                              : 1
                          }, 1)`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Inner shadow for hole */}
                <div className="absolute inset-0 rounded-full shadow-inner-hole pointer-events-none"></div>
              </div>
            )
          })}

          {/* Hammer animation */}
          {showHammer && hammerPosition && (
            <div
              className="absolute hammer-animation pointer-events-none z-10"
              style={{
                left: `${hammerPosition.x - 30}px`,
                top: `${hammerPosition.y - 30}px`,
                width: "60px",
                height: "60px",
              }}
            >
              <Image src="/images/OutHammer.gif" alt="Hammer" width={60} height={60} className="object-contain" />
            </div>
          )}

          {/* Custom cursor */}
          {gameActive && (
            <div
              className="absolute hammer-cursor pointer-events-none z-10"
              style={{
                left: hammerPosition ? `${hammerPosition.x - 15}px` : "0",
                top: hammerPosition ? `${hammerPosition.y - 15}px` : "0",
                width: "30px",
                height: "30px",
                opacity: showHammer ? 0 : 0.7,
              }}
            >
              <Image
                src="/images/OutHammer.gif"
                alt="Hammer Cursor"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
          )}

          {/* Particle effects */}
          {showParticles &&
            particles.map((particle, i) => (
              <div
                key={i}
                className="absolute particle"
                data-shape={particle.shape || "circle"}
                style={
                  {
                    left: `${particle.x}px`,
                    top: `${particle.y}px`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    "--random-x": Math.random() * 2 - 1,
                    animation: `particleFade 1s forwards, particleMove ${1 / particle.speed}s forwards`,
                    boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
                    transform: particle.rotation ? `rotate(${particle.rotation}deg)` : "",
                  } as React.CSSProperties
                }
              />
            ))}

          {/* Ambient particles */}
          {gameActive &&
            ambientParticles.map((particle, i) => (
              <div
                key={`ambient-${i}`}
                className="absolute rounded-full ambient-particle"
                style={{
                  left: `${particle.x}px`,
                  top: `${particle.y}px`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  opacity: particle.opacity,
                }}
              />
            ))}

          {/* Combo milestone effect */}
          {showComboEffect && comboEffectPosition && (
            <div
              className="absolute z-20 combo-milestone-effect"
              style={{
                left: `${comboEffectPosition.x}px`,
                top: `${comboEffectPosition.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="text-4xl font-bold text-yellow-400 combo-text-effect">{lastComboMilestone}x COMBO!</div>
              <div className="combo-ring"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          {!gameActive ? (
            <>
              <p className="text-center text-lg">
                {timeLeft === 0 ? `Game Over! Your score: ${score}` : "Whack the berries when they appear!"}
              </p>
              <div className="text-center text-sm space-y-1">
                <p className="text-muted-foreground">Watch out for Carlo! Hitting him will cost you 2 points!</p>
                <p className="text-muted-foreground">Hit Scott to speed up time by 1.5x for 3 seconds!</p>
                <p className="text-muted-foreground">Hit Toli to add 2 seconds to your timer!</p>
                <p className="text-muted-foreground">Look for the rare Blueberry for a 5x points boost!</p>
              </div>
              {highScore > 0 && <p className="text-center font-semibold">High Score: {highScore}</p>}

              <div className="flex w-full gap-2">
                <Button
                  onClick={startGame}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 text-lg font-bold shadow-lg border-b-4 border-green-800 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
                >
                  {timeLeft === 0 ? "Play Again" : "Start Game"}
                </Button>

                {timeLeft === 0 && score > 0 && (
                  <Button
                    onClick={() => {
                      // Make sure to use the current score
                      setFinalScore(score)
                      setView("name-input")
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 px-6 py-3 text-lg font-bold shadow-lg border-b-4 border-amber-800 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    Save to Leaderboard
                  </Button>
                )}

                <Button
                  onClick={() => setView("menu")}
                  className="flex-1 bg-secondary px-6 py-3 text-lg font-bold shadow-lg border-b-4 border-secondary-foreground/30 hover:border-b-2 hover:mt-0.5 hover:mb-0.5 active:border-b-0 active:mt-1 active:mb-0 transition-all duration-150"
                >
                  Back to Bodega
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full">
              {confirmExit ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4 text-center shadow-lg border-2 border-red-200 dark:border-red-800">
                  <p className="font-medium mb-2">Are you sure you want to quit?</p>
                  <p className="text-sm text-muted-foreground mb-3">Your progress will be lost!</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={returnToMenu}
                      variant="destructive"
                      className="flex-1 shadow-md border-b-2 border-red-800 hover:border-b-0 hover:mt-0.5 active:mt-1 transition-all duration-150"
                    >
                      Yes, Quit
                    </Button>
                    <Button
                      onClick={() => setConfirmExit(false)}
                      variant="outline"
                      className="flex-1 shadow-md border-2 hover:bg-muted/50 transition-all duration-150"
                    >
                      Keep Playing
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={returnToMenu}
                  variant="outline"
                  className="w-full flex items-center justify-center shadow-md border-2 hover:bg-muted/50 transition-all duration-150"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Bodega
                </Button>
              )}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className={`flex min-h-[80vh] flex-col items-center justify-center p-4 ${bangers.variable} relative`}>
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <Image
          src={theme?.background || "/placeholder.svg"}
          alt="Game background"
          fill
          className="object-cover opacity-80"
          priority
        />
      </div>

      <Card
        className={`w-full max-w-2xl p-6 shadow-xl border-2 ${
          theme?.id === "forest"
            ? "border-emerald-200 dark:border-emerald-800"
            : theme?.id === "beach"
              ? "border-amber-200 dark:border-amber-800"
              : theme?.id === "space"
                ? "border-indigo-200 dark:border-indigo-800"
                : "border-gray-200 dark:border-gray-700"
        } game-card relative z-10 ${theme?.cardBackground || "bg-white/90 dark:bg-gray-900/90"}`}
      >
        {view === "menu" && renderMenu()}
        {view === "game" && renderGame()}
        {view === "info" && renderInfo()}
        {view === "leaderboard" && renderLeaderboard()}
        {view === "name-input" && renderNameInput()}
        {view === "skills" && <SkillsView onBack={() => setView("menu")} />}
        {view === "profile" && <ProfilePage onBack={() => setView("menu")} />}
      </Card>

      <style jsx global>{`
        /* All the existing styles remain the same */
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes particleFade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes particleMove {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-80px) translateX(calc(var(--random-x) * 60px));
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: perspective(500px) rotateX(10deg) translateY(0);
          }
          50% {
            transform: perspective(500px) rotateX(10deg) translateY(-10px);
          }
        }

        @keyframes characterBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10%);
          }
        }

        @keyframes whack {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes hammerWhack {
          0% {
            transform: rotate(-20deg) scale(1);
          }
          50% {
            transform: rotate(0deg) scale(1.2);
          }
          100% {
            transform: rotate(10deg) scale(1);
          }
        }

        .hammer-animation {
          animation: hammerWhack 0.3s ease-in-out;
          transform-origin: bottom right;
        }

        .title-3d, .leaderboard-title {
          text-align: center;
          margin-bottom: 1rem;
          color: var(--theme-title-color);
          text-shadow: 0 1px 0 #cc5599, 0 2px 0 #bb4488, 0 3px 0 #aa3377, 0 4px 0 #992266, 0 5px 0 #881155,
            0 6px 0 #770044, 0 7px 0 #660033, 0 8px 7px rgba(0, 0, 0, 0.4);
          font-family: var(--font-bangers), 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive;
          transform: perspective(500px) rotateX(10deg);
          animation: bounce 2s infinite;
        }

        body, button, input, select {
          font-family: var(--font-bangers), 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive;
        }

        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .game-card {
          transform: perspective(1000px) rotateX(2deg);
          transition: all 0.3s ease;
        }

        .game-card:hover {
          transform: perspective(1000px) rotateX(0deg);
        }

        .character-container {
          transform: translateY(0);
          animation: characterBounce 2s infinite ease-in-out;
        }

        .character-bounce {
          animation: characterBounce 0.5s infinite ease-in-out;
        }

        @keyframes characterBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10%);
          }
        }

        .score-display {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .timer-display {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .score-change {
          animation: fadeOut 1s forwards;
        }

        .time-bonus {
          animation: fadeOut 1s forwards;
        }

        .speed-indicator {
          animation: pulse 0.5s infinite;
        }

        .game-hole {
          transition: transform 0.1s ease;
        }

        .game-hole:hover {
          transform: scale(1.05);
        }

        .whack-animation {
          animation: whack 0.3s ease;
        }

        .shadow-inner-hole {
          box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.4);
        }

        .high-score-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(to right, #ffd700, #ffb700);
          border-radius: 9999px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          color: #7e5304;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        /* Scale effect for hover */
        .transform.hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15%);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }

        /* Hide default cursor when game is active */
        .game-grid {
          cursor: none;
        }

        @keyframes combo-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .combo-pulse {
          animation: combo-pulse 0.5s infinite;
        }
        
        @keyframes power-up-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .power-up-pulse {
          animation: power-up-pulse 1s infinite;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .power-up-glow {
          animation: power-up-pulse 1s infinite;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .blueberry-pulse {
          animation: power-up-pulse 0.5s infinite;
          filter: drop-shadow(0 0 5px #4169E1);
        }

        @keyframes screen-shake {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          10% {
            transform: translateX(-5px) translateY(3px);
          }
          20% {
            transform: translateX(5px) translateY(-3px);
          }
          30% {
            transform: translateX(-3px) translateY(5px);
          }
          40% {
            transform: translateX(3px) translateY(-5px);
          }
          50% {
            transform: translateX(-2px) translateY(2px);
          }
          60% {
            transform: translateX(2px) translateY(-2px);
          }
          70% {
            transform: translateX(-1px) translateY(1px);
          }
          80% {
            transform: translateX(1px) translateY(-1px);
          }
        }

        .screen-shake {
          animation: screen-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes combo-text-effect {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-40px) scale(1.5);
            opacity: 0;
          }
        }

        .combo-text-effect {
          animation: combo-text-effect 1.5s ease-out forwards;
        }

        @keyframes combo-ring-effect {
          0% {
            transform: scale(0);
            opacity: 0.5;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          100% {
            transform: scale(2);
            opacity: 0;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0);
          }
        }

        .combo-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 5px solid rgba(255, 215, 0, 0.7);
          animation: combo-ring-effect 1.5s ease-out forwards;
        }

        @keyframes character-bounce-berry {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5%);
          }
        }

        @keyframes character-bounce-carlo {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8%);
          }
        }

        @keyframes character-bounce-scott {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7%);
          }
        }

        @keyframes character-bounce-toli {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6%);
          }
        }

        @keyframes character-bounce-blueberry {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12%);
          }
        }

        .character-bounce-berry {
          animation: character-bounce-berry 0.5s infinite ease-in-out;
        }

        .character-bounce-carlo {
          animation: character-bounce-carlo 0.5s infinite ease-in-out;
        }

        .character-bounce-scott {
          animation: character-bounce-scott 0.5s infinite ease-in-out;
        }

        .character-bounce-toli {
          animation: character-bounce-toli 0.5s infinite ease-in-out;
        }

        .character-bounce-blueberry {
          animation: character-bounce-blueberry 0.5s infinite ease-in-out;
        }

        @keyframes blueberry-glow {
          0%, 100% {
            box-shadow: 0 0 15px #4169E1;
          }
          50% {
            box-shadow: 0 0 25px #4169E1;
          }
        }

        .blueberry-glow {
          animation: blueberry-glow 2s infinite;
        }

        :root {
          --theme-title-color: ${theme?.titleColor?.replace("text-", "").replace("dark:", "") || "pink-500"};
          --hole-gradient-start: ${
            theme?.id === "forest"
              ? "#2d6a4f"
              : theme?.id === "beach"
                ? "#b45309"
                : theme?.id === "space"
                  ? "#312e81"
                  : "#2d6a4f"
          };
          --hole-gradient-end: ${
            theme?.id === "forest"
              ? "#1b4332"
              : theme?.id === "beach"
                ? "#92400e"
                : theme?.id === "space"
                  ? "#4c1d95"
                  : "#1b4332"
          };
        }
      `}</style>
    </div>
  )
}

