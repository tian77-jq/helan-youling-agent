const {getActiveScenicRuntime}=require('../utils/scenic-runtime')
const adapter=require('../adapters/shapotou/index')
function plan(prompt, options={}){
  const runtime=getActiveScenicRuntime(options.scenicId)
  if(!runtime.plan)return null
  const input=String(prompt||'')
  const result=runtime.plan({days:/两天|2天/.test(input)?2:1,family:/孩子|亲子/.test(input),pace:/少折腾|轻松|不想太累/.test(input)?'relaxed':'balanced',hotelGuest:/酒店|住店/.test(input),stayOvernight:/酒店|住店|过夜/.test(input),includeNight:/夜|星空|观星/.test(input)})
  const slots=result.slots.map((slot,index)=>({id:`${slot.experienceId}-${index}`,type:'attraction',time:slot.slot,name:slot.label,description:slot.label,knowledgeId:slot.experienceId,storyId:slot.experienceId==='star-night'?'desert-night':'yellow-river-desert',realtimeRequired:Boolean(slot.realtimeRequired)}))
  return {success:true,source:'shapotou-adapter-runtime',scenicId:runtime.scenicId,resolvedCharacter:'shaHu',plan:Object.assign({query:input,userSummary:input,summary:'沙坡头 · 一天的沙河节奏',cityLabel:'沙坡头 Scenario PoC',constraints:{days:result.duration==='two-day-context'?2:1,pace:result.pace},journey:result.slots,experienceSlots:result.slots,assumptions:['实时开放、票价、活动场次未接入'],realtimeUnknown:result.realtimeUnknown,days:[{date:'Day 1 · 沙河之间',items:slots}],tips:['实时开放、票价和活动请以官方最新信息为准。']},result)}
}
function refine(previousPlan,instruction){
  if(!previousPlan)return null
  const next=Object.assign({},previousPlan)
  if(/少折腾|轻松|孩子|亲子/.test(instruction)){next.pace='relaxed';next.slots=(next.slots||[]).filter(x=>x.slot!=='night');next.assumptions=[...(next.assumptions||[]),'已按轻松亲子节奏保留核心景观']}
  if(/日落/.test(instruction)&&!(next.slots||[]).some(x=>x.slot==='sunset'))next.slots=[...(next.slots||[]),{slot:'sunset',label:'傍晚 · 看一段沙河交界的光线',experienceId:'sunset-river-desert'}]
  return next
}
function story(previousPlan,question=''){
  const value=String(question||'')
  const catalog=adapter.getStoryCatalog()
  const item=/夜|星空|观星/.test(value)?catalog.find(x=>x.storyId==='desert-night'):catalog[0]
  return item?{scenicId:'shapotou',storyId:item.storyId,title:item.title,question:item.question,fact:item.fact,interpretation:item.interpretation,characterId:item.characterId,evidenceLevel:item.evidenceLevel,source:'shapotou-adapter-runtime'}:null
}
function memory(previousPlan,storyResult,note=''){
  const template=adapter.getMemoryTemplates().find(item=>item.templateId===(storyResult&&storyResult.storyId==='desert-night'?'shapotou-night-memory':'shapotou-day-memory'))||adapter.getMemoryTemplates()[0]
  return {scenicId:'shapotou',templateId:template&&template.templateId||'',title:template&&template.title||'沙坡头旅行记忆',storyId:storyResult&&storyResult.storyId||'',note:String(note||'').slice(0,100),characterId:storyResult&&storyResult.characterId||template&&template.characterId||'shaHu',source:'shapotou-adapter-runtime',aiGeneratedLabel:Boolean(template&&template.aiGeneratedLabel)}
}
module.exports={plan,refine,story,memory}
