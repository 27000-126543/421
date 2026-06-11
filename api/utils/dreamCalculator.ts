import type { Weaver, SceneElement, DreamCalculationResult, AffixType } from '../../shared/types.js';

const AFFIX_TYPES: AffixType[] = ['lucid', 'precognition', 'nightmare', 'stable', 'chaotic'];

function calculateDream(
  weavers: Weaver[],
  elements: SceneElement[]
): DreamCalculationResult {
  let baseStability = 50;
  let baseExperience = 30;
  let complexity = 0;

  const affixChances: Record<AffixType, number> = {
    lucid: 5,
    precognition: 5,
    nightmare: 5,
    stable: 5,
    chaotic: 5
  };

  for (const weaver of weavers) {
    const rarityMultiplier = {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 3
    }[weaver.rarity];

    const levelMultiplier = 1 + (weaver.level - 1) * 0.05;

    for (const skill of weaver.skills) {
      const skillValue = skill.value * rarityMultiplier * levelMultiplier;
      
      if (skill.type === 'stability') {
        baseStability += skillValue;
      } else if (skill.type === 'experience') {
        baseExperience += skillValue;
      } else if (skill.type === 'affix_chance') {
        for (const affix of AFFIX_TYPES) {
          affixChances[affix] += skillValue / 5;
        }
      }
    }

    complexity += 10;
  }

  for (const element of elements) {
    baseStability += element.stabilityModifier;
    baseExperience += element.experienceModifier;
    complexity += 5;

    for (const affix of AFFIX_TYPES) {
      affixChances[affix] += element.affixBonus[affix];
    }
  }

  const stability = Math.max(0, Math.min(100, Math.round(baseStability)));
  const experienceScore = Math.max(0, Math.min(100, Math.round(baseExperience)));
  complexity = Math.min(100, complexity);

  for (const affix of AFFIX_TYPES) {
    affixChances[affix] = Math.max(0, Math.min(95, affixChances[affix]));
  }

  const triggeredAffixes: AffixType[] = [];
  for (const affix of AFFIX_TYPES) {
    if (Math.random() * 100 < affixChances[affix]) {
      triggeredAffixes.push(affix);
    }
  }

  return {
    stability,
    experienceScore,
    complexity,
    affixChances,
    triggeredAffixes
  };
}

export { calculateDream };
