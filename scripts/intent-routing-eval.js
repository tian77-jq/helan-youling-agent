const {responseModeRouter}=require('../utils/response-mode-router')
const cases=[
  ['宁夏有什么好玩的？','GENERAL_DISCOVERY'],
  ['第一次来怎么玩？','TRIP_PLANNING'],
  ['宁夏有哪些值得看的地方？','GENERAL_DISCOVERY'],
  ['两天怎么玩？','TRIP_PLANNING'],
  ['第一次来宁夏，两天时间怎么安排？','TRIP_PLANNING'],
  ['西夏陵值得去吗？','CULTURE_QA'],
  ['贺兰山岩画讲的是什么？','CULTURE_QA'],
  ['宁夏有什么美食？','FOOD_QA'],
  ['第一次来宁夏吃什么？','FOOD_QA'],
  ['少走一点。','ADJUST_TRIP']
]
const results=cases.map(([question,expected])=>{const actual=responseModeRouter(question,true);return {question,expected,actual:actual.intent,confidence:actual.confidence,response_mode:actual.response_mode,pass:actual.intent===expected}})
const pass=results.filter(x=>x.pass).length
console.log(JSON.stringify({status:pass===cases.length?'PASS':'FAIL',pass,total:cases.length,results},null,2))
if(pass!==cases.length)process.exitCode=1
