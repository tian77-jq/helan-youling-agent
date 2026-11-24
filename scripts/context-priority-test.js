const orchestrator=require('../utils/ai-orchestrator')
const conversationManager=require('../utils/conversation-manager')
const {hasTripTemplate}=require('../utils/response-formatter')

const storage=new Map()
global.wx={getStorageSync:key=>storage.get(key),setStorageSync:(key,value)=>storage.set(key,value)}

function textOf(output){return String(output&&output.result&&output.result.answer||output&&output.result&&output.result.plan&&output.result.plan.summary||'')}
async function reply(input,state,plan){
  const output=await orchestrator.respond(input,'zh-CN',plan||null,state)
  return {output,state:output.conversationState,plan:output.kind==='plan'?output.result.plan:plan||null}
}

async function caseOne(){
  const session=orchestrator.startNewSession()
  let state={sessionId:session.sessionId,turns:[]}
  let turn=await reply('第一次来宁夏',state); state=turn.state
  turn=await reply('带父母',state); state=turn.state
  turn=await reply('少走路',state,turn.plan)
  const clarification=textOf(turn.output)
  const noInventedDuration=turn.output.intent==='TRIP_PLANNING_NEEDS_DURATION'&&turn.output.kind==='text'&&!/null天/.test(clarification)
  state=turn.state
  turn=await reply('1天',state,turn.plan)
  const baseCityQuestion=textOf(turn.output)
  const asksBaseCity=turn.output.intent==='TRIP_NEEDS_BASE_CITY'&&turn.output.kind==='text'
  state=turn.state
  turn=await reply('银川',state,turn.plan)
  const plan=turn.output.result.plan
  return {case:'首次游客 + 父母 + 少走路',intent:turn.output.intent,kind:turn.output.kind,clarification,base_city_question:baseCityQuestion,final_text:textOf(turn.output),pass:noInventedDuration&&asksBaseCity&&turn.output.kind==='plan'&&Boolean(plan&&plan.constraints.withElderly&&plan.constraints.pace==='relaxed'&&plan.constraints.days===1)}
}

async function caseTwo(){
  const session=orchestrator.startNewSession()
  let state={sessionId:session.sessionId,turns:[]}
  let turn=await reply('两天怎么玩？',state); state=turn.state
  const food=await reply('宁夏有什么特色美食？',state,turn.plan)
  const text=textOf(food.output)
  return {case:'历史路线 → 当前美食',intent:food.output.intent,behavior:food.output.response_behavior,kind:food.output.kind,final_text:text,pass:food.output.intent==='FOOD_QA'&&food.output.response_behavior==='FOOD_GUIDE'&&food.output.kind==='text'&&!hasTripTemplate(text)&&/手抓羊肉|八宝茶|羊杂/.test(text)}
}

async function caseThree(){
  const session=orchestrator.startNewSession()
  let state={sessionId:session.sessionId,turns:[]}
  let turn=await reply('贺兰山岩画值得去吗？',state); state=turn.state
  const followUp=await reply('注意事项？',state)
  const text=textOf(followUp.output)
  return {case:'文化主题连续追问',intent:followUp.output.intent,behavior:followUp.output.response_behavior,kind:followUp.output.kind,final_text:text,pass:followUp.output.intent==='CULTURE_QA'&&followUp.output.response_behavior==='STORY_EXPLANATION'&&followUp.output.kind==='text'&&!hasTripTemplate(text)&&/岩画|贺兰山/.test(text)}
}

async function contextWindowAudit(){
  const session=orchestrator.startNewSession()
  for(let index=1;index<=5;index++)conversationManager.append(`第${index}轮游客问题`,`第${index}轮回答`,session.sessionId)
  const context=conversationManager.contextForModel(session.sessionId,3)
  return {history_count:context.historyCount,recent_message_count:context.recent.length,history_summary:context.summary,pass:context.historyCount===5&&context.recent.length===6&&context.summary.includes('第2轮游客问题')&&!context.summary.includes('第5轮游客问题')}
}

async function main(){
  const rows=[await caseOne(),await caseTwo(),await caseThree()]
  const window=await contextWindowAudit()
  const failed=rows.filter(row=>!row.pass)
  const report={status:failed.length||!window.pass?'BLOCKED':'READY_FOR_HUMAN_TEST',history_contamination_before_fix:'存在潜在风险：历史消息曾以原始列表注入，且没有显式 current intent override。',history_contamination_after_fix:'源代码与本地端到端链路已加防护：当前 intent 不同于历史 intent 时，当前 intent 覆盖历史回答模式；真实微信 Cloud 运行仍需人工确认。',rows,context_window:window}
  console.log(JSON.stringify(report,null,2))
  if(failed.length||!window.pass)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
