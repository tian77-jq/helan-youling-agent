const LIMITS = { min: 80, max: 180 }

function build(answer, character) {
  const source = String(answer || '').replace(/\s+/g, ' ').trim()
  if (!source) return ''
  const prefix = character && character.name ? `我是${character.name}，` : ''
  const text = `${prefix}${source}`
  if (text.length <= LIMITS.max) return text
  const clipped = text.slice(0, LIMITS.max)
  const end = Math.max(clipped.lastIndexOf('。'), clipped.lastIndexOf('！'), clipped.lastIndexOf('？'), clipped.lastIndexOf('，'))
  return `${clipped.slice(0, end > LIMITS.min ? end : LIMITS.max)}。`
}

module.exports = { build, LIMITS }
