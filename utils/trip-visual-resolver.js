const {landmarks,getLandmark}=require('../design-tokens/landmark-registry')
const {registry,productionScenes}=require('../design-tokens/scene-assets')

const aliases={
  '贺兰山国家森林公园':'helan-mountain','贺兰山森林公园':'helan-mountain',
  '青铜峡黄河大峡谷':'yellow-river','黄河大峡谷':'yellow-river','黄河古渡':'yellow-river',
  '中卫大漠星空':'zhongwei-star-sky','66号公路':'route-66','六盘山国家森林公园':'liupan-mountain'
}
const sceneByLandmark={
  'helan-mountain':'NX_HELAN_HERO','helan-rock-painting':'NX_HELAN_ROCK_ART','lanshan-park':'NX_LANSHAN_SUNSET','xixia-tombs':'NX_XIXIA',
  'yellow-river':'NX_YELLOW_RIVER','shahu':'NX_SHAHU','shapotou':'SPT_RIVER_SCENE',
  'route-66':'NX_ROUTE66','liupan-mountain':'NX_LIUPAN','zhongwei-star-sky':'NX_ZHONGWEI_STAR'
}
const nameOf=value=>typeof value==='string'?value:String(value&&value['zh-CN']||value&&value['en-US']||'')
function resolveLandmark(item){
  const id=String(item&& (item.landmarkId||item.knowledgeId||item.id)||'')
  if(getLandmark(id))return getLandmark(id)
  const text=`${id} ${nameOf(item&&item.name)} ${nameOf(item&&item.title)}`
  const found=landmarks.slice().sort((a,b)=>b.officialName.length-a.officialName.length).find(landmark=>text.includes(landmark.officialName))
  if(found)return found
  const alias=Object.keys(aliases).find(key=>text.includes(key))
  return alias?getLandmark(aliases[alias]):null
}
function resolveSegment(item,index){
  const source=item||{}
  const landmark=resolveLandmark(source)
  const sceneId=landmark&&sceneByLandmark[landmark.landmarkId]
  const scene=sceneId&&registry[sceneId]
  const knowledgeIds=Array.isArray(source.knowledgeIds)?source.knowledgeIds.slice():[]
  if(source.knowledgeId&&!knowledgeIds.includes(source.knowledgeId))knowledgeIds.unshift(source.knowledgeId)
  if(landmark&&!knowledgeIds.includes(landmark.landmarkId))knowledgeIds.push(landmark.landmarkId)
  return Object.assign({},source,{
    segmentId:source.segmentId||`segment-${index+1}`,
    title:source.title||nameOf(source.name)||(landmark&&landmark.officialName)||'宁夏体验段',
    landmarkId:landmark&&landmark.landmarkId||source.landmarkId||null,
    city:source.city||(landmark&&landmark.city)||'宁夏',
    region:landmark?'NINGXIA':source.region||'UNKNOWN',
    timeSlot:source.timeSlot||source.preferredVisit||'daytime',
    sceneId:sceneId||null,
    sceneAsset:scene||null,
    character:source.character||(landmark&&landmark.character)||'camel',
    aiAction:source.aiAction||(landmark&&landmark.aiActions&&landmark.aiActions[0])||'PLAN',
    knowledgeIds,
    visualMatch:landmark&&scene?'EXACT_LANDMARK':'UNRESOLVED'
  })
}
function resolvePlan(plan){
  const days=(plan&&plan.days||[]).map(day=>Object.assign({},day,{items:(day.items||[]).map(resolveSegment)}))
  return Object.assign({},plan,{days,visionArchitecture:'LANDMARK_SCOPED',visualRegistryVersion:'V4.3'})
}
module.exports={aliases,resolveLandmark,resolveSegment,resolvePlan,sceneByLandmark,productionScenes}
