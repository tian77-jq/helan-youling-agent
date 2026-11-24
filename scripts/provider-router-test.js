const assert=require('assert')
const router=require('../utils/text-model-router')
const config=require('../config/cloud')
const results=[]
function check(name,pass,detail){results.push({name,pass,detail})}

const state=router.providerState(config)
check('PRIMARY_PROVIDER',state.primary==='cloudbase',state.primary)
check('SECONDARY_PROVIDER',state.secondary==='coding-plan',state.secondary)
check('ACTIVE_PROVIDER',state.active==='cloudbase',state.active)
check('MANUAL_FAILOVER',state.fallbackMode==='manual'&&state.autoFailover===false,state)
check('QUOTA_ONLY_GUARD',router.canFailover(Object.assign({},config,{textModelRouting:Object.assign({},config.textModelRouting,{fallbackMode:'manual'})}),new Error('QUOTA_EXCEEDED'))===false,'manual blocks failover')
check('QUOTA_ONLY_MATCH',router.canFailover(Object.assign({},config,{textModelRouting:Object.assign({},config.textModelRouting,{fallbackMode:'quota-only'})}),new Error('QUOTA_EXCEEDED'))===true,'quota-only permits explicit quota error')
check('TIMEOUT_NOT_QUOTA',router.isQuotaFailure(new Error('CLOUD_AI_TIMEOUT'))===false,'timeout remains manual')

async function providerSmoke(active,cloudFailure){
  const configPath=require.resolve('../config/cloud')
  const aiPath=require.resolve('../utils/cloud-ai')
  const base=require(configPath)
  const counts={cloudbase:0,codingPlan:0}
  require.cache[configPath].exports=Object.assign({},base,{textModelRouting:Object.assign({},base.textModelRouting,{active})})
  delete require.cache[aiPath]
  global.wx={cloud:{init(){},extend:{AI:{createModel:()=>({generateText:async()=>{counts.cloudbase++;if(cloudFailure)throw new Error('CLOUD_AI_TIMEOUT');return {choices:[{message:{content:JSON.stringify({answer:'宁夏的贺兰山岩画、沙坡头和西夏陵各有特色，适合结合历史与自然安排游览。',type:'OPEN_ANSWER',knowledgeIds:[]})}}]}}})}},callFunction:async()=>{counts.codingPlan++;return {result:{success:true,response:{choices:[{message:{content:JSON.stringify({answer:'宁夏的贺兰山岩画、沙坡头和西夏陵各有特色，适合结合历史与自然安排游览。',type:'OPEN_ANSWER',knowledgeIds:[]})}}]}}}}}}
  const ai=require(aiPath)
  let failed=false
  try{await ai.askOpen('宁夏有哪些特色景点？',{},[], 'zh-CN',{})}catch(error){failed=true}
  return {counts,failed}
}

(async()=>{
  const primary=await providerSmoke('cloudbase',false)
  check('PRIMARY_SMOKE',primary.counts.cloudbase===1&&primary.counts.codingPlan===0,primary)
  const secondary=await providerSmoke('coding-plan',false)
  check('SECONDARY_SMOKE',secondary.counts.cloudbase===0&&secondary.counts.codingPlan===1,secondary)
  const manual=await providerSmoke('cloudbase',true)
  check('MANUAL_NO_FAILOVER',manual.failed&&manual.counts.cloudbase===1&&manual.counts.codingPlan===0,manual)
  for(const item of results.slice(7))console.log(`[PROVIDER_SMOKE] ${item.pass?'PASS':'FAIL'} ${item.name}`,item.detail||'')
  const failed=results.filter(item=>!item.pass)
  console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',activeGateway:state.active,fallbackMode:state.fallbackMode,autoFailover:state.autoFailover,checks:results},null,2))
  if(failed.length)process.exitCode=1
})()

if(false){

for(const item of results)console.log(`[PROVIDER_ROUTER] ${item.pass?'PASS':'FAIL'} ${item.name}`,item.detail||'')
const failed=results.filter(item=>!item.pass)
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',activeGateway:state.active,fallbackMode:state.fallbackMode,autoFailover:state.autoFailover,checks:results},null,2))
if(failed.length)process.exitCode=1
}
