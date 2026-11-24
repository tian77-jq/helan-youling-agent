const {responseModeRouter}=require('../utils/response-mode-router')
const {parseTouristContext}=require('../utils/tourist-context-parser')
const {responseBehaviorRouter}=require('../utils/response-behavior-router')
const {format}=require('../utils/response-formatter')
const {styleFor}=require('../utils/response-style')
const detector=require('./mechanical-response-detector')
const inputs=['贺兰山岩画有什么值得了解和注意的？','明天带父母银川一天怎么玩？','宁夏有什么美食？','第一次去宁夏需要注意什么？','西夏陵适合老人吗？','宁夏怎么玩？','西夏陵讲个故事','第一次来宁夏，不喜欢爬山怎么玩？','八宝茶适合什么时候喝？','推荐几个适合摄影的地方','沙坡头值得去吗？','带7岁孩子去宁夏怎么玩？','我只有半天在银川，想看历史','预算500元想吃宁夏美食','宁夏有哪些自然体验？','父母不想走太多路怎么安排','想了解贺兰山岩画','宁夏怎么样？','银川值得去吗？','我想了解一下宁夏']
const results=inputs.map(input=>{const routing=responseModeRouter(input,false);const context=parseTouristContext(input);const behavior=responseBehaviorRouter(routing,context);const formatted=format(routing,{answer:null},behavior);const response=formatted.text||`[RUNTIME_CLOUD_AI_RESPONSE_REQUIRED:${formatted.format}]`;const mechanical=detector.detect(response);return {input,intent:routing.intent,context,behavior:behavior.behavior,response,mechanical_phrases:mechanical.hits,result:mechanical.pass?'PASS':'FAIL',runtime:'ROUTING_AND_FORMATTER_ONLY'}})
const pass=results.filter(item=>item.result==='PASS').length
console.log(JSON.stringify({status:pass===results.length?'STATIC_PASS':'FAIL',runtimeModelExecuted:false,pass,total:results.length,results},null,2))
if(pass!==results.length)process.exitCode=1
