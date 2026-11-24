const fs=require('fs'),path=require('path'),cp=require('child_process')
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/audit-20260905/regression')
fs.mkdirSync(dir,{recursive:true})
const tests=['verify-project','build-mode-gate','v53-buyer-test','v53-host-e2e','audit-code-quality','page-registry-audit','domain-purity-gate','regional-scope-gate','character-router-test','knowledge-catalog-ai-regression','buyer-data-bulk-regression','trip-core-critical-regression','trip-visual-resolver-test','night-fallback-regression','workspace-state-test','audit-workspace-runtime-test','audit-storage-visual-test','audit-image-isolation-test','memory-closure-gate','host-adapter-contract-test','scan-allowlist-test','raw-input-log-gate','asset-license-gate','dependency-license-gate','research-asset-isolation-gate','motion-reentry-test','observability-trace-test','discovery-world-test','shapotou-productization-test','regional-runtime-regression','current-turn-isolation-test','conversation-gateway-test','ai-full-regression-test','scenic-vision-service-test','wechat-production-release-gate']
const results=[]
tests.unshift('audit-source-inventory')
for(const name of tests){
 const run=cp.spawnSync(process.execPath,[path.join(root,'scripts',name+'.js')],{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:12*1024*1024})
 fs.writeFileSync(path.join(dir,name+'.log'),(run.stdout||'')+(run.stderr||'')+(run.error?'\n'+run.error.message:''))
 const status=run.status===0&&!run.error?'EXECUTED_PASS':'FAIL'
 results.push({name,status,exitCode:run.status,scope:name==='wechat-production-release-gate'?'PRODUCTION_GATE':'LOCAL_TEST_OR_STRUCTURE'})
 console.log(name+': '+status)
}
const codeOnly=process.argv.includes('--code-only')
const failures=results.filter(r=>r.status==='FAIL'&&(!codeOnly||r.scope!=='PRODUCTION_GATE'))
const summary={at:new Date().toISOString(),sourceHash:require('./audit-fingerprint')(),mode:codeOnly?'CODE_ONLY':'RELEASE',status:failures.length?'BLOCKED':'LOCAL_CHECKS_PASSED',device:'DEVICE_REQUIRED',cloud:'SEE_LIVE_WORKSPACE_EVIDENCE',results}
fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(summary,null,2))
process.exitCode=failures.length?1:0
