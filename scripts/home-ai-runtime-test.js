const path=require('path')

const storage=new Map()
const navigationCalls=[]
const app={globalData:{tripIsTabBar:false,locale:'zh-CN'}}
global.getApp=()=>app
global.wx={
  getStorageSync:key=>storage.get(key),
  setStorageSync:(key,value)=>storage.set(key,value),
  removeStorageSync:key=>storage.delete(key),
  navigateTo(options){navigationCalls.push({type:'navigateTo',url:options.url});if(options.success)options.success({});return Promise.resolve({})},
  switchTab(options){navigationCalls.push({type:'switchTab',url:options.url});if(options.success)options.success({});return Promise.resolve({})},
  showToast(){},showModal(){},setStorage(){},
}

function page(relative){
  let definition=null
  global.Page=value=>{definition=value}
  const resolved=require.resolve(path.join('..',relative))
  delete require.cache[resolved]
  require(resolved)
  if(!definition)throw new Error(`PAGE_NOT_REGISTERED:${relative}`)
  const instance={}
  Object.keys(definition).forEach(key=>{instance[key]=definition[key]})
  instance.data=JSON.parse(JSON.stringify(definition.data||{}))
  instance.setData=function(update,callback){Object.assign(this.data,update||{});if(callback)callback()}
  instance.getOpenerEventChannel=()=>null
  return instance
}

async function settled(instance){
  for(let index=0;index<50;index++){
    await new Promise(resolve=>setTimeout(resolve,5))
    if(!instance.data.loading)return
  }
  throw new Error('PAGE_REQUEST_TIMEOUT')
}

async function fromHomePlan(input){
  const home=page('pages/index/index.js')
  home.data.heroPrompt=input
  home.handleHomePlanRuntime()
  const trip=page('pages/trip/index.js')
  trip.onLoad({})
  await settled(trip)
  return {trip,navigation:navigationCalls[navigationCalls.length-1]}
}

async function fromHomePet(input){
  const home=page('pages/index/index.js')
  await home.handleHomePetRuntime()
  const trip=page('pages/trip/index.js')
  trip.onLoad({})
  trip.setData({prompt:input})
  trip.generate()
  await settled(trip)
  return {trip,navigation:navigationCalls[navigationCalls.length-1]}
}

async function fromPlannerEntry(input){
  const home=page('pages/index/index.js')
  await home.go({currentTarget:{dataset:{to:'/pages/trip/index'}}})
  const trip=page('pages/trip/index.js')
  trip.onLoad({})
  trip.setData({prompt:input})
  trip.generate()
  await settled(trip)
  return {trip,navigation:navigationCalls[navigationCalls.length-1]}
}

async function freshPageWithStoredQuery(){
  storage.set('hly_currentQuery','两天怎么玩？')
  storage.delete('hly_pendingTripRequest')
  const trip=page('pages/trip/index.js')
  trip.onLoad({})
  await settled(trip)
  return trip
}

function visible(trip){
  return {hasPlan:trip.data.hasPlan,hasText:Boolean(trip.data.petAnswer&&trip.data.petAnswer.answer),intent:trip.data.responseRouting&&trip.data.responseRouting.intent,behavior:trip.data.responseRouting&&trip.data.responseRouting.response_behavior,text:String(trip.data.petAnswer&&trip.data.petAnswer.answer||trip.data.plan&&trip.data.plan.summary||'')}
}

async function main(){
  const food=await fromHomePlan('宁夏有什么特色美食？')
  const culture=await fromHomePet('贺兰山岩画有什么值得了解？')
  const discovery=await fromHomePlan('宁夏有什么好玩的？')
  const nature=await fromHomePlan('宁夏有哪些自然体验？')
  const yinchuan=await fromHomePlan('银川有什么值得看？')
  const plan=await fromPlannerEntry('明天带父母银川一天，不想走太多路')
  const fresh=await freshPageWithStoredQuery()
  const rows=[
    Object.assign({entry:'首页问灵灵',input:'宁夏有什么特色美食？'},visible(food.trip),{pass:!food.trip.data.hasPlan&&/FOOD_QA|FOOD_RECOMMENDATION/.test(food.trip.data.responseRouting.intent)}),
    Object.assign({entry:'首页问萌宠',input:'贺兰山岩画有什么值得了解？'},visible(culture.trip),{pass:!culture.trip.data.hasPlan&&/CULTURE_QA|ATTRACTION_QA/.test(culture.trip.data.responseRouting.intent)}),
    Object.assign({entry:'首页问灵灵',input:'宁夏有什么好玩的？'},visible(discovery.trip),{pass:!discovery.trip.data.hasPlan&&discovery.trip.data.responseRouting.intent==='GENERAL_DISCOVERY'}),
    Object.assign({entry:'首页问灵灵',input:'宁夏有哪些自然体验？'},visible(nature.trip),{pass:!nature.trip.data.hasPlan&&/贺兰山国家森林公园|沙坡头|沙湖/.test(visible(nature.trip).text)&&!/西夏陵|岩羊|沙狐|骆驼/.test(visible(nature.trip).text)}),
    Object.assign({entry:'首页问灵灵',input:'银川有什么值得看？'},visible(yinchuan.trip),{pass:!yinchuan.trip.data.hasPlan&&!/沙坡头|沙湖|黄河大峡谷/.test(visible(yinchuan.trip).text)}),
    Object.assign({entry:'AI完整规划入口',input:'明天带父母银川一天，不想走太多路'},visible(plan.trip),{times:(plan.trip.data.plan&&plan.trip.data.plan.days[0].items||[]).map(item=>`${item.time} ${item.name}`),pass:plan.trip.data.hasPlan&&plan.trip.data.responseRouting.intent==='TRIP_PLANNING'&&(plan.trip.data.plan.days[0].items||[]).some(item=>item.id==='lanshan-park')&&(plan.trip.data.plan.days[0].items||[]).some(item=>item.time==='20:00')}),
    Object.assign({entry:'新聊天隔离',input:'（storage 中存在旧问题）'},visible(fresh),{prompt:fresh.data.prompt,pass:fresh.data.prompt===''&&!fresh.data.hasPlan&&!fresh.data.petAnswer})
  ]
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',rows},null,2))
  if(failed.length)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
