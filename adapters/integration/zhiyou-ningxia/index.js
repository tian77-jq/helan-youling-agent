const CONTRACT_VERSION='2026-08'
const HOST_PLATFORM='ZHYOU_NINGXIA_HOST'

const capabilities={
  host:{ticketing:true,membership:true,booking:true,officialGuide:true},
  experienceLayer:{aiTrip:true,story:true,character:true,memory:true,share:true}
}

function createEntry(options={}){
  return {hostPlatform:HOST_PLATFORM,entryId:String(options.entryId||'ai-lingyou'),label:String(options.label||'跟灵灵游宁夏'),target:'/pages/trip/index?mode=guide',source:String(options.source||'host-home'),contractVersion:CONTRACT_VERSION}
}

function createContext(payload={}){
  return {hostPlatform:HOST_PLATFORM,contractVersion:CONTRACT_VERSION,visitorRef:payload.visitorRef||null,locale:payload.locale||'zh-CN',scenicRef:payload.scenicRef||null,permissions:{readOfficialContext:false,writeHostData:false,readPrivateApi:false}}
}

function handoff(capability,payload={}){
  const allowed=['aiTrip','story','character','memory','share']
  if(allowed.indexOf(capability)<0)throw new Error('UNSUPPORTED_EXPERIENCE_CAPABILITY')
  return {hostPlatform:HOST_PLATFORM,contractVersion:CONTRACT_VERSION,capability,mode:'MOCK_HANDOFF',payload}
}

function normalizeOfficialRecord(record={},type='ScenicSpot'){
  const source=record||{}
  const id=String(source.id||source.poiId||source.poi_id||source.spotId||source.spot_id||source.eventId||source.event_id||source.code||'').trim()
  const name=String(source.name||source.spot_name||source.poiName||source.title||'').trim()
  const city=String(source.city||source.city_name||source.district||source.area||'宁夏').trim()
  return {id,name,city,type,region:'NINGXIA',intro:String(source.intro||source.description||source.summary||''),openTime:String(source.openTime||source.open_time||source.businessHours||''),sourceSystem:HOST_PLATFORM,evidenceLevel:'BUYER_SOURCE'}
}

function normalizeCatalog(records=[],type='ScenicSpot'){
  return (Array.isArray(records)?records:[]).map(record=>normalizeOfficialRecord(record,type)).filter(item=>item.id&&item.name)
}

function createEmbeddedEntry(options={}){
  return Object.assign(createEntry(options),{mode:'EMBEDDED_EXPERIENCE_LAYER',returnPath:options.returnPath||'/pages/host-return/index',contextId:String(options.contextId||'host-context')})
}

function returnToHost(payload={}){
  return {hostPlatform:HOST_PLATFORM,contractVersion:CONTRACT_VERSION,action:'RETURN_TO_HOST',returnPath:String(payload.returnPath||'/'),capability:payload.capability||'memory',contextId:payload.contextId||null,resultRef:payload.resultRef||null}
}

module.exports={HOST_PLATFORM,CONTRACT_VERSION,capabilities,createEntry,createContext,handoff,normalizeOfficialRecord,normalizeCatalog,createEmbeddedEntry,returnToHost}
