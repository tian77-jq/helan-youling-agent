const fs=require('fs'),path=require('path')
const automator=require(process.env.HELAN_AUTOMATOR_PATH||'C:/Users/32862/AppData/Local/npm-cache/_npx/cf54c79a0524a233/node_modules/miniprogram-automator')
const dir=path.resolve('docs/audit-20260905')
fs.mkdirSync(dir,{recursive:true})
;(async()=>{
 const mini=await automator.connect({wsEndpoint:'ws://127.0.0.1:9420'})
 const result={status:'SIMULATOR_ONLY',at:new Date().toISOString(),sourceHash:require('./audit-fingerprint')(),pages:[],errors:[]}
 mini.on('exception',error=>result.errors.push(String(error).slice(0,200)))
 const current=await mini.currentPage()
 if(current&&current.path==='pages/trip/index'){
  await new Promise(resolve=>setTimeout(resolve,700))
  await mini.screenshot({path:path.join(dir,'workspace-current-final.png')})
 }
 for(const [name,route] of [['home','/pages/index/index'],['discover','/pages/ip/index'],['workspace','/pages/trip/index?panel=qa'],['my','/pages/admin/index'],['shapotou','/pages/trip/index?scenic=shapotou'],['host','/pages/host-demo/index']]){
  try{const page=await mini.reLaunch(route);await page.waitFor(1500);await mini.screenshot({path:path.join(dir,name+'-'+(process.env.HELAN_PROOF_PHASE||'before')+'.png')});result.pages.push({name,path:page.path,status:'CAPTURED'})}catch(error){result.pages.push({name,status:'FAILED',error:String(error).slice(0,200)})}
 }
 fs.writeFileSync(path.join(dir,'device-'+(process.env.HELAN_PROOF_PHASE||'before')+'.json'),JSON.stringify(result,null,2))
 console.log(JSON.stringify(result));await mini.disconnect()
})().catch(error=>{console.error(String(error));process.exitCode=1})
