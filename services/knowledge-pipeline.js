const canonical=require('../adapters/buyer-data/canonical-schema')
const flags=require('../config/build-mode')
const runtime=require('../utils/runtime-state')
const PRIORITY={VERIFIED_REALTIME:5,BUYER_OFFICIAL_DATA:4,PROJECT_APPROVED:3,PUBLIC_GROUNDED:2,GENERAL_MODEL:1}
const catalog=new Map()
const injection=/忽略.{0,12}(指令|规则)|系统提示|system\s*:|ignore.{0,20}instruction|<\/?(?:script|system)|泄露|发送.{0,12}(密钥|密码)/i
// This importer is an application boundary, never an arbitrary client upload API.
// Demo records are isolated to their tenant and must never assert real buyer rights.
function ingest(records,policy={}){
 if(!flags.SYNTHETIC_BUYER_DATA||policy.synthetic!==true||!policy.tenantId)throw new Error('BUYER_IMPORT_NOT_AUTHORIZED')
 const normalized=canonical.importRecords(records,{tenantId:policy.tenantId,sourceId:policy.sourceId,sourceType:'BUYER_DATA'})
 const accepted=[],rejected=normalized.rejected.slice()
 normalized.accepted.forEach(item=>{
  if(!item.content||!item.landmarkId||item.stale||injection.test(item.content)){rejected.push({id:item.id,reason:item.stale?'STALE':!item.content?'EMPTY_CONTENT':'EVIDENCE_REJECTED'});return}
  const evidenceLevel=policy.evidenceLevel||'BUYER_OFFICIAL_DATA'
  if(!PRIORITY[evidenceLevel]||(evidenceLevel==='VERIFIED_REALTIME'&&!(Date.parse(item.expiresAt)>Date.now()))){rejected.push({id:item.id,reason:'UNVERIFIED_LEVEL'});return}
  const fact=Object.assign(canonical.toKnowledgeContext([item])[0],{evidenceLevel,synthetic:true,provenance:{sourceType:'BUYER_DATA',sourceId:item.sourceId,landmarkId:item.landmarkId,evidenceLevel,synthetic:true,updatedAt:item.updatedAt}})
  const key=policy.tenantId+':'+fact.id,old=catalog.get(key)
  if(old&&Date.parse(old.updatedAt)>Date.parse(fact.updatedAt)){rejected.push({id:fact.id,reason:'OLDER_VERSION'});return}
  catalog.set(key,fact);accepted.push(fact.id)
 });return {accepted,rejected}
}
function select(candidates){
 const winners=new Map()
 candidates.filter(f=>!f.stale&&!injection.test(f.intro||'')&&(f.evidenceLevel!=='VERIFIED_REALTIME'||Date.parse(f.expiresAt)>Date.now())).forEach(f=>{
  const key=f.claimKey||f.landmarkId||f.id,old=winners.get(key)
  const rank=PRIORITY[f.evidenceLevel]||0,oldRank=old&&PRIORITY[old.evidenceLevel]||0
  if(!old||rank>oldRank||rank===oldRank&&Date.parse(f.updatedAt)>Date.parse(old.updatedAt))winners.set(key,f)
 });return [...winners.values()].sort((a,b)=>(PRIORITY[b.evidenceLevel]||0)-(PRIORITY[a.evidenceLevel]||0)).slice(0,6)
}
function retrieve(question,projectFacts=[],context){
 if(!context||!context.tenantId||!flags.SYNTHETIC_BUYER_DATA)return {facts:projectFacts,trace:null}
 const q=String(question||''),food=/吃|美食|特色|食物/.test(q),story=/故事|文化|生态/.test(q),source=/来自哪里|来源|出处/.test(q)
 const buyer=[...catalog.values()].filter(f=>f.tenantId===context.tenantId&&f.city===context.city&&(!food?f.landmarkId===context.landmarkId:f.category==='food')&&(source||!story||/story|culture|scenicspot/.test(f.category)))
 const kb=require('../knowledge/index')
 const scopedProject=(food?kb.foods:kb.attractions).filter(f=>food?f.city===context.city:f.id===context.landmarkId)
 const project=scopedProject.map(f=>Object.assign({},f,{landmarkId:f.id,claimKey:f.id,evidenceLevel:'PROJECT_APPROVED',sourceType:'PROJECT',sourceId:'project-catalog'}))
 const candidates=buyer.concat(project),facts=select(candidates)
 const trace={tenantId:context.tenantId,landmarkId:context.landmarkId,sessionTraceId:context.sessionTraceId||null,retrievedKnowledgeIds:candidates.map(f=>f.id),selectedKnowledgeIds:facts.map(f=>f.id),evidence:facts.map(f=>f.provenance||{sourceType:f.sourceType,sourceId:f.sourceId,landmarkId:f.landmarkId,evidenceLevel:f.evidenceLevel,synthetic:false}),consumedKnowledgeIds:[],provider:null}
 return {facts,trace}
}
function consumed(trace,facts,provider,model,traceId){if(!trace)return null;const value=Object.assign({},trace,{consumedKnowledgeIds:facts.map(f=>f.id),provider,model,traceId});runtime.set('lastBuyerTrace',value);return value}
module.exports={ingest,retrieve,select,consumed,PRIORITY}
