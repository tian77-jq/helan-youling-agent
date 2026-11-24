const fs=require('fs')
const path=require('path')

const storage=new Map()
global.wx={getStorageSync:key=>storage.get(key),setStorageSync:(key,value)=>storage.set(key,value)}

const tripAgent=require('../utils/trip-agent')
const tracker=require('../utils/tracker')
const cloudConfig=require('../config/cloud')

function read(relative){return fs.readFileSync(path.join(__dirname,'..',relative),'utf8')}

function main(){
  const elder=tripAgent.planTrip('明天带父母银川一天，不想走太多路')
  const crossCity=tripAgent.planTrip('中卫两天怎么玩？')
  tracker.trackEvent('ai_request_start',{page:'trip'})
  tracker.trackEvent('ai_answer_success',{page:'trip',intent:'FOOD_RECOMMENDATION'})
  tracker.trackEvent('photo_recognition_start',{page:'photo'})
  tracker.trackEvent('photo_recognition_success',{page:'photo',itemId:'shapotou'})
  const stats=tracker.getDashboardStats()
  const elderItems=elder.days[0].items
  const rows=[
    {case:'老人友好完整一天',items:elderItems.map(item=>`${item.time} ${item.type} ${item.name}`),pass:elderItems.some(item=>item.type==='transit')&&elderItems.some(item=>item.id==='lanshan-park')&&elderItems.some(item=>item.time==='20:00')&&elder.tips.some(item=>/体力/.test(item))},
    {case:'跨城交通不硬塞',days:crossCity.days.map(day=>day.items.map(item=>`${item.time} ${item.name}`)),pass:crossCity.days.some(day=>day.items.some(item=>item.type==='transit'&&/跨城/.test(item.name)))&&crossCity.days.every(day=>new Set(day.items.filter(item=>item.type==='attraction').map(item=>item.city)).size<=1)},
    {case:'匿名体验漏斗',stats,pass:stats.aiRequests===1&&stats.aiCompleted===1&&stats.aiCompletionRate===100&&stats.visionSuccessRate===100},
    {case:'多模态技术保留且暂停调用',pass:cloudConfig.featureVisionEnabled===false&&cloudConfig.visionModel==='glm-5v-turbo'&&cloudConfig.visionConfidenceThreshold>=0.7},
    {case:'游客可理解文案',pass:/问灵灵/.test(read('pages/trip/index.wxml'))&&!/\{\{responseRouting\.intent\}\}/.test(read('pages/trip/index.wxml'))}
  ]
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',rows},null,2))
  if(failed.length)process.exitCode=1
}

main()
