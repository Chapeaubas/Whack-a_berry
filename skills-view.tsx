"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSkills } from "@/lib/skills-context"
import SkillTree from "@/components/skill-tree"
import { ArrowLeft, RotateCcw, Award, Zap } from "lucide-react"
import { motion } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SkillsViewProps {
  onBack: () => void
}

export default function SkillsView({ onBack }: SkillsViewProps) {
  const { resetSkills, playerSkills } = useSkills()

  return (
    <div className="p-6">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Button>

        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Award className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Level {playerSkills.level}</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Zap className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{playerSkills.skillPoints} Points</span>
          </motion.div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="flex items-center gap-2 text-red-500 hover:text-red-600">
                  <RotateCcw className="h-4 w-4" />
                  Reset Skills
                </Button>
              </motion.div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your skills, level, and experience. You'll start from level 1 with no skills. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetSkills} className="bg-red-500 hover:bg-red-600">
                  Reset Skills
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full overflow-hidden"
      >
        <Card className="p-3 sm:p-6 skill-tree-container max-h-[70vh] sm:max-h-[600px] overflow-auto">
          <div className="min-h-[400px]">
            <SkillTree />
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

