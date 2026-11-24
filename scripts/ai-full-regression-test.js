const orchestrator=require('../utils/ai-orchestrator')
const memory=require('../utils/tourist-context-memory')
const {hasTripTemplate}=require('../utils/response-formatter')

const storage=new Map()
global.wx={getStorageSync:key=>storage.get(key),setStorageSync:(key,value)=>storage.set(key,value)}

const cases=[
  ...['宁夏有什么好玩的？','第一次去宁夏值得去哪？','宁夏有哪些景点？','推荐几个宁夏景点','宁夏适合摄影的地方有哪些？','宁夏有哪些自然体验？','银川有什么值得看？','宁夏历史景点有哪些？','第一次来宁夏注意什么？','宁夏适合亲子去哪里？','宁夏有什么小众体验？','宁夏有哪些文化体验？','去宁夏玩有什么建议？','宁夏有哪些适合老人的景点？','宁夏有哪些适合秋天去的地方？'].map(input=>({input,intent:/历史|文化/.test(input)?'CULTURE_QA':'GENERAL_DISCOVERY',behavior:/历史|文化/.test(input)?'STORY_EXPLANATION':'DIRECT_ANSWER',agent:'rock-goat'})),
  ...['宁夏有什么特色美食？','哪里羊肉最好吃？','宁夏特产有哪些？','第一次来宁夏吃什么？','八宝茶怎么体验？','手抓羊肉有什么特点？','羊杂碎是什么味道？','滩羊有什么特色？','银川有什么好吃的？','吴忠有什么美食？','中卫有什么特色面食？','枸杞适合当伴手礼吗？','宁夏有哪些特色小吃？'].map(input=>({input,intent:'FOOD_QA',behavior:'FOOD_GUIDE',agent:'rock-goat'})),
  ...['贺兰山岩画有什么故事？','西夏陵值得去吗？','贺兰山岩画有什么值得了解？','西夏陵有什么历史？','镇北堡有什么文化故事？','水洞沟是什么地方？','宁夏博物馆值得去吗？','岩画讲述了什么？','西夏文化有什么特点？','贺兰山岩画适合带孩子了解吗？','水洞沟有什么历史意义？','镇北堡适合摄影吗？'].map(input=>({input,intent:'CULTURE_QA',behavior:'STORY_EXPLANATION',agent:'sand-fox'})),
  {input:'帮我安排两天宁夏路线',intent:'TRIP_NEEDS_BASE_CITY',behavior:'ASK_BASE_CITY',agent:null},
  {input:'两天怎么玩？',intent:'TRIP_NEEDS_BASE_CITY',behavior:'ASK_BASE_CITY',agent:null},
  ...['明天带父母银川一天怎么玩？','三天宁夏行程怎么安排？','我只有一天在银川怎么游玩？','四天宁夏旅行计划'].map(input=>({input,intent:'TRIP_PLANNING',behavior:'TRIP_PLAN',agent:null})),
  {input:'预算500元两人宁夏怎么玩？',intent:'TRIP_PLANNING_NEEDS_DURATION',behavior:'ASK_DURATION',agent:null},
  {input:'带7岁孩子去沙坡头怎么安排？',intent:'TRIP_PLANNING_NEEDS_DURATION',behavior:'ASK_DURATION',agent:null},
  {input:'情侣两天宁夏路线',intent:'TRIP_NEEDS_BASE_CITY',behavior:'ASK_BASE_CITY',agent:null}
]

const blocked=['请选择','你更想了解','我可以帮你介绍','我可以帮你规划']
async function single(test){
  const session=orchestrator.startNewSession()
  const result=await orchestrator.respond(test.input,'zh-CN',null,{sessionId:session.sessionId,turns:[]})
  const answer=String(result.result&&result.result.answer||'')
  const noTrip=test.intent!=='TRIP_PLANNING'?result.kind==='text'&&result.response_behavior!=='TRIP_PLAN'&&!hasTripTemplate(answer):result.kind==='plan'
  const clean=!blocked.some(word=>answer.includes(word))
  return {input:test.input,expected:test.intent,intent:result.intent,behavior:result.response_behavior,kind:result.kind,agent:result.result&&result.result.agent&&result.result.agent.id||null,pass:result.intent===test.intent&&result.response_behavior===test.behavior&&noTrip&&clean}
}

async function conversation(){
  const session=orchestrator.startNewSession()
  const state={sessionId:session.sessionId,turns:[]}
  await orchestrator.respond('第一次去宁夏','zh-CN',null,state)
  const second=await orchestrator.respond('带父母','zh-CN',null,state)
  const third=await orchestrator.respond('少走路','zh-CN',second.result&&second.result.plan||null,state)
  const context=memory.load(session.sessionId)
  return {input:'第一次去宁夏 → 带父母 → 少走路',expected:'context_preserved_while_collecting_duration',intent:third.intent,behavior:third.response_behavior,kind:third.kind,agent:null,pass:context.first_visit&&context.companions.includes('parents')&&context.action_limits.includes('low_walking')&&third.kind==='text'&&third.intent==='TRIP_PLANNING_NEEDS_DURATION'&&!/null天/.test(String(third.result&&third.result.answer||''))}
}

async function isolation(){
  const first=orchestrator.startNewSession()
  await orchestrator.respond('第一次去宁夏，带父母','zh-CN',null,{sessionId:first.sessionId,turns:[]})
  const second=orchestrator.startNewSession()
  const result=await orchestrator.respond('有什么好玩的？','zh-CN',null,{sessionId:second.sessionId,turns:[]})
  const context=memory.load(second.sessionId)
  return {input:'new session: 有什么好玩的？',expected:'isolated_general',intent:result.intent,behavior:result.response_behavior,kind:result.kind,agent:result.result&&result.result.agent&&result.result.agent.id||null,pass:first.sessionId!==second.sessionId&&!context.first_visit&&!context.companions.length&&result.kind==='text'&&result.result.agent.id!=='camel'}
}

async function main(){
  const results=[]
  for(const test of cases)results.push(await single(test))
  results.push(await conversation(),await isolation())
  const failed=results.filter(item=>!item.pass)
  console.log(JSON.stringify({status:failed.length?'FAIL':'READY_FOR_HUMAN_TEST',total:results.length,passed:results.length-failed.length,failed,results},null,2))
  if(failed.length)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)})
