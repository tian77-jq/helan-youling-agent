const orchestrator=require('../utils/ai-orchestrator')
const memory=require('../utils/tourist-context-memory')

const store=new Map()
global.wx={getStorageSync:key=>store.get(key),setStorageSync:(key,value)=>store.set(key,value)}

const cases=[
  ['宁夏有什么特色美食？','FOOD_RECOMMENDATION','FOOD_GUIDE'],['哪里羊肉最好吃？','FOOD_RECOMMENDATION','FOOD_GUIDE'],['八宝茶怎么体验？','FOOD_RECOMMENDATION','FOOD_GUIDE'],['宁夏特产有哪些？','FOOD_RECOMMENDATION','FOOD_GUIDE'],['吴忠有什么美食？','FOOD_RECOMMENDATION','FOOD_GUIDE'],
  ['贺兰山岩画有什么值得了解？','ATTRACTION_QA','STORY_EXPLANATION'],['西夏陵值得去吗？','ATTRACTION_QA','STORY_EXPLANATION'],['贺兰山岩画有什么故事？','ATTRACTION_QA','STORY_EXPLANATION'],['水洞沟是什么地方？','ATTRACTION_QA','STORY_EXPLANATION'],['镇北堡有什么文化故事？','ATTRACTION_QA','STORY_EXPLANATION'],
  ['第一次去宁夏','GENERAL_DISCOVERY','DIRECT_ANSWER'],['宁夏有什么好玩的？','GENERAL_DISCOVERY','DIRECT_ANSWER'],['宁夏有哪些自然体验？','GENERAL_DISCOVERY','DIRECT_ANSWER'],['银川有什么值得看？','GENERAL_DISCOVERY','DIRECT_ANSWER'],['宁夏适合摄影的地方有哪些？','GENERAL_DISCOVERY','DIRECT_ANSWER'],
  ['明天带父母银川一天，不想走太多路','TRIP_PLANNING','TRIP_PLAN'],['两天怎么玩？','TRIP_PLANNING','TRIP_PLAN'],['我只有半天在银川，想看历史','TRIP_PLANNING','TRIP_PLAN']
]
const mechanical=['请选择','你更想了解','我可以帮你介绍','我可以帮你规划','请输入需求']

async function single(input,intent,behavior){
  const session=orchestrator.startNewSession()
  const result=await orchestrator.respond(input,'zh-CN',null,{sessionId:session.sessionId,turns:[]})
  const answer=String(result.result&&result.result.answer||'')
  const direct=intent==='TRIP_PLANNING'?result.kind==='plan':result.kind==='text'&&Boolean(answer)
  return {input,intent:result.intent,behavior:result.response_behavior,style:result.response_style&&result.response_style.name||'TRIP',kind:result.kind,direct,mechanical:mechanical.some(word=>answer.includes(word)),pass:result.intent===intent&&result.response_behavior===behavior&&direct}
}

async function contextScenario(){
  const session=orchestrator.startNewSession()
  const state={sessionId:session.sessionId,turns:[]}
  await orchestrator.respond('第一次来宁夏','zh-CN',null,state)
  const second=await orchestrator.respond('带父母','zh-CN',null,state)
  const third=await orchestrator.respond('少走路','zh-CN',second.result.plan,state)
  const context=memory.load(session.sessionId)
  const used=context.first_visit&&context.companions.includes('parents')&&context.action_limits.includes('low_walking')&&third.result.plan.constraints.withElderly&&third.result.plan.constraints.pace==='relaxed'
  return {input:'第一次来宁夏 → 带父母 → 少走路',intent:third.intent,behavior:third.response_behavior,style:'双峰驼规划助手风格',kind:third.kind,direct:true,mechanical:false,contextUsed:used,pass:used&&third.kind==='plan'}
}

async function isolationScenario(){
  const first=orchestrator.startNewSession()
  await orchestrator.respond('第一次来宁夏，带父母','zh-CN',null,{sessionId:first.sessionId,turns:[]})
  const second=orchestrator.startNewSession()
  const result=await orchestrator.respond('宁夏有什么好玩的？','zh-CN',null,{sessionId:second.sessionId,turns:[]})
  const context=memory.load(second.sessionId)
  const isolated=!context.first_visit&&!context.companions.length&&result.response_behavior==='DIRECT_ANSWER'
  return {input:'新聊天：宁夏有什么好玩的？',intent:result.intent,behavior:result.response_behavior,style:result.response_style&&result.response_style.name,kind:result.kind,direct:result.kind==='text',mechanical:false,contextUsed:isolated,pass:isolated}
}

async function main(){
  const results=[]
  for(const item of cases)results.push(await single(...item))
  results.push(await contextScenario(),await isolationScenario())
  const directRows=results.filter(item=>item.direct)
  const metrics={mechanical_response_rate:results.filter(item=>item.mechanical).length/results.length,direct_answer_rate:directRows.length/results.length,context_usage_rate:results.filter(item=>item.contextUsed).length/2}
  const failed=results.filter(item=>!item.pass)
  console.log(JSON.stringify({status:failed.length?'FAIL':'READY_FOR_HUMAN_TEST',total:results.length,metrics,failed,results},null,2))
  if(failed.length)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)})
