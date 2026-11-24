const orchestrator=require('../utils/ai-orchestrator')
const manager=require('../utils/conversation-manager')
const cases=['宁夏有什么美食','西夏陵值得去吗','贺兰山岩画历史','宁夏特产有哪些','第一次来宁夏注意什么','宁夏有什么好玩的','八宝茶怎么体验','镇北堡有什么故事','宁夏有哪些自然体验','水洞沟是什么地方']
const tripWords=['旅游规划','路线规划','生成行程','旅行规划助手','旅行路线生成助手']
async function main(){
  global.wx={}
  const session=manager.startNewSession()
  const rows=[]
  for(const input of cases){
    const result=await orchestrator.respond(input,'zh-CN',null,{sessionId:session.sessionId,turns:[]})
    const answer=String(result.result&&result.result.answer||'')
    const nonTrip=result.intent!=='TRIP_PLANNING'&&result.response_behavior!=='TRIP_PLAN'&&result.kind!=='plan'&&!tripWords.some(word=>answer.includes(word))
    rows.push({input,intent:result.intent,behavior:result.response_behavior,kind:result.kind,agent:result.result&&result.result.agent&&result.result.agent.id||null,nonTrip})
  }
  const failed=rows.filter(row=>!row.nonTrip)
  console.log(JSON.stringify({status:failed.length?'FAIL':'AUDIT_OK',total:rows.length,failed,rows},null,2))
  if(failed.length)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)})
