const assert=(value,message)=>{if(!value)throw new Error(message)}
const manager=require('../utils/conversation-manager')
const memory=require('../utils/tourist-context-memory')
const orchestrator=require('../utils/ai-orchestrator')
const router=require('../utils/response-mode-router')
const behavior=require('../utils/response-behavior-router')

const singles=['宁夏有什么好玩的？','宁夏有什么特色美食？','明天带父母银川一天怎么玩？','第一次去宁夏需要注意什么？','西夏陵值得去吗？','八宝茶怎么体验？','推荐适合摄影的地方','我只有半天在银川看历史怎么安排？','预算500元想吃宁夏美食','沙坡头适合第一次来吗？','宁夏有哪些自然体验？','贺兰山岩画讲什么？','手抓羊肉适合多人吗？','带7岁孩子去宁夏怎么玩？','银川一天怎么安排？','两天想看历史和美食','中卫有什么好玩的？','吴忠有什么特色小吃？','第一次来宁夏住哪里方便？','我不喜欢爬山怎么游宁夏？','想去看黄河和沙漠','老人适合去哪些景点？','宁夏有什么适合拍照的地方？','预算300元怎么吃宁夏？','镇北堡有什么故事？','水洞沟是什么地方？','明天在银川轻松逛逛']
const mechanical=['请选择1/2/3','请选择：','你更想了解','我可以帮你介绍','我可以帮你规划']
async function main(){
  global.wx={}
  const session=manager.startNewSession()
  let memoryRate=0,retentionRate=0,mechanicalRate=0,rows=[]
  for(const input of singles){
    const routing=router.responseModeRouter(input,false)
    const context=memory.ingest(input,session.sessionId)
    const action=behavior.responseBehaviorRouter(routing,Object.assign({},context))
    const result=await orchestrator.respond(input,'zh-CN',null,{sessionId:session.sessionId,turns:[]})
    const direct=['宁夏有什么好玩的？','宁夏有什么特色美食？','明天带父母银川一天怎么玩？'].includes(input)?action.response_behavior!=='CLARIFICATION':true
    if(direct)memoryRate++
    const bad=mechanical.some(x=>String(result.result&&result.result.answer||'').includes(x))
    if(!bad)mechanicalRate++
    rows.push({type:'single',input,response_behavior:result.response_behavior,answer:result.result&&result.result.answer||'',pass:direct&&!bad})
  }
  const s2=manager.startNewSession()
  await orchestrator.respond('第一次去宁夏','zh-CN',null,{sessionId:s2.sessionId,turns:[]})
  const r2=await orchestrator.respond('带父母','zh-CN',null,{sessionId:s2.sessionId,turns:[]})
  const c2=memory.load(s2.sessionId)
  const r3=await orchestrator.respond('少走路','zh-CN',null,{sessionId:s2.sessionId,turns:[]})
  const retained= c2.first_visit&&c2.companions.includes('parents')&&r3.context.companions.includes('parents')&&r3.context.action_limits.includes('low_walking')
  if(retained)retentionRate=1
  rows.push({type:'three_turn',inputs:['第一次去宁夏','带父母','少走路'],memory:c2,finalContext:r3.context,pass:retained})
  const oldId=s2.sessionId
  const fresh=manager.startNewSession()
  const freshContext=memory.load(fresh.sessionId)
  const isolated=fresh.sessionId!==oldId&&freshContext.companions.length===0&&freshContext.first_visit===false
  if(!isolated)throw new Error('new session is not isolated')
  rows.push({type:'new_session',oldSessionId:oldId,newSessionId:fresh.sessionId,context:freshContext,pass:isolated})
  const total=singles.length+3
  console.log(JSON.stringify({status:rows.every(x=>x.pass)?'PASS':'FAIL',total,conversation_memory_rate:memoryRate/singles.length,context_retention_rate:retentionRate,mechanical_response_rate:mechanicalRate/singles.length,rows},null,2))
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)})
