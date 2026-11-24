const assert=(value,message)=>{if(!value)throw new Error(message)}

async function main(){
  global.wx={}
  const orchestrator=require('../utils/ai-orchestrator')
  const fallback=await orchestrator.plan('第一次来宁夏，两天时间，喜欢历史和美食','zh-CN')
  assert(fallback.source==='local-fallback','Cloud unavailable did not fall back locally')
  assert(fallback.plan.days.length===2,'fallback plan is not structured')

  global.wx={cloud:{extend:{AI:{createModel:()=>({generateText:async()=>({choices:[{message:{content:'{"days":2,"city":"银川","peopleCount":2,"interests":{"history":true,"food":true},"pace":"normal"}'}}]})})}}}}
  const cloudAI=require('../utils/cloud-ai')
  const base=require('../utils/trip-agent').parseConstraints('第一次来宁夏两天','zh-CN')
  const intent=await cloudAI.extractIntent('第一次来宁夏，两天时间，喜欢历史和美食',base,'zh-CN')
  assert(intent.days===2&&intent.city==='银川'&&intent.interests.history===true,'Cloud schema validation failed')
  console.log(JSON.stringify({status:'PASS',fallback:fallback.source,validatedCloudIntent:true},null,2))
}

main().catch(error=>{console.error(error);process.exit(1)})
