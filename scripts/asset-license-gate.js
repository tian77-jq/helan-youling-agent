const fs = require('fs'), path = require('path'), childProcess = require('child_process')
const root = path.resolve(__dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/asset-manifest.json'), 'utf8'))
const entries = manifest.entries || []
const known = new Set(entries.map(x => x.path))
const assets = []
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(item => { const file = path.join(dir, item.name); if (item.isDirectory()) walk(file); else assets.push(path.relative(root, file).replace(/\\/g, '/')) })
walk(path.join(root, 'assets'))
const untracked = assets.filter(file => !known.has(file))
// “Active” means explicitly approved for production. Assets that are merely
// present in the clean room remain archived/research-only until rights are
// confirmed; they must not inflate the active unknown-license count.
const unknownProduction = entries.filter(x => x.productionAllowed === true && !x.researchOnly && x.status === 'LICENSE_UNKNOWN')
const rejected = entries.filter(x => x.productionAllowed === true && x.status === 'REJECTED')
const referenceProduction = entries.filter(x => x.productionAllowed === true && x.status === 'REFERENCE_ONLY')
const official = entries.filter(x => x.productionAllowed === true && x.officialBrandAsset === true && x.status !== 'BUYER_PROVIDED')
let activeUsage={activeAssetCount:0,unknownActiveCount:0,danglingActiveCount:0}
try{const output=childProcess.execFileSync(process.execPath,[path.join(__dirname,'active-asset-usage-gate.js')],{cwd:root,encoding:'utf8'});activeUsage=JSON.parse(output)}catch(error){if(error.stdout){try{activeUsage=JSON.parse(String(error.stdout))}catch(parseError){activeUsage={activeAssetCount:0,unknownActiveCount:1,danglingActiveCount:0}}}else activeUsage={activeAssetCount:0,unknownActiveCount:1,danglingActiveCount:0}}
console.log(`[ASSET_LICENSE_GATE] TOTAL_PRODUCTION_ASSETS=${assets.length} ACTIVE_ASSET_COUNT=${activeUsage.activeAssetCount} ACTIVE_UNKNOWN_LICENSE=${activeUsage.unknownActiveCount} ACTIVE_DANGLING=${activeUsage.danglingActiveCount} UNTRACKED_ASSET=${untracked.length} UNKNOWN_PRODUCTION_LICENSE_COUNT=${unknownProduction.length} REJECTED_PRODUCTION_ASSET=${rejected.length} REFERENCE_ONLY_USED_IN_PRODUCTION=${referenceProduction.length} UNAUTHORIZED_BRAND_ASSET=${official.length}`)
const failed = untracked.length + unknownProduction.length + rejected.length + referenceProduction.length + official.length + activeUsage.unknownActiveCount + activeUsage.danglingActiveCount
console.log(`[ASSET_LICENSE_GATE] ${failed ? 'BLOCKED' : 'PASS'} production asset license gate`)
if (failed) process.exitCode = 1
