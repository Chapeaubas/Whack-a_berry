// Theme configuration for the game
export type ThemeType = "berry" | "forest" | "beach" | "space"

export interface GameTheme {
  id: ThemeType
  name: string
  background: string
  cardBackground: string
  titleColor: string
  buttonGradient: string
  buttonBorder: string
  accentColor: string
  holeGradient: string
  holeBorder: string
  scoreColor: string
  timerColor: string
  comboColor: string
  particleColors: {
    berry: string[]
    carlo: string[]
    scott: string[]
    toli: string[]
    blueberry: string[]
  }
}

export const themes: Record<ThemeType, GameTheme> = {
  berry: {
    id: "berry",
    name: "Berry Land",
    background: "/images/berry-landscape.webp",
    cardBackground: "bg-white/90 dark:bg-gray-900/90",
    titleColor: "text-pink-500 dark:text-pink-400",
    buttonGradient: "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    buttonBorder: "border-green-800",
    accentColor: "bg-pink-500",
    holeGradient: "from-green-800 to-green-900",
    holeBorder: "border-green-950",
    scoreColor: "text-pink-600 dark:text-pink-400",
    timerColor: "text-blue-600 dark:text-blue-400",
    comboColor: "text-purple-600 dark:text-purple-400",
    particleColors: {
      berry: ["#FF69B4", "#FF1493", "#DB7093"],
      carlo: ["#FF0000", "#FF6347", "#FF4500"],
      scott: ["#1E90FF", "#00BFFF", "#87CEFA"],
      toli: ["#32CD32", "#00FA9A", "#7FFF00"],
      blueberry: ["#4169E1", "#1E90FF", "#00BFFF"],
    },
  },
  forest: {
    id: "forest",
    name: "Enchanted Forest",
    background: "/images/enchanted.png",
    cardBackground: "bg-emerald-50/80 dark:bg-emerald-950/80",
    titleColor: "text-indigo-500 dark:text-indigo-300",
    buttonGradient: "from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
    buttonBorder: "border-indigo-800",
    accentColor: "bg-indigo-500",
    holeGradient: "from-emerald-800 to-emerald-950",
    holeBorder: "border-emerald-950",
    scoreColor: "text-indigo-600 dark:text-indigo-300",
    timerColor: "text-purple-600 dark:text-purple-300",
    comboColor: "text-fuchsia-600 dark:text-fuchsia-300",
    particleColors: {
      berry: ["#FF69B4", "#FF1493", "#DB7093"],
      carlo: ["#FF0000", "#FF6347", "#FF4500"],
      scott: ["#1E90FF", "#00BFFF", "#87CEFA"],
      toli: ["#32CD32", "#00FA9A", "#7FFF00"],
      blueberry: ["#4169E1", "#1E90FF", "#00BFFF"],
    },
  },
  beach: {
    id: "beach",
    name: "Sunny Beach",
    background: "/images/beach.png",
    cardBackground: "bg-amber-50/80 dark:bg-amber-900/80",
    titleColor: "text-orange-500 dark:text-orange-300",
    buttonGradient: "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
    buttonBorder: "border-amber-800",
    accentColor: "bg-amber-500",
    holeGradient: "from-amber-700 to-amber-900",
    holeBorder: "border-amber-950",
    scoreColor: "text-orange-600 dark:text-orange-300",
    timerColor: "text-cyan-600 dark:text-cyan-300",
    comboColor: "text-amber-600 dark:text-amber-300",
    particleColors: {
      berry: ["#FF69B4", "#FF1493", "#DB7093"],
      carlo: ["#FF8C00", "#FFA500", "#FF4500"],
      scott: ["#00CED1", "#20B2AA", "#5F9EA0"],
      toli: ["#32CD32", "#00FA9A", "#7FFF00"],
      blueberry: ["#1E90FF", "#00BFFF", "#87CEFA"],
    },
  },
  space: {
    id: "space",
    name: "Cosmic Space",
    background: "/images/cosmic.png",
    cardBackground: "bg-indigo-50/80 dark:bg-indigo-950/80",
    titleColor: "text-violet-400 dark:text-violet-300",
    buttonGradient: "from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
    buttonBorder: "border-violet-800",
    accentColor: "bg-violet-500",
    holeGradient: "from-indigo-900 to-purple-950",
    holeBorder: "border-indigo-950",
    scoreColor: "text-violet-500 dark:text-violet-300",
    timerColor: "text-blue-400 dark:text-blue-300",
    comboColor: "text-fuchsia-400 dark:text-fuchsia-300",
    particleColors: {
      berry: ["#FF69B4", "#FF1493", "#DB7093"],
      carlo: ["#FF0000", "#FF6347", "#FF4500"],
      scott: ["#1E90FF", "#00BFFF", "#87CEFA"],
      toli: ["#32CD32", "#00FA9A", "#7FFF00"],
      blueberry: ["#4169E1", "#1E90FF", "#00BFFF"],
    },
  },
}

// Default theme
export const defaultTheme: ThemeType = "berry"

// Helper function to get a theme safely
export function getTheme(themeId: ThemeType | undefined): GameTheme {
  if (!themeId || !themes[themeId]) {
    return themes[defaultTheme]
  }
  return themes[themeId]
}

