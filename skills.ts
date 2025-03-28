// Skill tree data structure for Whack-a-Berry

export type SkillId = string
export type SkillTreeId = "hammer" | "berry" | "time" | "combo" | "special"

export interface Skill {
  id: SkillId
  name: string
  description: string
  maxLevel: number
  currentLevel: number
  icon: string
  cost: number
  effects: SkillEffect[]
  requires?: SkillId[]
  treeId: SkillTreeId
  position: { x: number; y: number }
  ultimate?: boolean
}

export interface SkillEffect {
  type: SkillEffectType
  value: number
  scaling?: number // Additional value per level
}

export type SkillEffectType =
  // Hammer effects
  | "hitAreaIncrease"
  | "hammerCooldownReduction"
  | "doubleHitChance"
  | "rapidFireDuration"
  | "goldenHammerCharges"

  // Berry effects
  | "characterVisibleTimeIncrease"
  | "characterSilhouetteTime"
  | "carloFlashWarning"
  | "carloPointLossReduction"
  | "toliTimeBonus"
  | "blueberryVisibleTimeIncrease"
  | "blueberryTransformChance"

  // Time effects
  | "startingTimeBonus"
  | "timeSaverChance"
  | "scottSpeedBoostDuration"
  | "scottSpeedBoostMultiplier"
  | "freezePowerupDuration"
  | "randomFreezeChance"
  | "timeWarpCharges"
  | "endgameSlowdown"

  // Combo effects
  | "comboDuration"
  | "comboSaverChance"
  | "comboMultiplierThreshold"
  | "startingCombo"
  | "comboRetentionRate"
  | "comboMilestoneBonus"
  | "comboFrenzyCharges"

  // Special effects
  | "powerupDuration"
  | "powerupSpawnRate"
  | "areaHitChance"
  | "areaHitBonusPoints"
  | "powerupVisibleTimeIncrease"
  | "berryExplosionCharges"

export interface SkillTree {
  id: SkillTreeId
  name: string
  description: string
  icon: string
  skills: Skill[]
}

// Define the skill trees
export const skillTrees: SkillTree[] = [
  {
    id: "hammer",
    name: "Hammer Mastery",
    description: "Improve your hammer's effectiveness and capabilities.",
    icon: "🔨",
    skills: [
      {
        id: "hammer_root",
        name: "Hammer Mastery",
        description: "The path of the hammer wielder.",
        maxLevel: 1,
        currentLevel: 1, // Root skills start unlocked
        icon: "🔨",
        cost: 0,
        effects: [],
        treeId: "hammer",
        position: { x: 0, y: 0 },
      },
      {
        id: "precision_1",
        name: "Precision I",
        description: "Increase hit area by 5%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🎯",
        cost: 1,
        effects: [{ type: "hitAreaIncrease", value: 0.05 }],
        requires: ["hammer_root"],
        treeId: "hammer",
        position: { x: -1, y: 1 },
      },
      {
        id: "precision_2",
        name: "Precision II",
        description: "Increase hit area by an additional 5%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🎯",
        cost: 2,
        effects: [{ type: "hitAreaIncrease", value: 0.05 }],
        requires: ["precision_1"],
        treeId: "hammer",
        position: { x: -1, y: 2 },
      },
      {
        id: "precision_3",
        name: "Precision III",
        description: "Increase hit area by an additional 5%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🎯",
        cost: 3,
        effects: [{ type: "hitAreaIncrease", value: 0.05 }],
        requires: ["precision_2"],
        treeId: "hammer",
        position: { x: -1, y: 3 },
      },
      {
        id: "quick_swing_1",
        name: "Quick Swing I",
        description: "Reduce hammer cooldown by 5%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⚡",
        cost: 1,
        effects: [{ type: "hammerCooldownReduction", value: 0.05 }],
        requires: ["hammer_root"],
        treeId: "hammer",
        position: { x: 1, y: 1 },
      },
      {
        id: "quick_swing_2",
        name: "Quick Swing II",
        description: "Reduce hammer cooldown by an additional 5%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⚡",
        cost: 2,
        effects: [{ type: "hammerCooldownReduction", value: 0.05 }],
        requires: ["quick_swing_1"],
        treeId: "hammer",
        position: { x: 1, y: 2 },
      },
      {
        id: "quick_swing_3",
        name: "Quick Swing III",
        description: "Reduce hammer cooldown by an additional 5%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⚡",
        cost: 3,
        effects: [{ type: "hammerCooldownReduction", value: 0.05 }],
        requires: ["quick_swing_2"],
        treeId: "hammer",
        position: { x: 1, y: 3 },
      },
      {
        id: "double_tap",
        name: "Double Tap",
        description: "10% chance to register a second hit on the same character.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "👆",
        cost: 3,
        effects: [{ type: "doubleHitChance", value: 0.1 }],
        requires: ["precision_3"],
        treeId: "hammer",
        position: { x: -1, y: 4 },
      },
      {
        id: "rapid_fire",
        name: "Rapid Fire",
        description: "Collecting a power-up grants 3 seconds of rapid clicking.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🔥",
        cost: 3,
        effects: [{ type: "rapidFireDuration", value: 3 }],
        requires: ["quick_swing_3"],
        treeId: "hammer",
        position: { x: 1, y: 4 },
      },
      {
        id: "golden_hammer",
        name: "ULTIMATE: Golden Hammer",
        description: "Once per game, activate a golden hammer that hits all visible characters at once.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "✨",
        cost: 5,
        effects: [{ type: "goldenHammerCharges", value: 1 }],
        requires: ["double_tap", "rapid_fire"],
        treeId: "hammer",
        position: { x: 0, y: 5 },
        ultimate: true,
      },
    ],
  },
  {
    id: "berry",
    name: "Berry Expertise",
    description: "Improve interactions with specific characters.",
    icon: "🍓",
    skills: [
      {
        id: "berry_root",
        name: "Berry Expertise",
        description: "The path of berry knowledge.",
        maxLevel: 1,
        currentLevel: 1, // Root skills start unlocked
        icon: "🍓",
        cost: 0,
        effects: [],
        treeId: "berry",
        position: { x: 0, y: 0 },
      },
      {
        id: "berry_spotter",
        name: "Berry Spotter",
        description: "Characters stay visible 0.2 seconds longer.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "👁️",
        cost: 1,
        effects: [{ type: "characterVisibleTimeIncrease", value: 0.2 }],
        requires: ["berry_root"],
        treeId: "berry",
        position: { x: -1, y: 1 },
      },
      {
        id: "berry_vision",
        name: "Berry Vision",
        description: "See character silhouettes before they appear.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "👓",
        cost: 2,
        effects: [{ type: "characterSilhouetteTime", value: 0.5 }],
        requires: ["berry_spotter"],
        treeId: "berry",
        position: { x: -1, y: 2 },
      },
      {
        id: "carlo_detector",
        name: "Carlo Detector",
        description: "Carlo flashes red before appearing.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🚨",
        cost: 1,
        effects: [{ type: "carloFlashWarning", value: 1 }],
        requires: ["berry_root"],
        treeId: "berry",
        position: { x: 0, y: 1 },
      },
      {
        id: "carlo_immunity_1",
        name: "Carlo Immunity I",
        description: "Reduce points lost from hitting Carlo by 50%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🛡️",
        cost: 2,
        effects: [{ type: "carloPointLossReduction", value: 0.5 }],
        requires: ["carlo_detector"],
        treeId: "berry",
        position: { x: 0, y: 2 },
      },
      {
        id: "carlo_immunity_2",
        name: "Carlo Immunity II",
        description: "No points lost from hitting Carlo.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🛡️",
        cost: 3,
        effects: [{ type: "carloPointLossReduction", value: 1.0 }],
        requires: ["carlo_immunity_1"],
        treeId: "berry",
        position: { x: 0, y: 3 },
      },
      {
        id: "toli_timer",
        name: "Toli Timer",
        description: "Gain 1 extra second from Toli hits.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⏱️",
        cost: 1,
        effects: [{ type: "toliTimeBonus", value: 1 }],
        requires: ["berry_root"],
        treeId: "berry",
        position: { x: 1, y: 1 },
      },
      {
        id: "toli_friendship",
        name: "Toli Friendship",
        description: "Gain 2 more seconds from Toli hits (3 total).",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⏱️",
        cost: 2,
        effects: [{ type: "toliTimeBonus", value: 2 }],
        requires: ["toli_timer"],
        treeId: "berry",
        position: { x: 1, y: 2 },
      },
      {
        id: "blueberry_magnet",
        name: "Blueberry Magnet",
        description: "Blueberries stay visible 1 second longer.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🫐",
        cost: 3,
        effects: [{ type: "blueberryVisibleTimeIncrease", value: 1 }],
        requires: ["berry_vision"],
        treeId: "berry",
        position: { x: -1, y: 3 },
      },
      {
        id: "berry_whisperer",
        name: "ULTIMATE: Berry Whisperer",
        description: "15% chance that any character transforms into a Blueberry when hit.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "✨",
        cost: 5,
        effects: [{ type: "blueberryTransformChance", value: 0.15 }],
        requires: ["carlo_immunity_2", "toli_friendship", "blueberry_magnet"],
        treeId: "berry",
        position: { x: 0, y: 4 },
        ultimate: true,
      },
    ],
  },
  {
    id: "time",
    name: "Time Manipulation",
    description: "Control the game's timer and speed.",
    icon: "⏰",
    skills: [
      {
        id: "time_root",
        name: "Time Manipulation",
        description: "The path of time control.",
        maxLevel: 1,
        currentLevel: 1, // Root skills start unlocked
        icon: "⏰",
        cost: 0,
        effects: [],
        treeId: "time",
        position: { x: 0, y: 0 },
      },
      {
        id: "slow_start",
        name: "Slow Start",
        description: "Begin each game with 5 extra seconds.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🕰️",
        cost: 1,
        effects: [{ type: "startingTimeBonus", value: 5 }],
        requires: ["time_root"],
        treeId: "time",
        position: { x: -1, y: 1 },
      },
      {
        id: "time_saver",
        name: "Time Saver",
        description: "10% chance to not lose time on timer ticks.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "💾",
        cost: 2,
        effects: [{ type: "timeSaverChance", value: 0.1 }],
        requires: ["slow_start"],
        treeId: "time",
        position: { x: -1, y: 2 },
      },
      {
        id: "scott_synergy_1",
        name: "Scott Synergy I",
        description: "Scott speed boost lasts 1 second longer.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🚀",
        cost: 1,
        effects: [{ type: "scottSpeedBoostDuration", value: 1 }],
        requires: ["time_root"],
        treeId: "time",
        position: { x: 0, y: 1 },
      },
      {
        id: "scott_synergy_2",
        name: "Scott Synergy II",
        description: "Scott speed boost increased to 2x.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🚀",
        cost: 2,
        effects: [{ type: "scottSpeedBoostMultiplier", value: 0.5 }], // +0.5 to make it 2x
        requires: ["scott_synergy_1"],
        treeId: "time",
        position: { x: 0, y: 2 },
      },
      {
        id: "time_freeze_1",
        name: "Time Freeze I",
        description: "Freeze powerups last 1 second longer.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "❄️",
        cost: 1,
        effects: [{ type: "freezePowerupDuration", value: 1 }],
        requires: ["time_root"],
        treeId: "time",
        position: { x: 1, y: 1 },
      },
      {
        id: "time_freeze_2",
        name: "Time Freeze II",
        description: "5% chance any hit freezes time for 1 second.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "❄️",
        cost: 2,
        effects: [{ type: "randomFreezeChance", value: 0.05 }],
        requires: ["time_freeze_1"],
        treeId: "time",
        position: { x: 1, y: 2 },
      },
      {
        id: "time_warp",
        name: "Time Warp",
        description: "Once per game, add 5 seconds to the timer.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⏳",
        cost: 3,
        effects: [{ type: "timeWarpCharges", value: 1 }],
        requires: ["time_saver", "scott_synergy_2"],
        treeId: "time",
        position: { x: -0.5, y: 3 },
      },
      {
        id: "chronos_control",
        name: "ULTIMATE: Chronos Control",
        description: "For the last 10 seconds of the game, time slows down by 30%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "✨",
        cost: 5,
        effects: [{ type: "endgameSlowdown", value: 0.3 }],
        requires: ["time_warp", "time_freeze_2"],
        treeId: "time",
        position: { x: 0.5, y: 4 },
        ultimate: true,
      },
    ],
  },
  {
    id: "combo",
    name: "Combo Specialist",
    description: "Improve the combo system for higher scores.",
    icon: "🔄",
    skills: [
      {
        id: "combo_root",
        name: "Combo Specialist",
        description: "The path of combo mastery.",
        maxLevel: 1,
        currentLevel: 1, // Root skills start unlocked
        icon: "🔄",
        cost: 0,
        effects: [],
        treeId: "combo",
        position: { x: 0, y: 0 },
      },
      {
        id: "combo_extender",
        name: "Combo Extender",
        description: "Increase combo duration by 1 second.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⏱️",
        cost: 1,
        effects: [{ type: "comboDuration", value: 1 }],
        requires: ["combo_root"],
        treeId: "combo",
        position: { x: -1, y: 1 },
      },
      {
        id: "combo_saver",
        name: "Combo Saver",
        description: "20% chance to not break combo on miss.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🔒",
        cost: 2,
        effects: [{ type: "comboSaverChance", value: 0.2 }],
        requires: ["combo_extender"],
        treeId: "combo",
        position: { x: -1, y: 2 },
      },
      {
        id: "combo_multiplier_1",
        name: "Combo Multiplier I",
        description: "Reach 2x multiplier at 4 combo instead of 5.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "✖️",
        cost: 1,
        effects: [{ type: "comboMultiplierThreshold", value: 1 }], // Reduce threshold by 1
        requires: ["combo_root"],
        treeId: "combo",
        position: { x: 0, y: 1 },
      },
      {
        id: "combo_multiplier_2",
        name: "Combo Multiplier II",
        description: "Reach 3x multiplier at 8 combo instead of 10.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "✖️",
        cost: 2,
        effects: [{ type: "comboMultiplierThreshold", value: 2 }], // Reduce threshold by 2
        requires: ["combo_multiplier_1"],
        treeId: "combo",
        position: { x: 0, y: 2 },
      },
      {
        id: "combo_start",
        name: "Combo Start",
        description: "Begin each game with a 2x combo already active.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🎮",
        cost: 1,
        effects: [{ type: "startingCombo", value: 5 }], // Start with 5 combo
        requires: ["combo_root"],
        treeId: "combo",
        position: { x: 1, y: 1 },
      },
      {
        id: "combo_retention",
        name: "Combo Retention",
        description: "Keep 50% of your combo after hitting Carlo.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🛡️",
        cost: 2,
        effects: [{ type: "comboRetentionRate", value: 0.5 }],
        requires: ["combo_start"],
        treeId: "combo",
        position: { x: 1, y: 2 },
      },
      {
        id: "combo_master",
        name: "Combo Master",
        description: "Each 10 combo gives +1 point permanently.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🏆",
        cost: 3,
        effects: [{ type: "comboMilestoneBonus", value: 1 }],
        requires: ["combo_saver", "combo_multiplier_2"],
        treeId: "combo",
        position: { x: -0.5, y: 3 },
      },
      {
        id: "combo_frenzy",
        name: "ULTIMATE: Combo Frenzy",
        description: "Once per game, activate 10 seconds where each hit adds 2 to combo count.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "✨",
        cost: 5,
        effects: [{ type: "comboFrenzyCharges", value: 1 }],
        requires: ["combo_master", "combo_retention"],
        treeId: "combo",
        position: { x: 0.5, y: 4 },
        ultimate: true,
      },
    ],
  },
  {
    id: "special",
    name: "Special Powers",
    description: "Unlock unique abilities and special effects.",
    icon: "✨",
    skills: [
      {
        id: "special_root",
        name: "Special Powers",
        description: "The path of special abilities.",
        maxLevel: 1,
        currentLevel: 1, // Root skills start unlocked
        icon: "✨",
        cost: 0,
        effects: [],
        treeId: "special",
        position: { x: 0, y: 0 },
      },
      {
        id: "powerup_duration_1",
        name: "Power-up Duration I",
        description: "Increase all power-up durations by 2 seconds.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⏱️",
        cost: 1,
        effects: [{ type: "powerupDuration", value: 2 }],
        requires: ["special_root"],
        treeId: "special",
        position: { x: -1, y: 1 },
      },
      {
        id: "powerup_duration_2",
        name: "Power-up Duration II",
        description: "Increase all power-up durations by 3 more seconds.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⏱️",
        cost: 2,
        effects: [{ type: "powerupDuration", value: 3 }],
        requires: ["powerup_duration_1"],
        treeId: "special",
        position: { x: -1, y: 2 },
      },
      {
        id: "powerup_chance_1",
        name: "Power-up Chance I",
        description: "Increase power-up spawn rate by 5%.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🎲",
        cost: 1,
        effects: [{ type: "powerupSpawnRate", value: 0.05 }],
        requires: ["special_root"],
        treeId: "special",
        position: { x: 0, y: 1 },
      },
      {
        id: "powerup_chance_2",
        name: "Power-up Chance II",
        description: "Increase power-up spawn rate by 10% more.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🎲",
        cost: 2,
        effects: [{ type: "powerupSpawnRate", value: 0.1 }],
        requires: ["powerup_chance_1"],
        treeId: "special",
        position: { x: 0, y: 2 },
      },
      {
        id: "multi_hit",
        name: "Multi-hit",
        description: "5% chance for area damage around hit.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "💥",
        cost: 1,
        effects: [{ type: "areaHitChance", value: 0.05 }],
        requires: ["special_root"],
        treeId: "special",
        position: { x: 1, y: 1 },
      },
      {
        id: "chain_reaction",
        name: "Chain Reaction",
        description: "Characters hit by area damage give +50% points.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "⚡",
        cost: 2,
        effects: [{ type: "areaHitBonusPoints", value: 0.5 }],
        requires: ["multi_hit"],
        treeId: "special",
        position: { x: 1, y: 2 },
      },
      {
        id: "power_collector",
        name: "Power Collector",
        description: "Power-ups stay visible 2 seconds longer.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "🧲",
        cost: 3,
        effects: [{ type: "powerupVisibleTimeIncrease", value: 2 }],
        requires: ["powerup_duration_2", "powerup_chance_2"],
        treeId: "special",
        position: { x: -0.5, y: 3 },
      },
      {
        id: "berry_explosion",
        name: "ULTIMATE: Berry Explosion",
        description: "Once per game, hit all visible characters and spawn 3 random power-ups.",
        maxLevel: 1,
        currentLevel: 0,
        icon: "💫",
        cost: 5,
        effects: [{ type: "berryExplosionCharges", value: 1 }],
        requires: ["power_collector", "chain_reaction"],
        treeId: "special",
        position: { x: 0.5, y: 4 },
        ultimate: true,
      },
    ],
  },
]

// Helper function to get all skills
export function getAllSkills(): Skill[] {
  return skillTrees.flatMap((tree) => tree.skills)
}

// Helper function to get a skill by ID
export function getSkillById(skillId: SkillId): Skill | undefined {
  return getAllSkills().find((skill) => skill.id === skillId)
}

// Helper function to check if a skill can be unlocked
export function canUnlockSkill(skillId: SkillId, unlockedSkills: SkillId[]): boolean {
  const skill = getSkillById(skillId)
  if (!skill) return false

  // If the skill is already at max level, it can't be unlocked further
  if (skill.currentLevel >= skill.maxLevel) return false

  // If the skill has no requirements, it can be unlocked
  if (!skill.requires || skill.requires.length === 0) return true

  // Check if all required skills are unlocked
  return skill.requires.every((requiredSkillId) => {
    const requiredSkill = getSkillById(requiredSkillId)
    return requiredSkill && unlockedSkills.includes(requiredSkillId)
  })
}

// Helper function to apply skill effects to game state
export function applySkillEffects(skillIds: SkillId[]): Record<SkillEffectType, number> {
  const effects: Record<SkillEffectType, number> = {
    // Hammer effects
    hitAreaIncrease: 0,
    hammerCooldownReduction: 0,
    doubleHitChance: 0,
    rapidFireDuration: 0,
    goldenHammerCharges: 0,

    // Berry effects
    characterVisibleTimeIncrease: 0,
    characterSilhouetteTime: 0,
    carloFlashWarning: 0,
    carloPointLossReduction: 0,
    toliTimeBonus: 0,
    blueberryVisibleTimeIncrease: 0,
    blueberryTransformChance: 0,

    // Time effects
    startingTimeBonus: 0,
    timeSaverChance: 0,
    scottSpeedBoostDuration: 0,
    scottSpeedBoostMultiplier: 0,
    freezePowerupDuration: 0,
    randomFreezeChance: 0,
    timeWarpCharges: 0,
    endgameSlowdown: 0,

    // Combo effects
    comboDuration: 0,
    comboSaverChance: 0,
    comboMultiplierThreshold: 0,
    startingCombo: 0,
    comboRetentionRate: 0,
    comboMilestoneBonus: 0,
    comboFrenzyCharges: 0,

    // Special effects
    powerupDuration: 0,
    powerupSpawnRate: 0,
    areaHitChance: 0,
    areaHitBonusPoints: 0,
    powerupVisibleTimeIncrease: 0,
    berryExplosionCharges: 0,
  }

  // Apply effects from all unlocked skills
  skillIds.forEach((skillId) => {
    const skill = getSkillById(skillId)
    if (skill && skill.currentLevel > 0) {
      skill.effects.forEach((effect) => {
        effects[effect.type] += effect.value * skill.currentLevel
      })
    }
  })

  return effects
}

// Initialize player skill data
export interface PlayerSkills {
  unlockedSkills: SkillId[]
  skillPoints: number
  level: number
  experience: number
  experienceToNextLevel: number
}

export const initialPlayerSkills: PlayerSkills = {
  unlockedSkills: ["hammer_root", "berry_root", "time_root", "combo_root", "special_root"], // Root skills start unlocked
  skillPoints: 0,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
}

// Calculate XP needed for next level
export function calculateExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Add experience and handle level ups
export function addExperience(playerSkills: PlayerSkills, amount: number): PlayerSkills {
  const updatedSkills = { ...playerSkills }
  updatedSkills.experience += amount

  while (updatedSkills.experience >= updatedSkills.experienceToNextLevel) {
    updatedSkills.experience -= updatedSkills.experienceToNextLevel
    updatedSkills.level += 1
    updatedSkills.skillPoints += 1
    updatedSkills.experienceToNextLevel = calculateExperienceForLevel(updatedSkills.level)
  }

  return updatedSkills
}

// Unlock a skill
export function unlockSkill(playerSkills: PlayerSkills, skillId: SkillId): PlayerSkills {
  const skill = getSkillById(skillId)
  if (!skill) return playerSkills

  // Check if skill is already at max level
  if (skill.currentLevel >= skill.maxLevel) return playerSkills

  // Check if player has enough skill points
  if (playerSkills.skillPoints < skill.cost) return playerSkills

  // Check if skill can be unlocked
  if (!canUnlockSkill(skillId, playerSkills.unlockedSkills)) return playerSkills

  // Create a copy of the unlockedSkills array only if the skill isn't already there
  const updatedUnlockedSkills = playerSkills.unlockedSkills.includes(skillId)
    ? playerSkills.unlockedSkills
    : [...playerSkills.unlockedSkills, skillId]

  // Update the skill's current level in the skill trees
  const allSkills = getAllSkills()
  for (const s of allSkills) {
    if (s.id === skillId) {
      s.currentLevel = Math.min(s.currentLevel + 1, s.maxLevel)
    }
  }

  // Update player skills
  return {
    ...playerSkills,
    unlockedSkills: updatedUnlockedSkills,
    skillPoints: playerSkills.skillPoints - skill.cost,
  }
}

