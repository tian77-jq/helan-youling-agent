const assert=require('assert')
const storage=new Map()
global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  removeStorageSync:key=>storage.delete(key),
  cloud:{extend:{AI:{createModel:()=>({
    generateText:async request=>{
      const system=String(request.messages&&request.messages[0]&&request.messages[0].content||'')
      if(system.includes('旅行意图解析器'))return {choices:[{message:{content:JSON.stringify({days:2,city:'银川',peopleCount:2,elderly:true,student:true,interests:{history:false,nature:true,food:true,photo:false},pace:'relaxed',transport:'public'})}}]}
      if(system.includes('宁夏开放问答'))return {choices:[{message:{content:JSON.stringify({answer:'这是经过统一对话入口处理的直接回答。',type:'OPEN_ANSWER',knowledgeIds:[]})}}]}
      return {choices:[{message:{content:'不是行程 JSON，触发安全基线。'}}]}
    }
  })}}}
}

const gateway=require('../utils/conversation-gateway')
const pairs=[
  '宁夏有什么特色美食',
  '我想去沙坡头',
  '我带老人去宁夏玩',
  '预算500怎么玩',
  '宁夏有什么大学',
  '我想吃羊肉'
]
async function main(){
  const rows=[]
  for(const input of pairs){
    const quick=await gateway.handle(input,{entryMode:input.includes('沙坡头')?'plan':'guide',source:'quick'})
    const manual=await gateway.handle(input,{entryMode:input.includes('沙坡头')?'plan':'guide',source:'manual'})
    const same=quick.intent===manual.intent&&quick.responseBehavior===manual.responseBehavior&&JSON.stringify(quick.entities)===JSON.stringify(manual.entities)
    rows.push({input,same,intent:quick.intent,responseBehavior:quick.responseBehavior,entities:quick.entities})
  }
  const failed=rows.filter(row=>!row.same)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',total:rows.length,passed:rows.length-failed.length,failed},null,2))
  if(failed.length)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
