const fs=require('fs'),path=require('path')
const automator=require('C:/Users/32862/AppData/Local/npm-cache/_npx/cf54c79a0524a233/node_modules/miniprogram-automator')
const dir=path.resolve('docs/motion-20260905'),phase=process.argv[2]||'before'
fs.mkdirSync(dir,{recursive:true})
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const watchdog=setTimeout(()=>{console.error('SIMULATOR_TIMEOUT');process.exit(1)},55000)
;(async()=>{
 const mini=await automator.connect({wsEndpoint:'ws://127.0.0.1:9420'});console.log('Connected')
 const report={phase,sourceHash:require('./audit-fingerprint')(),errors:[],pages:[]}
 mini.on('exception',e=>report.errors.push(String(e)))
 for(const [name,route] of [['home','/pages/index/index'],['discover','/pages/ip/index'],['gallery','/pages/shop/index'],['star','/pages/admin/index'],['workspace','/pages/trip/index?panel=qa']]){
  console.log(name);await mini.reLaunch(route);await sleep(2100)
  await mini.screenshot({path:path.join(dir,name+'-'+phase+'.png')})
  report.pages.push({name,route})
 }
 fs.writeFileSync(path.join(dir,phase+'.json'),JSON.stringify(report,null,2));await mini.disconnect();clearTimeout(watchdog);console.log(JSON.stringify(report))
})().catch(e=>{clearTimeout(watchdog);console.error(String(e));process.exit(1)})
