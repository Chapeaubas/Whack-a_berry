"use client"

import { useState, useEffect } from "react"
import { useSkills } from "@/lib/skills-context"
import { useTheme } from "@/lib/theme-context"
import { useAchievements } from "@/contexts/achievement-context"
import { useGameHistory } from "@/contexts/game-history-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  Star,
  Clock,
  Zap,
  Settings,
  User,
  BarChart2,
  Award,
  History,
  Edit,
  Save,
  Bell,
  Volume2,
  Gamepad2,
  Palette,
  ArrowLeft,
} from "lucide-react"

interface ProfilePageProps {
  onBack: () => void
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { playerSkills } = useSkills()
  const { theme, setTheme, currentTheme } = useTheme()
  const { achievements } = useAchievements()
  const { gameHistory, playerStats } = useGameHistory()

  const [isEditing, setIsEditing] = useState(false)
  const [playerName, setPlayerName] = useState("BerryWhacker42")
  const [playerBio, setPlayerBio] = useState("I love whacking berries and collecting achievements!")
  const [notifications, setNotifications] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Calculate skill tree completion percentage
  const totalSkills = 50 // Example total number of skills
  const unlockedSkills = playerSkills.unlockedSkills.length
  const skillCompletion = Math.round((unlockedSkills / totalSkills) * 100)

  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Save changes
      localStorage.setItem("whackABerryPlayerName", playerName)
      localStorage.setItem("whackABerryPlayerBio", playerBio)
    }
    setIsEditing(!isEditing)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    setTheme(darkMode ? "berry" : "space")
  }

  // Load player name and bio from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("whackABerryPlayerName")
    if (savedName) {
      setPlayerName(savedName)
    }

    const savedBio = localStorage.getItem("whackABerryPlayerBio")
    if (savedBio) {
      setPlayerBio(savedBio)
    }
  }, [])

  return (
    <div className="container mx-auto py-4 px-2">
      <Button onClick={onBack} variant="outline" className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Menu
      </Button>

      <Card className="mb-8 overflow-hidden border-2 shadow-lg">
        {/* Profile header with background */}
        <div className="relative h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-opacity-30 bg-black"></div>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={toggleEdit}
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? "Save" : "Edit Profile"}
          </Button>
        </div>

        {/* Profile info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 relative">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src="/images/berry.png" alt="Profile" />
              <AvatarFallback>BP</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              {isEditing ? (
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-2xl font-bold h-10 mt-2"
                />
              ) : (
                <h2 className="text-2xl font-bold">{playerName}</h2>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  <Trophy className="h-3 w-3" />
                  <span>Rank: Berry Master</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  <Star className="h-3 w-3" />
                  <span>Level {playerSkills.level}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  <Zap className="h-3 w-3" />
                  <span>{playerSkills.skillPoints} Skill Points</span>
                </Badge>
              </div>

              {isEditing ? (
                <div className="pt-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" value={playerBio} onChange={(e) => setPlayerBio(e.target.value)} className="mt-1" />
                </div>
              ) : (
                <p className="text-muted-foreground">{playerBio}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Customize</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Game Statistics
                </CardTitle>
                <CardDescription>Your overall game performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Games</p>
                    <p className="text-2xl font-bold">{playerStats.totalGames}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Score</p>
                    <p className="text-2xl font-bold">{playerStats.totalScore}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{playerStats.averageScore}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Highest Score</p>
                    <p className="text-2xl font-bold">{playerStats.highestScore}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Play Time</p>
                    <p className="text-2xl font-bold">{playerStats.totalPlayTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Highest Combo</p>
                    <p className="text-2xl font-bold">{playerStats.highestCombo}x</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-purple-500" />
                  Character Stats
                </CardTitle>
                <CardDescription>Characters you've encountered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">🍓</span> Berry
                      </span>
                      <span>{playerStats.charactersWhacked.berry}</span>
                    </div>
                    <Progress value={100} className="h-2 bg-pink-100 dark:bg-pink-900/20" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">😠</span> Carlo
                      </span>
                      <span>{playerStats.charactersWhacked.carlo}</span>
                    </div>
                    <Progress
                      value={Math.round(
                        (playerStats.charactersWhacked.carlo / playerStats.charactersWhacked.berry) * 100,
                      )}
                      className="h-2 bg-red-100 dark:bg-red-900/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">🧠</span> Scott
                      </span>
                      <span>{playerStats.charactersWhacked.scott}</span>
                    </div>
                    <Progress
                      value={Math.round(
                        (playerStats.charactersWhacked.scott / playerStats.charactersWhacked.berry) * 100,
                      )}
                      className="h-2 bg-blue-100 dark:bg-blue-900/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">😎</span> Toli
                      </span>
                      <span>{playerStats.charactersWhacked.toli}</span>
                    </div>
                    <Progress
                      value={Math.round(
                        (playerStats.charactersWhacked.toli / playerStats.charactersWhacked.berry) * 100,
                      )}
                      className="h-2 bg-green-100 dark:bg-green-900/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">🫐</span> Blueberry
                      </span>
                      <span>{playerStats.charactersWhacked.blueberry}</span>
                    </div>
                    <Progress
                      value={Math.round(
                        (playerStats.charactersWhacked.blueberry / playerStats.charactersWhacked.berry) * 100,
                      )}
                      className="h-2 bg-indigo-100 dark:bg-indigo-900/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Ultimate Abilities
                </CardTitle>
                <CardDescription>Special powers you've used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" /> Golden Hammer
                    </p>
                    <p className="text-xl font-bold">{playerStats.ultimatesUsed.goldenHammer} uses</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" /> Time Warp
                    </p>
                    <p className="text-xl font-bold">{playerStats.ultimatesUsed.timeWarp} uses</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Zap className="h-4 w-4 text-purple-500" /> Combo Frenzy
                    </p>
                    <p className="text-xl font-bold">{playerStats.ultimatesUsed.comboFrenzy} uses</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="text-lg">✨</span> Berry Explosion
                    </p>
                    <p className="text-xl font-bold">{playerStats.ultimatesUsed.berryExplosion} uses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  Skill Progress
                </CardTitle>
                <CardDescription>Your skill tree advancement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Skill Tree Completion</span>
                    <span>{skillCompletion}%</span>
                  </div>
                  <Progress value={skillCompletion} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Unlocked Skills</p>
                    <p className="text-xl font-bold">
                      {unlockedSkills} / {totalSkills}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Skill Points</p>
                    <p className="text-xl font-bold">{playerSkills.skillPoints}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <p className="text-xl font-bold">{playerSkills.level}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">XP to Next Level</p>
                    <p className="text-xl font-bold">
                      {playerSkills.experience} / {playerSkills.experienceToNextLevel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>Your game accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`border ${achievement.completed ? "border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-800"}`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        {achievement.name}
                        {achievement.completed && <Badge className="ml-auto bg-green-500">Completed</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.completed ? (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed on {achievement.completedDate?.split("T")[0]}
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{Math.round(achievement.progress * 100)}%</span>
                          </div>
                          <Progress value={achievement.progress * 100} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Recent Games
              </CardTitle>
              <CardDescription>Your latest game sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameHistory.length > 0 ? (
                  gameHistory.map((game) => (
                    <Card key={game.id} className="overflow-hidden">
                      <div className="p-4 bg-muted/30">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{game.date}</p>
                            <p className="text-xl font-bold">{game.score} points</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {game.gridSize}×{game.gridSize} Grid
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                              {game.maxCombo}x Combo
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            >
                              {game.duration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                                <span className="text-sm">🍓</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium mt-1">{game.characters.berry}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <span className="text-sm">😠</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium mt-1">{game.characters.carlo}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <span className="text-sm">🧠</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium mt-1">{game.characters.scott}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <span className="text-sm">😎</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium mt-1">{game.characters.toli}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                                <span className="text-sm">🫐</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium mt-1">{game.characters.blueberry}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-8 bg-muted/30 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
                    <p className="text-muted-foreground">No game history yet. Play some games to see your stats!</p>
                  </div>
                )}
              </div>
            </CardContent>
            {gameHistory.length > 5 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Games
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Customization Tab */}
        <TabsContent value="customization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-500" />
                Appearance
              </CardTitle>
              <CardDescription>Customize your game experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Game Theme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${theme === "berry" ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20" : "border-transparent hover:border-gray-300"}`}
                      onClick={() => setTheme("berry")}
                    >
                      <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center">
                        <span className="text-2xl">🍓</span>
                      </div>
                      <p className="text-center mt-2 font-medium">Berry Land</p>
                    </div>
                    <div
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${theme === "forest" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-transparent hover:border-gray-300"}`}
                      onClick={() => setTheme("forest")}
                    >
                      <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                        <span className="text-2xl">🌳</span>
                      </div>
                      <p className="text-center mt-2 font-medium">Enchanted Forest</p>
                    </div>
                    <div
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${theme === "beach" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-transparent hover:border-gray-300"}`}
                      onClick={() => setTheme("beach")}
                    >
                      <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
                        <span className="text-2xl">🏖️</span>
                      </div>
                      <p className="text-center mt-2 font-medium">Sunny Beach</p>
                    </div>
                    <div
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${theme === "space" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-transparent hover:border-gray-300"}`}
                      onClick={() => setTheme("space")}
                    >
                      <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center">
                        <span className="text-2xl">🌌</span>
                      </div>
                      <p className="text-center mt-2 font-medium">Cosmic Space</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Avatar Selection</Label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-2">
                    {["🍓", "🫐", "😠", "🧠", "😎", "🎮", "🌟", "🚀", "🔮", "🎯", "🎨", "🎭"].map((emoji, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${index === 0 ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-transparent hover:border-gray-300"}`}
                      >
                        <div className="aspect-square rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          <span className="text-2xl">{emoji}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Game Preferences</Label>
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                      </div>
                      <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sound-effects">Sound Effects</Label>
                        <p className="text-sm text-muted-foreground">Enable game sound effects</p>
                      </div>
                      <Switch id="sound-effects" checked={soundEffects} onCheckedChange={setSoundEffects} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive game notifications</p>
                      </div>
                      <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" value={playerBio} onChange={(e) => setPlayerBio(e.target.value)} />
                </div>
                <Button className="w-full" onClick={toggleEdit}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-500" />
                Notification Settings
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Game Achievements</Label>
                    <p className="text-sm text-muted-foreground">Notify when you earn achievements</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Score Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify when you beat your high score</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Game Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify about new game features</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-blue-500" />
                Sound Settings
              </CardTitle>
              <CardDescription>Manage your sound preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Game Sounds</Label>
                    <p className="text-sm text-muted-foreground">Enable in-game sound effects</p>
                  </div>
                  <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Background Music</Label>
                    <p className="text-sm text-muted-foreground">Enable background music</p>
                  </div>
                  <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
                </div>
                <div className="space-y-2">
                  <Label>Volume</Label>
                  <div className="pt-2">
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

