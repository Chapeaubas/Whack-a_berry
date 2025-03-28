"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useAchievements } from "@/contexts/achievement-context"

export function AchievementNotification() {
  const { latestAchievement } = useAchievements()

  return (
    <AnimatePresence>
      {latestAchievement && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-amber-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{latestAchievement.icon}</div>
              <div>
                <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                <p className="font-medium">{latestAchievement.name}</p>
                <p className="text-sm opacity-90">{latestAchievement.description}</p>
                {latestAchievement.reward && (
                  <p className="text-sm mt-1 font-bold">
                    +{latestAchievement.reward.amount} {latestAchievement.reward.type.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

