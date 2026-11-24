const styleManager = require('./style-manager')

const TEXT_FREE_POLICY = [
  'TEXT-FREE IMAGE ONLY.',
  'NO TEXT, NO LETTERS, NO WORDS, NO CHINESE CHARACTERS, NO ENGLISH WORDS, NO ARABIC LETTERING, NO TYPOGRAPHY, NO CAPTIONS, NO LOGO TEXT, NO LOGOS, NO SIGNAGE, NO READABLE SIGNS, NO WATERMARK, NO PSEUDO-TEXT.',
  'Do not render any user-provided writing or text-like marks. Keep the scene natural and leave clean visual space for native app text overlay.'
].join(' ')

function build(input) {
  const value = input || {}
  const scene = String(value.scene || '贺兰山')
  const culture = String(value.culture || '宁夏文化')
  const pet = String(value.pet || '岩羊')
  const style = styleManager.normalize(value.style)
  const prompt = `Create a text-free visual scene of ${scene} in Ningxia, China, in ${style}. Show one original ${pet} character naturally within the real regional landscape. Use visual elements associated with ${culture}, with a clear complete subject and cohesive composition. Prefer natural landforms, rocks, rivers, desert, mountains or sky; avoid streets, storefronts, gates, posters and signboards. ${TEXT_FREE_POLICY}`
  return { scene, culture, pet, style, prompt }
}

module.exports = { TEXT_FREE_POLICY, build }
