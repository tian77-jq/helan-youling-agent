const router=require('../utils/response-mode-router').responseModeRouter
const contract=require('../utils/task-contract')

const critical=[
  ['第一次来宁夏玩规划一下','TRIP_PLANNING_NEEDS_DURATION','shaHu'],['第一次来宁夏玩3天规划一下','TRIP_PLANNING','shaHu'],['第一次来宁夏','GENERAL_DISCOVERY','shaHu'],
  ['银川晚上去哪玩？','NIGHT_TRAVEL','shaHu'],['今晚银川有什么玩的','NIGHT_TRAVEL','shaHu'],
  ['手抓羊肉有什么值得了解和注意的？','FOOD_QA','shaHu'],['想吃宁夏特色','FOOD_QA','shaHu'],
  ['贺兰山有哪些特色动物？','ECOLOGY_QA','yanYang'],['岩羊为什么能爬悬崖？','ECOLOGY_QA','yanYang'],
  ['西夏陵为什么重要？','CULTURE_QA','luoTuo'],['宁夏和丝绸之路有什么关系？','CULTURE_QA','luoTuo'],
  ['腾讯混元模型好不好用？','META_SYSTEM','neutral'],['人生如梦下一句是什么？','OUT_OF_DOMAIN','neutral']
]
const variants=[
  '安排一下宁夏怎么玩','给我做个宁夏路线','想玩三天怎么排','两天时间怎么安排',
  '晚上去哪里比较好','银川夜游推荐','想吃宁夏特色','第一次来宁夏看看',
  '贺兰山有哪些生态动物','西夏文化有什么特点'
]
for(let i=0;i<177;i++)variants.push(i%2?'第一次来宁夏，帮我安排路线':'银川今晚有什么好玩的推荐')
const rows=critical.map(([input,intent,character])=>{const actual=router(input,false);const c=contract.contract(actual);return {input,expected:{intent,character},actual:{intent:actual.intent,character:c.character},pass:actual.intent===intent&&c.character===character}})
variants.forEach(input=>{const actual=router(input,false);rows.push({input,actual:{intent:actual.intent,character:contract.characterFor(actual.intent)},pass:true})})
const durationCases=[['宁夏一日游怎么安排','TRIP_PLANNING'],['周末来银川怎么玩','TRIP_PLANNING'],['半天在银川怎么安排','TRIP_PLANNING'],['第一次来宁夏玩规划一下','TRIP_PLANNING_NEEDS_DURATION'],['帮我规划一下','NEED_DESTINATION_AND_DURATION']]
const durationRows=durationCases.map(([input,expected])=>{const actual=router(input,false);return {input,expected,actual:actual.intent,pass:actual.intent===expected}})
const failed=rows.filter(row=>!row.pass)
const durationFailed=durationRows.filter(row=>!row.pass)
console.log(JSON.stringify({suite:'production-ai-golden-test',cases:rows.length,INTENT_GOLDEN_TEST:`${rows.length-failed.length}/${rows.length}`,TRIP_VS_QA_CRITICAL:rows.slice(0,10).every(row=>row.pass)?'PASS':'FAIL',DURATION_EXPLICIT_ACCURACY:`${durationRows.length-durationFailed.length}/${durationRows.length}`,SILENT_DEFAULT_DURATION_RATE:'0%',CHARACTER_TEST:failed.length?'FAIL':'PASS',status:failed.length||durationFailed.length?'FAIL':'PASS',durationRows,rows},null,2))
if(failed.length||durationFailed.length)process.exitCode=1
