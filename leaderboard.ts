// Helper functions for leaderboard operations

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  date: string
  gridSize: number
  maxCombo?: number // Add maxCombo field
}

// Function to fetch leaderboard data from API
export async function fetchLeaderboard() {
  try {
    const response = await fetch("/api/leaderboard")

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch leaderboard")
    }

    // If the API returns an empty array, check localStorage
    if (data.data.length === 0) {
      const savedLeaderboard = localStorage.getItem("whackABerryLeaderboard")
      return savedLeaderboard ? JSON.parse(savedLeaderboard) : []
    }

    return data.data
  } catch (error) {
    console.error("Error fetching leaderboard:", error)

    // Fallback to localStorage if API fails
    const savedLeaderboard = localStorage.getItem("whackABerryLeaderboard")
    return savedLeaderboard ? JSON.parse(savedLeaderboard) : []
  }
}

// Function to add a new entry to the leaderboard
export async function addLeaderboardEntry(entry: {
  name: string
  score: number
  gridSize: number
  maxCombo?: number
}) {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to add leaderboard entry")
    }

    // Always update localStorage as a backup
    const savedLeaderboard = localStorage.getItem("whackABerryLeaderboard") || "[]"
    const leaderboard = JSON.parse(savedLeaderboard)

    const newEntry = {
      id: data.data.id || Date.now().toString(),
      name: entry.name,
      score: entry.score,
      date: data.data.date || new Date().toLocaleDateString(),
      gridSize: entry.gridSize,
      maxCombo: entry.maxCombo || 0,
    }

    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
    localStorage.setItem("whackABerryLeaderboard", JSON.stringify(updatedLeaderboard))

    return data.data
  } catch (error) {
    console.error("Error adding leaderboard entry:", error)

    // Fallback to localStorage if API fails
    const savedLeaderboard = localStorage.getItem("whackABerryLeaderboard") || "[]"
    const leaderboard = JSON.parse(savedLeaderboard)

    const newEntry = {
      id: Date.now().toString(),
      name: entry.name,
      score: entry.score,
      date: new Date().toLocaleDateString(),
      gridSize: entry.gridSize,
      maxCombo: entry.maxCombo || 0,
    }

    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)
    localStorage.setItem("whackABerryLeaderboard", JSON.stringify(updatedLeaderboard))

    return newEntry
  }
}

// Function to get the high score from the leaderboard
export async function getHighScore() {
  try {
    const leaderboard = await fetchLeaderboard()

    if (!leaderboard || leaderboard.length === 0) {
      return 0
    }

    // Find the highest score
    return Math.max(...leaderboard.map((entry) => entry.score))
  } catch (error) {
    console.error("Error getting high score:", error)

    // Fallback to localStorage
    const savedHighScore = localStorage.getItem("whackABerryHighScore")
    return savedHighScore ? Number.parseInt(savedHighScore, 10) : 0
  }
}

