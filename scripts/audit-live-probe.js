const fs=require('fs'),automator=require('C:/Users/32862/AppData/Local/npm-cache/_npx/cf54c79a0524a233/node_modules/miniprogram-automator')
;(async()=>{
 const mini=await automator.connect({wsEndpoint:'ws://127.0.0.1:9420'})
 const report={at:new Date().toISOString(),sourceHash:require('./audit-fingerprint')(),scope:'SIMULATOR_LIVE_ATTEMPT'}
 const timer=setTimeout(()=>{report.status='AUTOMATION_TIMEOUT';fs.writeFileSync('docs/audit-20260905/live-probe.json',JSON.stringify(report,null,2));mini.disconnect()},90000)
 try{
 await mini.reLaunch('/pages/trip/index?panel=qa')
 console.log('Page opened')
 await mini.evaluate(()=>{const p=getCurrentPages().slice(-1)[0];p.setData({prompt:'今晚银川去哪？'});setTimeout(()=>p.generate(),0);return true})
 console.log('Question dispatched')
 for(let i=0;i<35;i++){await new Promise(r=>setTimeout(r,1500));const state=await mini.evaluate(()=>{const d=getCurrentPages().slice(-1)[0].data;return {loading:d.loading,error:d.error,source:d.petAnswer&&d.petAnswer.source,knowledgeIds:d.petAnswer&&d.petAnswer.knowledgeIds,answerLength:String(d.petAnswer&&(d.petAnswer.answer||d.petAnswer.answerText)||'').length}});report.result=state;if(!state.loading&&state.answerLength)break}
 report.status=report.result&&report.result.answerLength?'RESPONSE_OBSERVED':'NO_RESPONSE'
 }catch(error){report.error=String(error)}
 clearTimeout(timer);fs.writeFileSync('docs/audit-20260905/live-probe.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));mini.disconnect()
})().catch(error=>{console.error(String(error));process.exitCode=1})
