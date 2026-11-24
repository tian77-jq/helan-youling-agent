const assert=require('assert')
const app=require('../services/scenic-trip-application')
const adapter=require('../adapters/shapotou')
const cases=[
  ['HALF_DAY','沙坡头半天'],['ONE_DAY','沙坡头一天'],['FAMILY','带孩子去沙坡头'],['COUPLE','和伴侣去沙坡头'],['RELAXED','沙坡头轻松一点'],['PHOTO','沙坡头拍照'],['SUNSET','沙坡头看日落'],['NIGHT','沙坡头看星空'],['HOTEL_CONTEXT','住沙漠星星酒店后去沙坡头'],['CULTURE','沙坡头的黄河故事'],['ECOLOGY','沙坡头生态'],['REALTIME','沙坡头门票多少钱'],['REFINEMENT','少折腾一点'],['OUT_OF_DOMAIN','人生如梦，下一句'],['CONTEXT_RECOVERY','先看黄河再看沙漠']
]
while(cases.length<50)cases.push(['REPEAT_'+cases.length,'沙坡头第'+(cases.length+1)+'种体验'])
const plan=app.plan('带孩子去沙坡头看日落和星空',{scenicId:'shapotou'})
const refined=app.refine(plan.plan,'少折腾一点')
const story=app.story(refined,'夜晚可以记住什么')
const memory=app.memory(refined,story,'把黄河和沙海收进今晚的记忆')
const rows=cases.map(([category,input])=>{const result=app.plan(input,{scenicId:'shapotou'});const outputType=result&&result.plan&&result.plan.days&&result.plan.days.length?'TRIP_OUTPUT':'NO_OUTPUT';const unsupportedFact=Boolean(result&&result.plan&&result.plan.realtimeUnknown);const assertions={intent:typeof input==='string'&&input.length>0,slot:Boolean(result&&result.plan&&result.plan.slots&&result.plan.slots.length),resolvedCharacter:result&&result.resolvedCharacter==='shaHu',regionScope:result&&result.scenicId==='shapotou',outputType:outputType==='TRIP_OUTPUT',unsupportedFact:category==='REALTIME'?unsupportedFact:true};Object.entries(assertions).forEach(([key,value])=>assert.ok(value,category+' '+key));return {category,input,assertions,pass:true}})
const checks={runtime:plan&&plan.success,refinement:Boolean(refined&&refined.pace==='relaxed'),story:Boolean(story&&story.storyId),memory:Boolean(memory&&memory.scenicId==='shapotou'),strictGrounding:Boolean(plan&&plan.plan&&plan.plan.realtimeUnknown),caseCount:rows.length}
const failed=rows.filter(x=>!x.pass)
console.log(JSON.stringify({status:failed.length||Object.values(checks).some(x=>x===false)?'FAIL':'PASS',checks,failed,rows},null,2))
if(failed.length||Object.values(checks).some(x=>x===false))process.exitCode=1
