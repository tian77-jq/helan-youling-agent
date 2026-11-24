const fs=require('fs')
const storage=new Map()

global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  removeStorageSync:key=>storage.delete(key),
  cloud:{extend:{AI:{createModel:()=>({generateText:async request=>{
    const system=String(request.messages&&request.messages[0]&&request.messages[0].content||'')
    const user=String(request.messages&&request.messages[request.messages.length-1]&&request.messages[request.messages.length-1].content||'')
    if(system.includes('旅行意图解析器'))return {choices:[{message:{content:JSON.stringify({days:1,city:'银川',budget:null,peopleCount:2,userType:'visitor',children:false,elderly:false,student:false,interests:{history:false,nature:false,food:true,photo:false},pace:'balanced',transport:'flexible',foodPreference:'',culturePreference:'',naturePreference:''})}}]}
    if(system.includes('宁夏开放问答'))return {choices:[{message:{content:JSON.stringify({answer:'这是一个宁夏相关的开放问题，我会围绕你当前关心的内容直接说明，并避免把角色设定或行程模板混进回答。',type:'OPEN_ANSWER',knowledgeIds:[]})}}]}
    const marker='知识库事实：'
    const raw=user.includes(marker)?user.slice(user.indexOf(marker)+marker.length):'[]'
    let facts=[]
    try{facts=JSON.parse(raw)}catch(error){}
    const first=facts[0]||{}
    const name=first.name&&first.name['zh-CN']||'宁夏项目知识'
    return {choices:[{message:{content:JSON.stringify({answer:`${name}是宁夏知识库中的对应条目。${first.intro||'可结合它的地点特点和出行需求进一步了解。'}`,knowledgeIds:first.id?[first.id]:[],type:'FACT'})}}]}
  }})}}}
}

const {attractions,foods}=require('../knowledge')
const {scenicCollabs}=require('../utils/data')
const orchestrator=require('../utils/ai-orchestrator')

async function ask(input,mode){
  const session=orchestrator.startNewSession()
  return orchestrator.respond(input,'zh-CN',null,{sessionId:session.sessionId,turns:[]},mode)
}

async function main(){
  const rows=[]
  for(const item of attractions){
    const name=item.name['zh-CN']
    const answer=await ask(`${name}有什么值得了解？`,'guide')
    const plan=await ask(`安排一天游览${name}，两个人，喜欢拍照`,'plan')
    const planItems=plan.result&&plan.result.plan&&plan.result.plan.days.flatMap(day=>day.items)||[]
    rows.push({type:'attraction_answer',id:item.id,name,knowledgeIds:answer.result&&answer.result.knowledgeIds,pass:answer.kind==='text'&&answer.result&&answer.result.knowledgeIds.includes(item.id)&&String(answer.result.answer).includes(name)&&!/(岩羊|沙狐|骆驼)/.test(answer.result.answer||'')})
    rows.push({type:'attraction_plan',id:item.id,name,image:item.image,pass:plan.kind==='plan'&&planItems.some(value=>value.id===item.id&&value.image===item.image)&&fs.existsSync(`.${item.image}`)})
  }
  for(const item of foods){
    const name=item.name['zh-CN']
    const answer=await ask(`${name}有什么特点？`,'guide')
    const city=String(item.city||'').split('/')[0].trim()
    const hasBaseCity=['银川','中卫','吴忠','石嘴山','固原','灵武'].includes(city)
    const plan=await ask(`安排一天${hasBaseCity?city:'宁夏'}行程，两个人，中午想吃${name}`,'plan')
    const planItems=plan.result&&plan.result.plan&&plan.result.plan.days.flatMap(day=>day.items)||[]
    rows.push({type:'food_answer',id:item.id,name,knowledgeIds:answer.result&&answer.result.knowledgeIds,pass:answer.kind==='text'&&answer.result&&answer.result.knowledgeIds.includes(item.id)&&String(answer.result.answer).includes(name)&&!/(岩羊|沙狐|骆驼)/.test(answer.result.answer||'')})
    const planPass=hasBaseCity?plan.kind==='plan'&&planItems.some(value=>value.id===item.id&&value.image===item.image)&&fs.existsSync(`.${item.image}`):plan.kind==='text'&&plan.result&&plan.result.type==='TRIP_NEEDS_BASE_CITY'
    rows.push({type:'food_plan',id:item.id,name,image:item.image,pass:planPass})
  }
  const unknown=await ask('星河秘境景区值得去吗？','guide')
  rows.push({type:'unknown_place_boundary',id:'unknown-place',pass:unknown.kind==='text'&&unknown.result&&unknown.result.type==='UNKNOWN'&&unknown.result.knowledgeIds.length===0&&/不在.*目录|不能据此编造/.test(unknown.result.answer||'')})
  const knownNames=new Set(attractions.map(item=>item.name['zh-CN']))
  const concepts=(scenicCollabs||[]).filter(item=>item.entityType==='concept'&&!knownNames.has(item.scenicName))
  for(const concept of concepts){
    const answer=await ask(`${concept.scenicName}值得去吗？`,'guide')
    const plan=await ask(`安排一天游览${concept.scenicName}`,'plan')
    rows.push({type:'concept_answer_boundary',id:concept.id,name:concept.scenicName,pass:answer.kind==='text'&&answer.result&&answer.result.type==='CONCEPT_ONLY'&&answer.result.knowledgeIds.length===0&&/视觉提案/.test(answer.result.answer||'')})
    rows.push({type:'concept_plan_boundary',id:concept.id,name:concept.scenicName,pass:plan.kind==='text'&&plan.result&&plan.result.type==='CONCEPT_ONLY'&&plan.result.knowledgeIds.length===0&&/视觉提案/.test(plan.result.answer||'')})
  }
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',attractions:attractions.length,foods:foods.length,conceptPlaces:concepts.length,total:rows.length,passed:rows.length-failed.length,failed},null,2))
  if(failed.length)process.exitCode=1
}

main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
