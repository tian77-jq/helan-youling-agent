const {planTrip}=require('../utils/trip-agent')

const findAttraction=(plan,id)=>plan.days.flatMap(day=>day.items).find(item=>item.type==='attraction'&&item.id===id)
const cases=[
  ['默认览山公园安排傍晚','安排一天去览山公园看落日',plan=>{const item=findAttraction(plan,'lanshan-park');return item&&item.time>='18:00'}],
  ['用户指定白天优先','我就想白天去览山公园，安排一天',plan=>{const item=findAttraction(plan,'lanshan-park');return item&&item.time<'18:00'}],
  ['用户指定晚上优先','晚上想去览山公园，安排一天',plan=>{const item=findAttraction(plan,'lanshan-park');return item&&item.time>='18:00'}],
  ['博物馆不排夜间','安排一天去宁夏博物馆',plan=>{const item=findAttraction(plan,'ningxia-museum');return item&&item.time<'18:00'}],
  ['沙坡头不排夜间','安排一天去沙坡头',plan=>{const item=findAttraction(plan,'shapotou');return item&&item.time<'18:00'}]
]
const rows=cases.map(([name,input,assert])=>{const plan=planTrip(input,{locale:'zh-CN'});return {name,pass:Boolean(assert(plan))}})
const failed=rows.filter(row=>!row.pass)
console.log(JSON.stringify({TIME_SLOT_REASONING:`${rows.length-failed.length}/${rows.length} PASS`,status:failed.length?'FAIL':'PASS',rows},null,2))
if(failed.length)process.exitCode=1
