const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const checks = [
  ['build id', /20260830-regional-experience-v13-device/.test(read('app.js'))],
  ['candidate log', /DEVICE_REVIEW_CANDIDATE/.test(read('app.js'))],
  ['review guide', fs.existsSync(path.join(root, 'docs/visual-audit/device-review-guide.md'))],
  ['evidence record', fs.existsSync(path.join(root, 'docs/visual-audit/v5.2-device-review-evidence.md'))],
  ['received screenshot batch', fs.readdirSync(path.join(root, 'docs/visual-audit/received-20260830')).filter(name => name.endsWith('.jpg')).length === 14],
  ['admin travel section visible', /nth-of-type\(2\)\{display:block\}/.test(read('pages/admin/index.wxss'))],
  ['admin stats section hidden', /nth-of-type\(3\)\{display:none\}/.test(read('pages/admin/index.wxss'))]
]

let failed = 0
for (const [name, passed] of checks) {
  console.log(`[DEVICE_REVIEW_GATE] ${passed ? 'PASS' : 'FAIL'} ${name}`)
  if (!passed) failed += 1
}
if (failed) process.exitCode = 1
