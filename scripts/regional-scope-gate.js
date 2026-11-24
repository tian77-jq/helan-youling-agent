const gate=require('../utils/regional-scope-gate')
const {attractions}=require('../knowledge')
const cases=[['宁夏的生态怎么样？',0],['宁夏有哪些盐湖？',0],['中卫有哪些生态景观？',0],['陕甘宁有哪些盐湖？',1]]
const rows=cases.map(([input,cross])=>{const result=gate.filter(attractions,input);const dingbian=result.some(x=>x.id==='dingbian-salt-lake');return {input,scope:gate.queryScope(input),count:result.length,dingbian,pass:cross?gate.queryScope(input)==='CROSS_REGION':!dingbian}})
const failed=rows.filter(x=>!x.pass)
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',crossRegionEntityLeak:failed.length,rows},null,2))
if(failed.length)process.exitCode=1
