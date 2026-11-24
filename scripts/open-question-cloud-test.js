const storage=new Map()
let lastRequest=null

global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  removeStorageSync:key=>storage.delete(key),
  cloud:{extend:{AI:{createModel:()=>({generateText:async request=>{
    lastRequest=request
    const system=String(request.messages&&request.messages[0]&&request.messages[0].content||'')
    if(!system.includes('宁夏开放问答'))throw new Error('OPEN_PROMPT_NOT_USED')
    const user=String(request.messages&&request.messages[2]&&request.messages[2].content||'')
    const answer=/大学/.test(user)
      ? '宁夏最有代表性的综合性大学是宁夏大学，位于银川，是国家“双一流”建设高校。它的农学、草业、民族学等方向很有地域特色，也能帮助你从教育和城市生活的角度认识宁夏。'
      : '黄河走进宁夏，没有急着远去。它把水光留给田野，把风声留给古渡，也把一片塞上江南写进西北大地。站在河岸看它向前，像看见宁夏温柔而坚定的脉搏。'
    return {choices:[{message:{content:JSON.stringify({answer,type:'OPEN_ANSWER',knowledgeIds:[]})}}]}
  }})}}}
}

const orchestrator=require('../utils/ai-orchestrator')

async function main(){
  const result=await orchestrator.respond('歌颂一下宁夏的黄河','zh-CN',null,null)
  const answer=String(result.result&&result.result.answer||'')
  const university=await orchestrator.respond('宁夏有名的大学是什么','zh-CN',null,null,'guide')
  const rows=[
    {case:'开放问题直接回答',intent:result.intent,kind:result.kind,type:result.result&&result.result.type,answer,pass:result.intent==='GENERAL_DISCOVERY'&&result.kind==='text'&&result.result.type==='OPEN_ANSWER'&&/黄河/.test(answer)},
    {case:'没有误入路线',formatter:result.format&&result.format.formatter,imageRenderer:result.format&&result.format.image_renderer,pass:result.kind!=='plan'&&!/第一天|第二天|行程/.test(answer)&&result.format.image_renderer==='none'},
    {case:'使用混元文本模型',model:lastRequest&&lastRequest.model,messages:lastRequest&&lastRequest.messages&&lastRequest.messages.length,pass:lastRequest&&lastRequest.model==='hy3'&&lastRequest.messages.length===3},
    {case:'开放回答不强制虚假证据',evidence:result.result&&result.result.evidence,knowledgeIds:result.result&&result.result.knowledgeIds,pass:result.result.evidence==='model-general'&&result.result.knowledgeIds.length===0}
    ,{case:'知识库未覆盖仍可开放回答',intent:university.intent,type:university.result&&university.result.type,answer:university.result&&university.result.answer,pass:university.intent==='GENERAL_DISCOVERY'&&university.result.type==='OPEN_ANSWER'&&/宁夏大学/.test(university.result.answer)&&university.kind==='text'}
  ]
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',rows},null,2))
  if(failed.length)process.exitCode=1
}

main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
