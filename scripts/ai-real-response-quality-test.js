const orchestrator=require('../utils/ai-orchestrator')
const memory=require('../utils/tourist-context-memory')
const {hasTripTemplate}=require('../utils/response-formatter')

const storage=new Map()
global.wx={getStorageSync:key=>storage.get(key),setStorageSync:(key,value)=>storage.set(key,value)}

const mechanical=/请选择|你更想了解|我可以(?:帮你)?(?:介绍|规划)|请输入需求/
async function one(label,input,expect){
  const session=orchestrator.startNewSession()
  const output=await orchestrator.respond(input,'zh-CN',null,{sessionId:session.sessionId,turns:[]})
  const text=String(output.result&&output.result.answer||output.result&&output.result.plan&&output.result.plan.summary||'')
  const visible={label,input,text,kind:output.kind,intent:output.intent,behavior:output.response_behavior,style:output.response_style&&output.response_style.name||'双峰驼规划助手风格',hasMechanical:mechanical.test(text),hasTripTemplate:hasTripTemplate(text)}
  visible.pass=expect(visible)
  return visible
}

async function contextCase(){
  const session=orchestrator.startNewSession()
  const state={sessionId:session.sessionId,turns:[]}
  await orchestrator.respond('第一次来宁夏','zh-CN',null,state)
  const second=await orchestrator.respond('带父母','zh-CN',null,state)
  const third=await orchestrator.respond('少走路','zh-CN',second.result.plan,state)
  const context=memory.load(session.sessionId)
  const plan=third.result.plan
  const text=String(plan&&plan.summary||'')
  return {label:'E',input:'第一次来宁夏 → 带父母 → 少走路',text,kind:third.kind,intent:third.intent,behavior:third.response_behavior,style:third.response_style&&third.response_style.name||'双峰驼规划助手风格',hasMechanical:mechanical.test(text),hasTripTemplate:hasTripTemplate(text),contextUsed:Boolean(context.first_visit&&context.companions.includes('parents')&&context.action_limits.includes('low_walking')&&plan.constraints.withElderly&&plan.constraints.pace==='relaxed'),pass:Boolean(plan&&plan.constraints.withElderly&&plan.constraints.pace==='relaxed')}
}

async function main(){
  const rows=[
    await one('A','宁夏有什么特色美食？',row=>row.kind==='text'&&!row.hasTripTemplate&&!row.hasMechanical&&/手抓羊肉|八宝茶|羊肉/.test(row.text)),
    await one('B','贺兰山岩画有什么值得了解？',row=>row.kind==='text'&&!row.hasTripTemplate&&!row.hasMechanical&&/贺兰山岩画|岩画/.test(row.text)),
    await one('C','西夏陵值得去吗？',row=>row.kind==='text'&&!row.hasTripTemplate&&!row.hasMechanical&&/西夏陵/.test(row.text)),
    await one('D','第一次来宁夏。',row=>row.kind==='text'&&!row.hasTripTemplate&&!row.hasMechanical&&/第一次|宁夏/.test(row.text)),
    await contextCase()
  ]
  const textRows=rows.slice(0,4)
  const metrics={mechanical_service_rate:rows.filter(row=>row.hasMechanical).length/rows.length,direct_answer_rate:textRows.filter(row=>row.pass).length/textRows.length,context_usage_rate:rows[4].contextUsed?1:0,wrong_trip_entry_rate:textRows.filter(row=>row.kind==='plan'||row.hasTripTemplate).length/textRows.length,average_answer_length:textRows.reduce((sum,row)=>sum+row.text.length,0)/textRows.length}
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'FAIL':'READY_FOR_HUMAN_TEST',metrics,failed,rows},null,2))
  if(failed.length)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)})
