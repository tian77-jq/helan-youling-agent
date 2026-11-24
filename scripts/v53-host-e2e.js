const assert=require('assert'),storage=new Map()
global.wx={getStorageSync:k=>storage.get(k),setStorageSync:(k,v)=>storage.set(k,v),removeStorageSync:k=>storage.delete(k),showToast(){},reLaunch({url}){this.lastUrl=url}}
const host=require('../utils/host-runtime'),gateway=require('../utils/conversation-gateway'),manager=require('../utils/conversation-manager'),trace=require('../utils/ai-experience-trace')
;(async()=>{
 const context=host.start('shapotou');assert(context&&context.landmarkId==='shapotou');host.record('HOST',{},context)
 const session=manager.startNewSession();const state={sessionId:session.sessionId,turns:[]}
 host.record('AI_ENTRY',{},context)
 const qa=await gateway.handle('一家三口，一天，不想太累',{entryMode:'plan',hostContext:context,conversationState:state,source:'host-demo'})
 assert(qa&&qa.kind);host.record('TRIP',{source:qa.result&&qa.result.source},context)
 const patch=host.record('PATCH',{source:'local-safe'},context);assert(patch.parentTraceId)
 const story=await gateway.handle('这里有什么文化故事？',{entryMode:'guide',hostContext:context,conversationState:qa.conversationState,source:'host-story'});assert(story.result)
 host.record('STORY',{source:story.result.source},context);const memory=host.record('MEMORY',{objectId:'memory-test'},context);assert(memory)
 host.record('STAR',{},context);host.returnToHost();assert(wx.lastUrl.includes('/pages/host-demo/index?returnTrace='));host.record('RETURN_CONFIRMED',{},context)
 const chain=storage.get('hly_hostTrace')||[];const stages=chain.map(x=>x.stage);const required=['HOST','AI_ENTRY','TRIP','PATCH','STORY','MEMORY','STAR','RETURN_CONFIRMED'];required.forEach(x=>assert(stages.includes(x),x));assert(chain.every((x,i)=>i===0||x.parentTraceId===chain[i-1].traceId))
 console.log(JSON.stringify({status:'PASS',scope:'LOCAL_HOST_RUNTIME_WITH_AI_GATEWAY',tenantId:context.tenantId,landmarkId:context.landmarkId,sessionTraceId:context.sessionTraceId,stages,returnUrl:wx.lastUrl,traceChain:chain.map(x=>x.traceId)}))
})().catch(e=>{console.error(e);process.exitCode=1})
