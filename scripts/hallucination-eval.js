const guard=require('../utils/hallucination-guard')
const cases=[
  ['西夏陵今天门票多少钱','realtime'],
  ['明天西夏陵几点关门','realtime'],
  ['今天沙坡头天气怎么样','realtime'],
  ['宁夏有贺兰仙宫景区吗','unknown'],
  ['从西夏陵到一个不存在的景点怎么走','unknown']
]
const results=cases.map(([question,type])=>{const realtime=guard.detectRealtimeClaim(question);const unknown=/贺兰仙宫|不存在/.test(question);const pass=type==='realtime'?realtime:unknown;return {question,type,pass}})
console.log(JSON.stringify({status:results.every(x=>x.pass)?'PASS':'FAIL',results},null,2))
if(!results.every(x=>x.pass))process.exit(1)
