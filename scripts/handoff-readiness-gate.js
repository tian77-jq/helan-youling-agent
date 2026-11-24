const fs=require('fs'),path=require('path')
const root=path.resolve(__dirname,'..')
const required=['README.md','docs/enterprise-architecture-research.md','docs/architecture/current-dependency-map.md','core/contracts.js','core/provider-contract.js','core/integration-contract.md','contracts/scenic-adapter.schema.json','contracts/openapi.yaml','adapters/shapotou/scenic-profile.js','docs/buyer-discovery-interview.md']
let failed=0
for(const file of required){const ok=fs.existsSync(path.join(root,file));console.log(`[HANDOFF_GATE] ${ok?'PASS':'FAIL'} ${file}`);if(!ok)failed++}
console.log(`[HANDOFF_GATE] ${failed?'FAIL':'PASS'} required artifacts=${required.length}`)
if(failed)process.exitCode=1
