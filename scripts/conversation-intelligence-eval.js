const {responseModeRouter}=require('../utils/response-mode-router')
const conversation=require('../utils/conversation-state')
const cases=[
  ['宁夏有什么好玩的？','GENERAL_DISCOVERY','text_exploration'],['推荐几个地方','GENERAL_DISCOVERY','text_exploration'],['适合摄影的景点','GENERAL_DISCOVERY','text_exploration'],['宁夏有哪些自然体验','GENERAL_DISCOVERY','text_exploration'],
  ['两天怎么玩？','TRIP_PLANNING','itinerary_card'],['第一次来宁夏，两天时间怎么安排？','TRIP_PLANNING','itinerary_card'],['第一次来宁夏，不喜欢爬山怎么玩？','TRIP_PLANNING','itinerary_card'],['带老人去宁夏怎么安排？','TRIP_PLANNING','itinerary_card'],['情侣三天怎么玩？','TRIP_PLANNING','itinerary_card'],['预算300元怎么规划？','TRIP_PLANNING','itinerary_card'],
  ['西夏陵值得去吗？','ATTRACTION_QA','cultural_explanation'],['贺兰山岩画讲什么？','ATTRACTION_QA','cultural_explanation'],['西夏陵适合老人吗？','ATTRACTION_QA','cultural_explanation'],['镇北堡有什么文化故事？','ATTRACTION_QA','cultural_explanation'],['水洞沟是什么地方？','ATTRACTION_QA','cultural_explanation'],
  ['宁夏有什么美食？','FOOD_RECOMMENDATION','food_recommendation'],['第一次来宁夏吃什么？','FOOD_RECOMMENDATION','food_recommendation'],['八宝茶怎么体验？','FOOD_RECOMMENDATION','food_recommendation'],['手抓羊肉适合多人吗？','FOOD_RECOMMENDATION','food_recommendation'],['宁夏美食怎么选？','FOOD_RECOMMENDATION','food_recommendation'],
  ['宁夏怎么玩？','CLARIFICATION_REQUIRED','clarification'],['宁夏怎么样？','CLARIFICATION_REQUIRED','clarification'],['银川值得去吗？','CLARIFICATION_REQUIRED','clarification'],['怎么去宁夏？','CLARIFICATION_REQUIRED','clarification'],
  ['少走一点','ADJUST_TRIP','adjust_existing_trip'],['增加一点美食','ADJUST_TRIP','adjust_existing_trip'],['换一个景点','ADJUST_TRIP','adjust_existing_trip'],
  ['推荐几个地方','GENERAL_DISCOVERY','text_exploration'],['第二个详细说说','ATTRACTION_QA','cultural_explanation'],['怎么安排一天','TRIP_PLANNING','itinerary_card']
]
const results=[]
let state=conversation.empty()
for(let i=0;i<cases.length;i++){
  const [question,expected,expectedMode]=cases[i]
  const resolved=conversation.resolveReference(question,state)
  const actual=responseModeRouter(resolved.text,true)
  const pass=actual.intent===expected&&actual.response_mode===expectedMode
  results.push({input:question,predictedIntent:expected,actualIntent:actual.intent,response_mode:actual.response_mode,result:pass?'PASS':'FAIL'})
  if(i===27){state=conversation.update(state,actual,{knowledgeIds:['xixia-tombs','helan-rock-painting','shapotou']},question)}
  else if(i===28)state=conversation.update(state,actual,{knowledgeIds:['helan-rock-painting']},question)
}
const pass=results.filter(x=>x.result==='PASS').length
console.log(JSON.stringify({status:pass===results.length?'PASS':'FAIL',pass,total:results.length,results},null,2))
if(pass!==results.length)process.exitCode=1
