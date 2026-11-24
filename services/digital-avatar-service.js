const router = require('./character-router')
const speechText = require('./speech-text-builder')
const voice = require('./voice-service')

const STATES = ['IDLE', 'LISTENING', 'THINKING', 'SPEAKING', 'HAPPY', 'ERROR']
const speakInFlight = new Map()

function prepare(result, question) {
  const answerText = String(result && (result.answerText || result.answer) || '')
  const explicit = result && (result.resolvedCharacter || result.character) && router.CHARACTERS[router.normalize(result.resolvedCharacter || result.character)] ? (result.resolvedCharacter || result.character) : ''
  const legacyHint = result && result.agent && result.agent.id
  const character = router.get(explicit || router.select(question, legacyHint))
  return Object.assign({}, result, { answerText, speakText: result && result.speakText || speechText.build(answerText, character), character: character.id, resolvedCharacter: character.id, answerCharacter: character.id, voiceCharacter: character.id, uiCharacter: character.id, agent: router.toAgent(character.id), characterProfile: character, emotion: result && result.emotion || 'friendly', action: result && result.action || 'SPEAK', avatarState: 'IDLE', ttsMode: 'CAPTION_ONLY', ttsAvailable: false })
}

function speak(payload) {
  const value = payload || {}
  const text = value.speakText || value.answerText || ''
  const key = `${value.character || 'shaHu'}|${text}`
  if (speakInFlight.has(key)) return speakInFlight.get(key)
  const request = Promise.resolve(Object.assign({}, value, { ttsMode:'CAPTION_ONLY', ttsAvailable:false, audio:'', voiceCharacter:value.character||'shaHu', avatarState:'HAPPY', voiceReason:'V1_VOICE_FROZEN' })).finally(() => speakInFlight.delete(key))
  speakInFlight.set(key, request)
  return request
}

module.exports = { STATES, prepare, speak }
