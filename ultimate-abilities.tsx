"use client"
import { Button } from "@/components/ui/button"
import { Star, Zap, Clock, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme-context"

interface UltimateAbilitiesProps {
  onUseGoldenHammer: () => void
  onUseTimeWarp: () => void
  onUseComboFrenzy: () => void
  onUseBerryExplosion: () => void
  goldenHammerCharges: number
  timeWarpCharges: number
  comboFrenzyCharges: number
  berryExplosionCharges: number
  gameActive: boolean
}

export default function UltimateAbilities({
  onUseGoldenHammer,
  onUseTimeWarp,
  onUseComboFrenzy,
  onUseBerryExplosion,
  goldenHammerCharges,
  timeWarpCharges,
  comboFrenzyCharges,
  berryExplosionCharges,
  gameActive,
}: UltimateAbilitiesProps) {
  const { currentTheme } = useTheme()

  // Only show if game is active and player has at least one ultimate
  if (
    !gameActive ||
    (goldenHammerCharges === 0 && timeWarpCharges === 0 && comboFrenzyCharges === 0 && berryExplosionCharges === 0)
  ) {
    return null
  }

  return (
    <div className="flex justify-center gap-2 mb-4">
      {goldenHammerCharges > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Button
            onClick={onUseGoldenHammer}
            className="relative bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 border-2 border-yellow-700"
            size="sm"
          >
            <Star className="mr-1 h-4 w-4 text-white" />
            <span>Golden Hammer</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {goldenHammerCharges}
            </span>
          </Button>
        </motion.div>
      )}

      {timeWarpCharges > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        >
          <Button
            onClick={onUseTimeWarp}
            className="relative bg-gradient-to-r from-blue-400 to-cyan-600 hover:from-blue-500 hover:to-cyan-700 border-2 border-blue-700"
            size="sm"
          >
            <Clock className="mr-1 h-4 w-4 text-white" />
            <span>Time Warp</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {timeWarpCharges}
            </span>
          </Button>
        </motion.div>
      )}

      {comboFrenzyCharges > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
        >
          <Button
            onClick={onUseComboFrenzy}
            className="relative bg-gradient-to-r from-purple-400 to-indigo-600 hover:from-purple-500 hover:to-indigo-700 border-2 border-purple-700"
            size="sm"
          >
            <Zap className="mr-1 h-4 w-4 text-white" />
            <span>Combo Frenzy</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {comboFrenzyCharges}
            </span>
          </Button>
        </motion.div>
      )}

      {berryExplosionCharges > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
        >
          <Button
            onClick={onUseBerryExplosion}
            className="relative bg-gradient-to-r from-pink-400 to-rose-600 hover:from-pink-500 hover:to-rose-700 border-2 border-pink-700"
            size="sm"
          >
            <Sparkles className="mr-1 h-4 w-4 text-white" />
            <span>Berry Explosion</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {berryExplosionCharges}
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  )
}

