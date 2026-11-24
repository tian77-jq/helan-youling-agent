const personality=require('../utils/tourist-personality-layer')
const memory=require('../utils/tourist-context-memory')
const parser=require('../utils/tourist-context-parser')
const detector=require('./mechanical-response-detector')

const cases=[
  ['宁夏有什么特色美食？','FOOD_GUIDE','FOOD'],['贺兰山岩画有什么值得了解？','STORY_EXPLANATION','CULTURE'],
  ['第一次去宁夏','DIRECT_ANSWER','GENERAL'],['明天带父母银川一天，不想走太多路','TRIP_PLAN','TRIP'],
  ['西夏陵值得去吗？','STORY_EXPLANATION','CULTURE'],['八宝茶有什么讲究？','FOOD_GUIDE','FOOD'],
  ['宁夏第一次怎么玩更舒服？','DIRECT_ANSWER','GENERAL'],['镇北堡有什么故事？','STORY_EXPLANATION','CULTURE'],
  ['银川早餐吃什么？','FOOD_GUIDE','FOOD'],['沙坡头适合带老人吗？','TRIP_PLAN','TRIP'],
  ['宁夏有什么自然风景？','DIRECT_ANSWER','GENERAL'],['西夏陵为什么重要？','STORY_EXPLANATION','CULTURE'],
  ['吴忠早茶推荐什么？','FOOD_GUIDE','FOOD'],['半天在银川怎么安排？','TRIP_PLAN','TRIP'],
  ['第一次来宁夏看什么？','DIRECT_ANSWER','GENERAL'],['水洞沟有什么看点？','STORY_EXPLANATION','CULTURE'],
  ['手抓羊肉怎么吃？','FOOD_GUIDE','FOOD'],['带孩子去宁夏一天怎么玩？','TRIP_PLAN','TRIP'],
  ['宁夏旅行有什么小惊喜？','DIRECT_ANSWER','GENERAL'],['贺兰山岩画适合慢慢看吗？','STORY_EXPLANATION','CULTURE']
]
const results=cases.map(([input,behavior,expected])=>{
  const context=parser.parseTouristContext(input)
  const responseStyle=personality.resolve(null,behavior,Object.assign({first_visit:false},context))
  const sample=personality.polish('我可以帮你介绍，宁夏值得从历史、自然和地方味道慢慢认识。',responseStyle)
  const mechanical=detector.detect(sample)
  return {input,behavior,response_style:responseStyle.response_style,expected,mechanical:mechanical.hits,pass:responseStyle.response_style===expected&&mechanical.pass}
})
const sessionId='tourist-personality-eval'
memory.clear(sessionId)
memory.ingest('第一次来宁夏。',sessionId)
memory.ingest('带父母。',sessionId)
const fused=memory.ingest('少走路。',sessionId)
const contextPass=fused.first_visit&&fused.companions.includes('parents')&&fused.action_limits.includes('low_walking')
const pass=results.filter(item=>item.pass).length
console.log(JSON.stringify({status:pass===20&&contextPass?'PASS':'FAIL',total:20,pass,mechanical_response_rate:(20-pass)/20,direct_answer_rate:pass/20,context_usage_rate:contextPass?1:0,context_fusion:fused,results},null,2))
if(pass!==20||!contextPass)process.exitCode=1
