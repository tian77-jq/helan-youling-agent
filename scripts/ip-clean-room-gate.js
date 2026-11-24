const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const checks = [
  ['trademark', 'scripts/trademark-confusion-audit.js'],
  ['research-isolation', 'scripts/research-asset-isolation-gate.js'],
  ['asset-coverage', 'scripts/asset-coverage-audit.js'],
  ['asset-license', 'scripts/asset-license-gate.js'],
  ['official-endorsement', 'scripts/official-endorsement-gate.js'],
  ['dependency-license', 'scripts/dependency-license-gate.js'],
  ['domain-purity', 'scripts/domain-purity-gate.js'],
  ['scenic-hardcode', 'scripts/scenic-core-hardcode-gate.js']
]
let failed = 0
for (const [name, script] of checks) {
  const result = spawnSync(process.execPath, [path.join(root, script)], { cwd: root, encoding: 'utf8' })
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim().split(/\r?\n/).filter(Boolean).pop() || ''
  const ok = result.status === 0
  console.log(`[IP_CLEAN_ROOM] ${name}=${ok ? 'PASS' : 'BLOCKED'} ${output}`)
  if (!ok) failed += 1
}

const required = [
  'docs/ip/mascot-chain-of-title.md',
  'docs/ip/patent-decision-gate.md',
  'docs/ip/rights-matrix.md',
  'assets/asset-manifest.json',
  'knowledge/source-manifest.json',
  'scenic-adapter-rights.schema.json'
]
const missing = required.filter(file => !fs.existsSync(path.join(root, file)))
console.log(`[IP_CLEAN_ROOM] required_artifacts=${missing.length ? 'BLOCKED' : 'PASS'} missing=${missing.length}`)
if (missing.length) failed += 1

console.log(`[IP_CLEAN_ROOM] COMMERCIAL_IP_TECH_CLEAN=${failed ? 'NO' : 'PARTIAL'} legal_clearance=NO final_legal_due_diligence=YES`)
process.exitCode = failed ? 1 : 0
