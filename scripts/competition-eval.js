const fs=require('fs')
const assert=(value,message)=>{if(!value)throw new Error(message)}
const app=JSON.parse(fs.readFileSync('app.json','utf8'))
const trip=require('../utils/trip-agent')
const config=require('../config/cloud')

async function main(){
  global.wx={}
  const orchestrator=require('../utils/ai-orchestrator')
  const case1=await orchestrator.plan('第一次来宁夏，两天时间，喜欢历史和美食','zh-CN')
  const case2=await orchestrator.plan('明天带父母在银川玩一天，不想太累。','zh-CN')
  const case3=await orchestrator.plan('两个人，学生，预算300元。','zh-CN')
  const case4=await orchestrator.adjust(case1.plan,'少走一点')
  const case5=await orchestrator.adjust(case4.plan,'再增加一点宁夏美食')
  const case8=await orchestrator.plan('Two days in Ningxia with history and food','en-US')
  const case9=await orchestrator.plan('يومان في نينغشيا مع التاريخ والطعام','ar')
  assert(case1.plan.days.length===2&&case1.plan.days[0].items.length>=3,'CASE1')
  assert(case2.plan.constraints.pace==='relaxed','CASE2')
  assert(case3.plan.constraints.budget===300&&case3.plan.constraints.people===2,'CASE3')
  assert(case4.plan.constraints.pace==='relaxed','CASE4')
  assert(case5.plan.days[0].items.filter(item=>item.type==='food').length>1,'CASE5')
  assert(case1.source==='local-fallback'&&case1.plan.generatedBy==='knowledge-agent','CASE6')
  assert(config.featureVisionEnabled===false&&config.visionModel==='glm-5v-turbo'&&config.visionConfidenceThreshold>=0.7,'CASE7')
  assert(!/[\u4e00-\u9fff]/.test(case8.plan.summary+case8.plan.days[0].items[0].name),'CASE8')
  assert(!/[\u4e00-\u9fff]/.test(case9.plan.summary+case9.plan.days[0].items[0].name),'CASE9')
  const registered=(app.pages||[]).concat((app.subPackages||[]).flatMap(item=>item.pages.map(page=>`${item.root}/${page}`)))
  assert(registered.includes('feature/memory/index'),'CASE10')
  console.log(JSON.stringify({CASE1:'PASS',CASE2:'PASS',CASE3:'PASS',CASE4:'PASS',CASE5:'PASS',CASE6:'PASS_LOCAL_FALLBACK',CASE7:'VISION_RETAINED_DISABLED_COST_CONTROL',CASE8:'PASS',CASE9:'PASS',CASE10:'PASS_SHARE_ROUTE'},null,2))
}

main().catch(error=>{console.error(error);process.exit(1)})
