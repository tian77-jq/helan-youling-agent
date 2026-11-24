const SCHEMA_TYPES=['ScenicSpot','Event','Food','Hotel','Transport','Guide','Story','Culture','MediaAsset','RealtimeStatus']
const REQUIRED={ScenicSpot:['id','name','city'],Event:['id','name','city'],Food:['id','name','city'],Hotel:['id','name','city'],Transport:['id','name','city'],Guide:['id','name'],Story:['id','name'],Culture:['id','name'],MediaAsset:['id','name'],RealtimeStatus:['id','name','city']}
const CITY_RE=/银川|石嘴山|吴忠|中卫|固原|宁夏|灵武|贺兰|永宁|平罗|青铜峡|沙坡头|西夏/
function pick(source,keys){for(const key of keys){if(source[key]!==undefined&&source[key]!==null&&String(source[key]).trim()!=='')return source[key]}return ''}
function normalizeRecord(source={},type='ScenicSpot',options={}){
  const normalized={id:String(pick(source,['id','poiId','poi_id','spotId','spot_id','eventId','event_id','code'])).trim(),name:String(pick(source,['name','spot_name','poiName','scenic_title','title'])).trim(),city:String(pick(source,['city','city_name','district','area'])).trim(),region:'NINGXIA',type,tenantId:String(options.tenantId||source.tenantId||'synthetic-tenant'),scenicId:String(pick(source,['scenicId','scenic_id','spotId','spot_id','poiId','poi_id'])).trim(),landmarkId:String(source.landmarkId||''),sourceId:String(source.sourceId||source.source_id||options.sourceId||'buyer-source'),sourceType:options.sourceType||source.sourceType||'BUYER_DATA',evidenceLevel:source.evidenceLevel||'BUYER_OFFICIAL_PENDING',updatedAt:source.updatedAt||source.updated_at||null,provenance:{sourceId:String(source.sourceId||source.source_id||options.sourceId||'buyer-source'),sourceType:options.sourceType||source.sourceType||'BUYER_DATA',updatedAt:source.updatedAt||source.updated_at||null}}
  normalized.content=String(pick(source,['content','intro','description'])).slice(0,900)
  normalized.claimKey=String(source.claimKey||source.landmarkId||normalized.id)
  normalized.expiresAt=source.expiresAt||null
  if(type==='MediaAsset')normalized.url=String(pick(source,['url','assetUrl','media_url'])).trim()
  if(type==='RealtimeStatus')normalized.status=String(pick(source,['status','state','realtimeStatus'])).trim()
  return normalized
}
function validateRecord(item){
  const required=REQUIRED[item.type]||REQUIRED.ScenicSpot
  const missing=required.filter(key=>!String(item[key]||'').trim())
  const regionOk=!item.city||CITY_RE.test(`${item.city||''} ${item.region||''}`)
  const mediaOk=item.type!=='MediaAsset'||/^https?:\/\//.test(item.url)
  return {valid:!missing.length&&regionOk&&mediaOk,missing,regionOk,mediaOk}
}
function importRecords(records=[],options={}){
  const accepted=[],rejected=[],seen=new Set(),now=Date.now(),staleDays=Number(options.staleDays||180)
  ;(Array.isArray(records)?records:[]).forEach((source,index)=>{
    const type=SCHEMA_TYPES.includes(source&&source.type)?source.type:(options.type||'ScenicSpot')
    const item=normalizeRecord(source,type,options);const check=validateRecord(item)
    if(!check.valid){rejected.push({index,item,reason:check.missing.length?'MISSING_REQUIRED':!check.regionOk?'REGIONAL_SCOPE_REJECTED':'INVALID_MEDIA'});return}
    if(seen.has(`${type}:${item.id}`)){rejected.push({index,item,reason:'DUPLICATE'});return}seen.add(`${type}:${item.id}`)
    const updated=Date.parse(item.updatedAt||'');item.stale=Boolean(updated&&!Number.isNaN(updated)&&now-updated>staleDays*86400000);accepted.push(item)
  })
  return {accepted,rejected,metrics:{inputCount:Array.isArray(records)?records.length:0,acceptedCount:accepted.length,rejectedCount:rejected.length,normalizationSuccessRate:records.length?accepted.length/records.length:1,invalidRecordRejectRate:records.length?rejected.length/records.length:0,regionalScopeReject:rejected.filter(item=>item.reason==='REGIONAL_SCOPE_REJECTED').length,duplicateHandling:rejected.filter(item=>item.reason==='DUPLICATE').length,staleDataMarked:accepted.filter(item=>item.stale).length}}
}
function toKnowledgeContext(records=[]){return records.filter(item=>item.sourceType==='BUYER_DATA'&&item.region==='NINGXIA').map(item=>({id:item.id,name:{'zh-CN':item.name},city:item.city,category:item.type.toLowerCase(),intro:item.content,landmarkId:item.landmarkId,claimKey:item.claimKey,expiresAt:item.expiresAt,sourceId:item.sourceId,sourceType:item.sourceType,evidenceLevel:item.evidenceLevel,updatedAt:item.updatedAt,tenantId:item.tenantId}))}
module.exports={SCHEMA_TYPES,REQUIRED,normalizeRecord,validateRecord,importRecords,toKnowledgeContext}
