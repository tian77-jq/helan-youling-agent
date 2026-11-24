const storage=new Map()
const requests=[]

global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  removeStorageSync:key=>storage.delete(key),
  cloud:{extend:{AI:{createModel:()=>({generateText:async request=>{
    requests.push(request)
    const system=String(request.messages&&request.messages[0]&&request.messages[0].content||'')
    if(system.includes('宁夏开放问答'))return {choices:[{message:{content:JSON.stringify({answer:'宁夏值得从风土、人文和日常生活慢慢认识。若想从美食开始，手抓羊肉、羊杂碎、八宝茶和滩羊都是很有代表性的味道。',type:'OPEN_ANSWER',knowledgeIds:[]})}}]}
    if(system.includes('旅行意图解析器'))return {choices:[{message:{content:JSON.stringify({days:2,city:'银川',peopleCount:2,budget:null,userType:'friends',children:false,elderly:false,student:false,interests:{history:false,nature:false,food:false,photo:true},pace:'balanced',transport:'flexible',foodPreference:'',culturePreference:'影视与城市夜景',naturePreference:''})}}]}
    throw new Error('UNEXPECTED_MODEL_PROMPT')
  }})}}}
}

const orchestrator=require('../utils/ai-orchestrator')
const tripAgent=require('../utils/trip-agent')

async function main(){
  const query='两天两个人，想去览山公园和西部影视城，喜欢拍照，帮我规划完整行程'
  const parsed=tripAgent.parseConstraints(query,'zh-CN')
  const planResult=await orchestrator.respond(query,'zh-CN',null,null,'plan')
  const foodResult=await orchestrator.respond('宁夏有什么特色美食？','zh-CN',null,null,'guide')
  const planItems=planResult.result&&planResult.result.plan&&planResult.result.plan.days.flatMap(day=>day.items)||[]
  const stopNames=planItems.filter(item=>item.type==='attraction').map(item=>item.name)
  const rows=[
    {case:'点名景点被识别为硬约束',requestedStops:parsed.requestedStops,pass:parsed.requestedStops.includes('lanshan-park')&&parsed.requestedStops.includes('zhenbeibao')},
    {case:'个性化输入进入规划',intent:planResult.intent,kind:planResult.kind,source:planResult.result&&planResult.result.source,pass:planResult.intent==='TRIP_PLANNING'&&planResult.kind==='plan'},
    {case:'点名景点与本地图片进入行程',stopNames,images:planItems.filter(item=>item.type==='attraction').map(item=>item.image),pass:stopNames.includes('览山公园')&&stopNames.includes('镇北堡西部影城')&&planItems.filter(item=>item.type==='attraction').every(item=>item.image)},
    {case:'问答统一走混元且无角色幻觉',type:foodResult.result&&foodResult.result.type,model:requests.some(request=>request.model==='hy3')?'hy3':'none',answer:foodResult.result&&foodResult.result.answer,pass:foodResult.result&&['FACT','OPEN_ANSWER'].includes(foodResult.result.type)&&!/岩羊|沙狐|骆驼|岩壁/.test(foodResult.result.answer||'')},
  ]
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',rows},null,2))
  if(failed.length)process.exitCode=1
}

main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
