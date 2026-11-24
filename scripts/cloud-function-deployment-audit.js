const fs=require('fs'),path=require('path'),crypto=require('crypto')
const root=path.resolve(__dirname,'..'),functions=['generateImage','ttsSpeak']
const local=functions.map(name=>{const file=path.join(root,'cloudfunctions',name,'index.js');return {functionName:name,localHash:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),localModifiedAt:fs.statSync(file).mtime.toISOString()}})
const deployed=[
 {functionName:'generateImage',deployedVersion:'$LATEST',deployedRuntime:'Nodejs16.13',deployedModifiedAt:'2026-08-26 12:08:49',status:'Deployment completed'},
 {functionName:'ttsSpeak',deployedVersion:'$LATEST',deployedRuntime:'Nodejs16.13',deployedModifiedAt:'2026-08-28 14:32:55',status:'Deployment completed'}
]
const rows=local.map(item=>{const remote=deployed.find(x=>x.functionName===item.functionName);return Object.assign(item,remote,{deployedHash:'UNAVAILABLE_FROM_DETAIL',versionMatch:false,needsDeploy:true,runtimeImpact:item.functionName==='generateImage'?'identity-scoped cache/idempotency code is local only':'no local change in this closure'})})
const report={at:new Date().toISOString(),environment:'cloudbase-d6g1u2dzk45c62fc1',environmentRole:'UNKNOWN (separate prod-* environment exists)',deploymentTargetConfirmed:false,cloudDeploymentPerformed:false,userConfirmationRequired:true,functions:rows,commands:{readOnly:'tcb env list --json -e cloudbase-d6g1u2dzk45c62fc1 && tcb fn detail <name> --json -e cloudbase-d6g1u2dzk45c62fc1',deployAfterConfirmation:'tcb fn deploy generateImage --force --json -e cloudbase-d6g1u2dzk45c62fc1'}}
fs.mkdirSync(path.join(root,'docs/v53-20260905'),{recursive:true});fs.writeFileSync(path.join(root,'docs/v53-20260905/cloud-function-deployment-diff.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
