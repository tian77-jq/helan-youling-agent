const state=require('./runtime-state'),flags=require('../config/build-mode')
const {attractions}=require('../knowledge/index')
const RETURN='/pages/host-demo/index'
function validate(value){
 if(!flags.HOST_DEMO||!value||value.tenantId!=='synthetic-tenant'||value.platformId!=='generic-tourism-host'||value.returnTarget!==RETURN||value.entrySource!=='generic-host-demo')return null
 const place=attractions.find(p=>p.id===value.landmarkId)
 if(!place||place.city!==value.city||value.scenicId!==value.landmarkId||!/^host-[a-z0-9-]+$/.test(value.sessionTraceId||'')||!(value.expiresAt>Date.now()))return null
 return {tenantId:value.tenantId,platformId:value.platformId,scenicId:place.id,landmarkId:place.id,city:place.city,scenicName:place.name['zh-CN'],returnTarget:RETURN,entrySource:'generic-host-demo',sessionTraceId:value.sessionTraceId,expiresAt:value.expiresAt}
}
function active(){return validate(state.get('hostContext',null))}
function record(stage,fields={},context=active()){
 const host=validate(context);if(!host)return null
 const chain=state.get('hostTrace',[]).filter(e=>e.sessionTraceId===host.sessionTraceId)
 const row={sessionTraceId:host.sessionTraceId,parentTraceId:chain.length?chain[chain.length-1].traceId:null,traceId:host.sessionTraceId+'-'+(chain.length+1),stage,landmarkId:host.landmarkId,provider:fields.provider||null,source:fields.source||null,objectId:fields.objectId||null,at:Date.now()}
 state.set('hostTrace',chain.concat(row).slice(-40));return row
}
function start(landmarkId='shapotou'){
 const place=attractions.find(p=>p.id===landmarkId);if(!place||!flags.HOST_DEMO)return null
 const host=validate({tenantId:'synthetic-tenant',platformId:'generic-tourism-host',scenicId:place.id,landmarkId:place.id,city:place.city,returnTarget:RETURN,entrySource:'generic-host-demo',sessionTraceId:'host-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),expiresAt:Date.now()+3600000})
 state.set('hostContext',host);record('HOST',{},host);return host
}
function returnToHost(){const host=active();if(!host){wx.showToast({title:'景区上下文已过期',icon:'none'});return}wx.reLaunch({url:RETURN+'?returnTrace='+encodeURIComponent(host.sessionTraceId),fail:()=>wx.showToast({title:'返回失败，请重试',icon:'none'})})}
module.exports={validate,active,record,start,returnToHost}
