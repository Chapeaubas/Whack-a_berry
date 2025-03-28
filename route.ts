import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

const LEADERBOARD_KEY = "whack-a-berry-leaderboard"

// GET endpoint to retrieve leaderboard data
export async function GET() {
  try {
    // Check if KV environment variables are available
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.log("KV environment variables not found, returning empty leaderboard")
      // Return an empty array if KV is not configured
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get leaderboard data from KV store
    const leaderboardData = (await kv.get<any[]>(LEADERBOARD_KEY)) || []

    return NextResponse.json({
      success: true,
      data: leaderboardData,
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch leaderboard data" }, { status: 500 })
  }
}

// POST endpoint to add a new entry to the leaderboard
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the request body
    if (!body.name || typeof body.score !== "number" || !body.gridSize) {
      return NextResponse.json({ success: false, error: "Invalid leaderboard entry data" }, { status: 400 })
    }

    // Create a new entry
    const newEntry = {
      id: Date.now().toString(),
      name: body.name,
      score: body.score,
      date: new Date().toLocaleDateString(),
      gridSize: body.gridSize,
      maxCombo: body.maxCombo || 0, // Add maxCombo to the entry
    }

    // Check if KV environment variables are available
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.log("KV environment variables not found, returning entry without saving")
      // Return the entry without saving to KV
      return NextResponse.json({
        success: true,
        data: newEntry,
      })
    }

    // Get current leaderboard
    const currentLeaderboard = (await kv.get<any[]>(LEADERBOARD_KEY)) || []

    // Add new entry
    const updatedLeaderboard = [...currentLeaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)

    // Save updated leaderboard
    await kv.set(LEADERBOARD_KEY, updatedLeaderboard)

    return NextResponse.json({
      success: true,
      data: newEntry,
    })
  } catch (error) {
    console.error("Error adding leaderboard entry:", error)
    return NextResponse.json({ success: false, error: "Failed to add leaderboard entry" }, { status: 500 })
  }
}

