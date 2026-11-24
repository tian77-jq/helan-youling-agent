const assert = require('assert')
const imagePrompt = require('../vision-agent/prompt-builder')
const imageService = require('../services/image-service')
const studio = require('../feature/create/studio-service')
const scenic = require('../services/scenicVisionService')
const composition = require('../utils/image-composition')

const requiredPolicy = [
  'NO TEXT', 'NO LETTERS', 'NO CHINESE CHARACTERS', 'NO ENGLISH WORDS',
  'NO LOGO TEXT', 'NO CAPTIONS', 'NO SIGNAGE', 'NO WATERMARK', 'NO PSEUDO-TEXT'
]
const shared = imagePrompt.build({ scene: '贺兰山', culture: '岩画', pet: '岩羊', style: '国风插画', prompt: 'TEXT_SENTINEL: render the phrase Ningxia Forever' })
requiredPolicy.forEach(term => assert(shared.prompt.includes(term), `shared prompt includes ${term}`))
assert(!shared.prompt.includes('TEXT_SENTINEL'), 'untrusted user text is excluded from model prompt')
const dispatched = imageService.buildPrompt({ scene: '贺兰山', culture: '岩画', pet: '岩羊', style: '国风插画', prompt: 'DRAW_WORDS_SENTINEL' })
assert(!dispatched.prompt.includes('DRAW_WORDS_SENTINEL'), 'page-facing image service also excludes user writing')
requiredPolicy.forEach(term => assert(dispatched.prompt.includes(term), `dispatched prompt includes ${term}`))

const memoryPrompt = studio.buildPrompt({ scene: 'xixia', subScene: 'rock-art', pet: 'lingling', style: 'ink', outputType: 'postcard', userPrompt: 'MEMORY_QUOTE_SENTINEL 请把“宁夏旅行”写在图上' })
assert(!memoryPrompt.includes('MEMORY_QUOTE_SENTINEL'), 'memory card quote is not sent to the image model')
requiredPolicy.forEach(term => assert(memoryPrompt.includes(term), `memory prompt includes ${term}`))
const scenicRequest = scenic.buildTravelImageRequest({ scene: '沙坡头', userPrompt: 'SCENIC_TEXT_SENTINEL draw a readable sign', description: 'DESCRIPTION_TEXT_SENTINEL render title text' })
assert(!scenicRequest.prompt.includes('SCENIC_TEXT_SENTINEL'), 'travel prompt excludes user writing')
assert(!scenicRequest.prompt.includes('DESCRIPTION_TEXT_SENTINEL'), 'travel prompt excludes free-form description')
requiredPolicy.forEach(term => assert(scenicRequest.prompt.includes(term), `travel prompt includes ${term}`))

const card = composition.buildComposition({ locale: 'en-US', location: 'Helan Mountain', character: 'Argali', quote: 'A journey to remember', date: new Date(2026, 8, 27) })
assert.strictEqual(card.title, 'A memory from Ningxia')
assert.strictEqual(card.location, 'Helan Mountain')
assert.strictEqual(card.character, 'Argali')
assert.strictEqual(card.quote, 'A journey to remember')
assert.strictEqual(card.date, '09/27/2026')
console.log('IMAGE_TEXT_SAFETY_TEST PASS: shared, memory and travel prompts are text-free; structured copy stays in native composition data')
