const path=require('path')

const storage=new Map()
const app={globalData:{tripIsTabBar:false,locale:'zh-CN'}}
global.getApp=()=>app
global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  removeStorageSync:key=>storage.delete(key),
  navigateTo:options=>{if(options.success)options.success({});return Promise.resolve({})},
  switchTab:options=>{if(options.success)options.success({});return Promise.resolve({})},
  showToast(){}
}

let definition=null
global.Page=value=>{definition=value}
require(path.join('..','pages','index','index.js'))
const home=Object.assign({},definition)
home.data=JSON.parse(JSON.stringify(definition.data||{}))
home.setData=function(update){Object.assign(this.data,update||{})}

async function pendingAfter(action){
  storage.delete('hly_pendingTripRequest')
  delete app.globalData.pendingTripRequest
  await action()
  return storage.get('hly_pendingTripRequest')||app.globalData.pendingTripRequest
}

async function main(){
  home.data.heroPrompt='歌颂一下宁夏的黄河'
  const ask=await pendingAfter(()=>home.handleHomePlanRuntime())
  const plan=await pendingAfter(()=>home.go({currentTarget:{dataset:{to:'/pages/trip/index'}}}))
  const pet=await pendingAfter(()=>home.handleHomePetRuntime())
  const homeWxml=require('fs').readFileSync(path.join(__dirname,'..','pages','index','index.wxml'),'utf8')
  const rows=[
    {case:'首页问灵灵',request:ask,pass:ask.mode==='guide'&&ask.source==='home-ask'},
    {case:'AI完整规划入口',request:plan,pass:plan.mode==='plan'&&plan.source==='home-entry'},
    {case:'宁夏问答快捷入口',request:pet,pass:pet.mode==='guide'&&pet.source==='home-pet'},
    {case:'识图不占用用户入口',pass:!/bindtap="openVision"/.test(homeWxml)&&!/AI识景/.test(homeWxml)}
  ]
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',rows},null,2))
  if(failed.length)process.exitCode=1
}

main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
