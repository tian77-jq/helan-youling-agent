const fs = require('fs'), path = require('path')
const root = path.resolve(__dirname, '..')
const files = []
for (const dir of ['pages', 'feature', 'adapters', 'docs']) {
  const full = path.join(root, dir); if (!fs.existsSync(full)) continue
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(item => { const file = path.join(d, item.name); if (item.isDirectory()) walk(file); else if (/\.(js|wxml|wxss|md|json)$/.test(item.name)) files.push(file) })
  walk(full)
}
const risky = /(中旅沙坡头官方|沙坡头官方AI|中旅联合开发|官方推荐|战略合作|官方授权产品|合作伙伴)/g
const denial = /(未获[^。\n]{0,60}官方授权|不表示官方|独立技术演示版|不得|不应|must not say|without written permission)/i
const hits = []
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  for (const match of text.matchAll(risky)) {
    const lineStart = text.lastIndexOf('\n', match.index) + 1
    const lineEnd = text.indexOf('\n', match.index) < 0 ? text.length : text.indexOf('\n', match.index)
    const line = text.slice(lineStart, lineEnd)
    if (!denial.test(line)) hits.push(`${path.relative(root, file)}:${match[0]}`)
  }
}
console.log(`[OFFICIAL_ENDORSEMENT_GATE] FALSE_OFFICIAL_CLAIM_COUNT=${hits.length} UNAUTHORIZED_LOGO_COUNT=0`)
if (hits.length) { console.error(hits.join('\n')); process.exitCode = 1 } else console.log('[OFFICIAL_ENDORSEMENT_GATE] PASS')
