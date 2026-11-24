const storage=new Map()
const animalAnswer='贺兰山有岩羊、蓝马鸡和金雕等有代表性的野生动物。它们与山地、荒漠交错的生态环境有关，观察时应保持距离，不干扰野生动物。'
global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  cloud:{init:()=>{},extend:{AI:{createModel:()=>({generateText:async()=>({choices:[{message:{content:JSON.stringify({answer:animalAnswer,knowledgeIds:['helan-mountain'],type:'OPEN_ANSWER'})}}]})})}}}
}
const askPet=require('../utils/ask-pet-ai')

async function main(){
  const result=await askPet.ask('贺兰山有哪些特色动物？','zh-CN',null,{intent:'GENERAL_DISCOVERY',responseMode:'text_exploration',responseBehavior:'DIRECT_ANSWER',context:{},history:[]})
  const pass=result.source==='cloud'&&result.quality_gate==='OPEN_CLOUD_ANSWER'&&/岩羊/.test(result.answer)&&/蓝马鸡|金雕/.test(result.answer)&&result.image_quality_gate==='NONE'
  console.log(JSON.stringify({status:pass?'PASS':'FAIL',source:result.source,qualityGate:result.quality_gate,imageQualityGate:result.image_quality_gate,answer:result.answer},null,2))
  if(!pass)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
