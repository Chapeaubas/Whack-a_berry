"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Skill, skillTrees, canUnlockSkill, getSkillById } from "@/lib/skills"
import { useSkills } from "@/lib/skills-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star, Zap, Award, BookOpen, HelpCircle, ZoomIn, ZoomOut, Lock, Check, Plus } from "lucide-react"
import { useTheme } from "@/lib/theme-context"

// Add these new helper components for smoother UI

// Animated connection line component
const ConnectionLine = ({
  startX,
  startY,
  endX,
  endY,
  isUnlocked,
  animate = true,
}: {
  startX: number
  startY: number
  endX: number
  endY: number
  isUnlocked: boolean
  animate?: boolean
}) => {
  // If not animating, render a simple line
  if (!animate) {
    return (
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={isUnlocked ? "#10b981" : "#6b7280"}
        strokeWidth={isUnlocked ? "3" : "2"}
        strokeDasharray={isUnlocked ? "" : "5,5"}
      />
    )
  }

  // Otherwise use motion for animation
  return (
    <motion.line
      x1={startX}
      y1={startY}
      x2={animate ? startX : endX}
      y2={animate ? startY : endY}
      stroke={isUnlocked ? "#10b981" : "#6b7280"}
      strokeWidth={isUnlocked ? "3" : "2"}
      strokeDasharray={isUnlocked ? "" : "5,5"}
      initial={animate ? { x2: startX, y2: startY } : false}
      animate={animate ? { x2: endX, y2: endY } : false}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  )
}

// Animated skill node component
const SkillNode = ({
  skill,
  isSelected,
  statusClass,
  nodeSize,
  position,
  onClick,
  isDragging,
}: {
  skill: Skill
  isSelected: boolean
  statusClass: string
  nodeSize: number
  position: { x: number; y: number }
  onClick: () => void
  isDragging: boolean
}) => {
  // Use simpler rendering during drag operations
  if (isDragging) {
    return (
      <div
        className={`absolute rounded-full border-2 flex items-center justify-center cursor-pointer ${
          isSelected ? "ring-4 ring-offset-2 ring-blue-500" : ""
        } ${statusClass}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          willChange: "transform",
        }}
        onClick={onClick}
      >
        <div className="text-2xl">{skill.icon}</div>
        {skill.ultimate && (
          <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs">
            <Star className="h-4 w-4" />
          </div>
        )}
        {skill.currentLevel > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
            {skill.currentLevel}
          </div>
        )}
      </div>
    )
  }

  // Use animated version when not dragging
  return (
    <motion.div
      className={`absolute rounded-full border-2 flex items-center justify-center cursor-pointer ${
        isSelected ? "ring-4 ring-offset-2 ring-blue-500" : ""
      } ${statusClass}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
        willChange: "transform",
        touchAction: "manipulation", // Improve touch behavior
      }}
      onClick={(e) => {
        // Prevent event propagation to avoid triggering drag
        e.stopPropagation()
        onClick()
      }}
      onTouchEnd={(e) => {
        // For mobile: prevent default to avoid double-firing with onClick
        if (!isDragging) {
          e.preventDefault()
        }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <div className="text-2xl">{skill.icon}</div>
      {skill.ultimate && (
        <motion.div
          className="absolute -top-1 -right-1 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Star className="h-4 w-4" />
        </motion.div>
      )}
      {skill.currentLevel > 0 && (
        <motion.div
          className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          {skill.currentLevel}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function SkillTree() {
  const { playerSkills, unlockSkill } = useSkills()
  const [activeTree, setActiveTree] = useState<string>("hammer")
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { currentTheme } = useTheme()
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragRef = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0 })
  const positionRef = useRef({ x: 0, y: 0 })
  const requestRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showTooltips, setShowTooltips] = useState(true)
  const [isInitialRender, setIsInitialRender] = useState(true)

  // Handle skill click
  const handleSkillClick = (skill: Skill) => {
    if (!isDragging) {
      setSelectedSkill(skill)
    }
  }

  // Handle unlock button click with animation
  const handleUnlock = () => {
    if (selectedSkill) {
      unlockSkill(selectedSkill.id)
      // Update selected skill to reflect changes
      const updatedSkill = getSkillById(selectedSkill.id)
      setSelectedSkill(updatedSkill || null)
    }
  }

  // Get the current tree
  const currentTree = skillTrees.find((tree) => tree.id === activeTree) || skillTrees[0]

  // Calculate if a skill can be unlocked
  const canUnlock = (skill: Skill): boolean => {
    // If already at max level, can't unlock further
    if (skill.currentLevel >= skill.maxLevel) return false

    // Check if player has enough skill points
    if (playerSkills.skillPoints < skill.cost) return false

    // Check if prerequisites are met
    return canUnlockSkill(skill.id, playerSkills.unlockedSkills)
  }

  // Update the getSkillStatusClass function to be more explicit about maxed out skills
  const getSkillStatusClass = (skill: Skill): string => {
    if (skill.currentLevel >= skill.maxLevel) {
      return "bg-green-500 border-green-700 dark:bg-green-600 dark:border-green-800" // Maxed out
    }
    if (canUnlock(skill)) {
      return "bg-blue-500 border-blue-700 dark:bg-blue-600 dark:border-blue-800 animate-pulse" // Can be unlocked
    }
    if (skill.currentLevel > 0) {
      return "bg-yellow-500 border-yellow-700 dark:bg-yellow-600 dark:border-yellow-800" // Partially unlocked
    }
    // Check if requirements are met but not enough skill points
    const requirementsMet = skill.requires
      ? skill.requires.every((reqId) => playerSkills.unlockedSkills.includes(reqId))
      : true

    if (requirementsMet && playerSkills.skillPoints < skill.cost) {
      return "bg-orange-400 border-orange-600 dark:bg-orange-700 dark:border-orange-800" // Not enough points
    }

    return "bg-gray-400 border-gray-600 dark:bg-gray-700 dark:border-gray-800" // Locked
  }

  // After initial render, set isInitialRender to false
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialRender(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Handle zoom in
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 1.5))
  }

  // Handle zoom out
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: position.x,
      lastY: position.y,
    }
    positionRef.current = position

    // Cancel any existing animation frame
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
    }
  }

  // Handle mouse move for dragging with requestAnimationFrame
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY

    const newX = dragRef.current.lastX + deltaX
    const newY = dragRef.current.lastY + deltaY

    // Update the ref immediately for smooth tracking
    positionRef.current = { x: newX, y: newY }

    // Use requestAnimationFrame to update state efficiently
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        setPosition(positionRef.current)
        requestRef.current = undefined
      })
    }
  }

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      // Ensure final position is set
      setPosition(positionRef.current)

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = undefined
      }
    }
  }

  // Handle mouse leave to end dragging
  const handleMouseLeave = () => {
    handleMouseUp()
  }

  // Handle touch start for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    const touch = e.touches[0]
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: position.x,
      lastY: position.y,
    }
    positionRef.current = position

    // Cancel any existing animation frame
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
    }
  }

  // Handle touch move for dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    // Prevent default to stop scrolling while dragging
    e.preventDefault()

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragRef.current.startX
    const deltaY = touch.clientY - dragRef.current.startY

    const newX = dragRef.current.lastX + deltaX
    const newY = dragRef.current.lastY + deltaY

    // Update the ref immediately for smooth tracking
    positionRef.current = { x: newX, y: newY }

    // Use requestAnimationFrame to update state efficiently
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        setPosition(positionRef.current)
        requestRef.current = undefined
      })
    }
  }

  // Handle touch end to stop dragging
  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false)
      // Ensure final position is set
      setPosition(positionRef.current)

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = undefined
      }
    }
  }

  // Reset position and scale when changing trees
  useEffect(() => {
    setPosition({ x: 0, y: 0 })
    setScale(1)
    setSelectedSkill(null)
  }, [activeTree])

  // Base size for skill nodes
  const baseSize = 100
  const nodeSize = 64 * scale

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="flex justify-between items-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-xl font-bold">Skill Tree</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Level {playerSkills.level}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-blue-500" />
            <span>{playerSkills.skillPoints} Skill Points</span>
          </Badge>
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="hammer" value={activeTree} onValueChange={setActiveTree}>
          <TabsList className="grid grid-cols-5 mb-4">
            {skillTrees.map((tree) => (
              <TabsTrigger key={tree.id} value={tree.id} className="flex items-center gap-1">
                <span>{tree.icon}</span>
                <span className="hidden sm:inline">{tree.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {skillTrees.map((tree) => (
              <TabsContent key={tree.id} value={tree.id} className="h-full">
                <motion.div
                  className="relative h-[500px] overflow-hidden border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Zoom controls */}
                  <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white dark:bg-gray-800 rounded-md shadow-md p-1">
                    <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8" aria-label="Zoom in">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8" aria-label="Zoom out">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Draggable and zoomable container */}
                  <div
                    ref={containerRef}
                    className={`relative h-full w-full overflow-hidden cursor-grab active:cursor-grabbing skill-tree-container ${isDragging ? "is-dragging" : ""}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseOver={() => setShowTooltips(true)}
                    onMouseOut={() => setShowTooltips(false)}
                  >
                    <div
                      className="absolute skill-tree-draggable"
                      style={{
                        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                        transformOrigin: "center",
                        willChange: "transform",
                        transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)",
                        touchAction: "none", // Add this line to prevent browser touch actions
                      }}
                    >
                      {/* SVG for connections */}
                      <svg
                        ref={svgRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none skill-tree-svg"
                        style={{
                          width: `${Math.max(
                            600,
                            tree.skills.reduce((max, skill) => Math.max(max, (skill.position.x + 1) * baseSize), 0),
                          )}px`,
                          height: `${Math.max(
                            600,
                            tree.skills.reduce((max, skill) => Math.max(max, (skill.position.y + 1) * baseSize), 0),
                          )}px`,
                        }}
                      >
                        {/* Draw connections between skills */}
                        {tree.skills.map((skill) => {
                          if (!skill.requires) return null

                          return skill.requires.map((requiredId, index) => {
                            const requiredSkill = tree.skills.find((s) => s.id === requiredId)
                            if (!requiredSkill) return null

                            // Calculate positions
                            const startX = requiredSkill.position.x * baseSize + baseSize / 2
                            const startY = requiredSkill.position.y * baseSize + baseSize / 2
                            const endX = skill.position.x * baseSize + baseSize / 2
                            const endY = skill.position.y * baseSize + baseSize / 2

                            // Check if connection is unlocked
                            const isUnlocked =
                              playerSkills.unlockedSkills.includes(skill.id) &&
                              playerSkills.unlockedSkills.includes(requiredId)

                            return (
                              <ConnectionLine
                                key={`${skill.id}-${requiredId}`}
                                startX={startX}
                                startY={startY}
                                endX={endX}
                                endY={endY}
                                isUnlocked={isUnlocked}
                                animate={isInitialRender && !isDragging}
                              />
                            )
                          })
                        })}
                      </svg>

                      {/* Skill nodes */}
                      <div
                        className="relative"
                        style={{
                          width: `${Math.max(
                            600,
                            tree.skills.reduce((max, skill) => Math.max(max, (skill.position.x + 1) * baseSize), 0),
                          )}px`,
                          height: `${Math.max(
                            600,
                            tree.skills.reduce((max, skill) => Math.max(max, (skill.position.y + 1) * baseSize), 0),
                          )}px`,
                        }}
                      >
                        {tree.skills.map((skill) => (
                          <TooltipProvider key={skill.id} delayDuration={0}>
                            <Tooltip
                              open={
                                selectedSkill?.id === skill.id ? false : showTooltips && !isDragging ? undefined : false
                              }
                            >
                              <TooltipTrigger asChild>
                                <div>
                                  <SkillNode
                                    skill={skill}
                                    isSelected={selectedSkill?.id === skill.id}
                                    statusClass={getSkillStatusClass(skill)}
                                    nodeSize={nodeSize}
                                    position={{
                                      x: skill.position.x * baseSize + baseSize / 2 - nodeSize / 2,
                                      y: skill.position.y * baseSize + baseSize / 2 - nodeSize / 2,
                                    }}
                                    onClick={() => handleSkillClick(skill)}
                                    isDragging={isDragging}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-xs z-50 p-3 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                                sideOffset={5}
                                avoidCollisions={true}
                              >
                                <div className="space-y-2">
                                  <div className="font-bold flex items-center gap-1 text-base">
                                    <span className="text-xl">{skill.icon}</span>
                                    <span>{skill.name}</span>
                                    {skill.ultimate && <Star className="h-4 w-4 text-purple-500" />}
                                  </div>
                                  <p className="text-sm">{skill.description}</p>
                                  {skill.currentLevel > 0 && (
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                      Current Level: {skill.currentLevel}/{skill.maxLevel}
                                    </p>
                                  )}
                                  {skill.currentLevel < skill.maxLevel && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                      Cost: {skill.cost} Skill Points
                                    </p>
                                  )}
                                  {skill.effects && skill.effects.length > 0 && (
                                    <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                                      <p className="text-xs font-medium mb-1">Effects:</p>
                                      <ul className="text-xs space-y-1">
                                        {skill.effects.map((effect, idx) => (
                                          <li key={idx} className="flex items-center gap-1">
                                            <span>•</span>
                                            <span>
                                              {effect.type
                                                .replace(/([A-Z])/g, " $1")
                                                .replace(/^./, (str) => str.toUpperCase())}
                                              :{" "}
                                              {effect.type.includes("Chance")
                                                ? `${effect.value * 100}%`
                                                : effect.type.includes("Duration")
                                                  ? `${effect.value}s`
                                                  : effect.value}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Skill details */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mt-4 p-4 overflow-hidden">
              <div className="flex items-start gap-4">
                <motion.div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getSkillStatusClass(selectedSkill)}`}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="text-xl">{selectedSkill.icon}</div>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold flex items-center gap-1">
                    {selectedSkill.name}
                    {selectedSkill.ultimate && <Star className="h-4 w-4 text-purple-500" />}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSkill.description}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-sm flex items-center">
                      <span>Level:</span>
                      <div className="flex items-center ml-1">
                        {[...Array(selectedSkill.maxLevel)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mx-0.5 ${
                              i < selectedSkill.currentLevel ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1">
                        {selectedSkill.currentLevel}/{selectedSkill.maxLevel}
                      </span>
                    </div>
                    {selectedSkill.currentLevel < selectedSkill.maxLevel && (
                      <div className="text-sm flex items-center">
                        <span>Cost:</span>
                        <span className="font-bold ml-1">{selectedSkill.cost}</span>
                        <Zap className="h-3 w-3 ml-1 text-blue-500" />
                      </div>
                    )}
                  </div>

                  {selectedSkill.requires && selectedSkill.requires.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span>Requires:</span>
                      <div className="flex flex-wrap gap-1 ml-1">
                        {selectedSkill.requires.map((reqId) => {
                          const req = getSkillById(reqId)
                          const isUnlocked = playerSkills.unlockedSkills.includes(reqId)
                          return req ? (
                            <span
                              key={reqId}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
                                isUnlocked
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {isUnlocked ? (
                                <Check className="h-2.5 w-2.5 mr-0.5" />
                              ) : (
                                <Lock className="h-2.5 w-2.5 mr-0.5" />
                              )}
                              {req.name}
                            </span>
                          ) : (
                            reqId
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleUnlock}
                    disabled={!canUnlock(selectedSkill)}
                    className={`${
                      currentTheme?.buttonGradient ||
                      "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    } bg-gradient-to-r ${
                      selectedSkill?.currentLevel >= selectedSkill?.maxLevel
                        ? "opacity-50 cursor-not-allowed"
                        : !canUnlock(selectedSkill)
                          ? "opacity-70"
                          : ""
                    }`}
                  >
                    {selectedSkill.currentLevel >= selectedSkill.maxLevel ? (
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Maxed Out
                      </span>
                    ) : !canUnlock(selectedSkill) && selectedSkill.currentLevel > 0 ? (
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {playerSkills.skillPoints < selectedSkill.cost
                          ? `Need ${selectedSkill.cost} Points`
                          : "Prerequisites Needed"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Unlock
                      </span>
                    )}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Progress */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex justify-between text-xs mb-1">
          <span>Level {playerSkills.level}</span>
          <span>Level {playerSkills.level + 1}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(playerSkills.experience / playerSkills.experienceToNextLevel) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>
        </div>
        <div className="text-xs text-center mt-1 text-gray-500">
          {playerSkills.experience} / {playerSkills.experienceToNextLevel} XP
        </div>
      </motion.div>

      {/* Help tooltip - replace the existing one */}
      <motion.div
        className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-start gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">How to earn and use skill points:</h4>
            <ul className="text-sm mt-1 space-y-1 list-disc pl-4">
              <li>Earn XP by playing games</li>
              <li>Each level up grants you 1 skill point</li>
              <li>Click on a skill to select it, then click "Unlock" to spend points</li>
              <li>
                <span className="font-medium text-blue-600 dark:text-blue-400">Blue pulsing</span> skills can be
                unlocked now
              </li>
              <li>
                <span className="font-medium text-green-600 dark:text-green-400">Green</span> skills are maxed out and
                cannot be improved further
              </li>
              <li>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">Yellow</span> skills are partially
                unlocked
              </li>
              <li>
                <span className="font-medium text-orange-600 dark:text-orange-400">Orange</span> skills need more points
              </li>
              <li>
                <span className="font-medium text-gray-600 dark:text-gray-400">Gray</span> skills need prerequisite
                skills
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

