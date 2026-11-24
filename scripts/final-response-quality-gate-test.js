const askPet=require('../utils/ask-pet-ai')

const storage=new Map()
let modelAnswer=''
global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  cloud:{init:()=>{},extend:{AI:{createModel:()=>({generateText:async()=>({choices:[{message:{content:JSON.stringify({answer:modelAnswer,knowledgeIds:['hand-grabbed-lamb','eight-treasure-tea'],type:'FACT'})}}]})})}}}
}

async function ask(answer){
  modelAnswer=answer
  return askPet.ask('宁夏有什么特色美食？','zh-CN',null,{intent:'FOOD_RECOMMENDATION',responseMode:'food_recommendation',responseBehavior:'FOOD_GUIDE',context:{},history:[]})
}

async function main(){
  const mechanical=await ask('我可以帮你规划旅游路线，也可以介绍宁夏美食。')
  const polished=await ask('手抓羊肉重在羊肉本味，配一碗八宝茶会很舒服。')
  const rows=[
    {case:'客服/路线语言',source:mechanical.source,quality_gate:mechanical.quality_gate,text:mechanical.answer,pass:mechanical.source==='local-fallback'&&mechanical.quality_gate==='MECHANICAL_OR_TRIP_LANGUAGE'&&!/旅游路线|我可以帮你/.test(mechanical.answer)},
    {case:'合格 Cloud 美食回答',source:polished.source,quality_gate:polished.quality_gate,text:polished.answer,pass:polished.source==='cloud'&&polished.quality_gate==='CLOUD_POLISHED'&&/手抓羊肉/.test(polished.answer)&&!/旅游路线|我可以帮你/.test(polished.answer)}
  ]
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_HUMAN_TEST',rows},null,2))
  if(failed.length)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
