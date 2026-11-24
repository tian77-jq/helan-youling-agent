const {attractions,foods}=require('../knowledge/index')

const attractionIds=new Set(attractions.map(item=>item.id))
const foodIds=new Set(foods.map(item=>item.id))
const realtimePattern=/票价|价格|开放时间|营业时间|几点关门|关门时间|预约|天气|路况|班次|库存|评分|销量|门票|ticket price|opening hours|weather|traffic|reservation/i

function knowledgeItem(id){return attractions.find(item=>item.id===id)||foods.find(item=>item.id===id)||null}
function assertKnown(id){if(!knowledgeItem(id))throw new Error('UNKNOWN_ENTITY');return id}
function validateKnowledgeId(id){return Boolean(knowledgeItem(id))}
function validateEntity(entity){return Boolean(entity&&((entity.id&&knowledgeItem(entity.id))||(entity.knowledgeId&&knowledgeItem(entity.knowledgeId))))}
function guardPlan(plan){
  if(!plan||!Array.isArray(plan.days))throw new Error('INVALID_PLAN')
  return Object.assign({},plan,{days:plan.days.map(day=>Object.assign({},day,{items:(day.items||[]).map(item=>{
    if(item.type==='rest'||item.type==='transit')return Object.assign({},item,{knowledgeId:null,evidence:'local-planner',image:null})
    const knowledgeId=assertKnown(item.knowledgeId||item.id)
    return Object.assign({},item,{knowledgeId,evidence:'knowledge'})
  })}))})
}
function guardText(text){
  const value=String(text||'').trim()
  if(!value)return {safe:false,reason:'EMPTY_TEXT',text:'当前知识库暂无可靠信息。'}
  if(realtimePattern.test(value))return {safe:false,reason:'REALTIME_DATA_UNAVAILABLE',text:'实时信息请以景区官方最新公告为准。'}
  return {safe:true,text:value}
}
function detectRealtimeClaim(text){return realtimePattern.test(String(text||''))}
function detectUnsupportedNumber(text){return /(?:票价|价格|评分|距离|车程|营业|开放|游客|销量|门票)[^。！？\n]{0,18}\d+(?:\.\d+)?/.test(String(text||''))}
function sanitizeModelOutput(value){
  if(!value||typeof value!=='object')throw new Error('INVALID_MODEL_OUTPUT')
  if(value.knowledgeId&&!validateKnowledgeId(value.knowledgeId))throw new Error('UNKNOWN_ENTITY')
  if(detectRealtimeClaim(JSON.stringify(value)))return {type:'REALTIME_UNVERIFIED',text:'实时信息暂未核验，请以官方最新信息为准。'}
  return value
}
function unknownFact(){return '当前知识库暂无可靠信息。'}
module.exports={attractionIds,foodIds,knowledgeItem,assertKnown,validateKnowledgeId,validateEntity,guardPlan,guardText,detectRealtimeClaim,detectUnsupportedNumber,sanitizeModelOutput,unknownFact}
