const CHARACTER_BY_TASK = {
  ECOLOGY_QA: 'yanYang',
  CULTURE_QA: 'luoTuo',
  TRIP_PLANNING: 'shaHu',
  TRIP_PLANNING_NEEDS_DURATION: 'shaHu',
  TRIP_NEEDS_BASE_CITY: 'shaHu',
  NEED_DESTINATION_AND_DURATION: 'shaHu',
  TRIP_REFINEMENT: 'shaHu',
  NIGHT_TRAVEL: 'shaHu',
  FOOD_QA: 'shaHu',
  GENERAL_NINGXIA_QA: 'shaHu',
  META_SYSTEM: 'neutral',
  OUT_OF_DOMAIN: 'neutral'
}

const LEGACY_INTENT = {
  ECOLOGY_QA: 'GENERAL_DISCOVERY',
  CULTURE_QA: 'ATTRACTION_QA',
  FOOD_QA: 'FOOD_RECOMMENDATION',
  TRIP_REFINEMENT: 'ADJUST_TRIP'
}

function taskType(intent) { return intent || 'GENERAL_NINGXIA_QA' }
function characterFor(intent) { return CHARACTER_BY_TASK[taskType(intent)] || 'shaHu' }
function legacyIntentFor(intent) { return LEGACY_INTENT[intent] || intent }

function contract(routing, extra = {}) {
  const intent = taskType(routing && (routing.taskType || routing.intent))
  return Object.assign({
    intent,
    legacyIntent: legacyIntentFor(intent),
    behavior: intent === 'TRIP_PLANNING' ? 'GENERATE_TRIP_PLAN' : intent === 'TRIP_REFINEMENT' ? 'PATCH_TRIP' : 'DIRECT_ANSWER',
    renderer: intent === 'TRIP_PLANNING' || intent === 'TRIP_REFINEMENT' ? 'TRIP_OUTPUT' : intent === 'NIGHT_TRAVEL' ? 'NIGHT_OUTPUT' : 'QA_OUTPUT',
    character: characterFor(intent),
    requiresKnowledge: !['META_SYSTEM', 'OUT_OF_DOMAIN'].includes(intent),
    requiresTripState: ['TRIP_REFINEMENT'].includes(intent),
    allowsNewEntities: false
  }, extra)
}

module.exports = { CHARACTER_BY_TASK, taskType, characterFor, legacyIntentFor, contract }
