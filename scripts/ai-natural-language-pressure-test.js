const assert=require('assert')
const {parseTouristEntities}=require('../utils/tourist-entity-parser')
const trip=require('../utils/trip-agent')
const router=require('../utils/response-mode-router').responseModeRouter

const cases=[
  {input:'我要去银川然后带父母来玩，还要去沙坡头',check:e=>e.destinationIds.includes('shapotou')&&e.companions.includes('parents')},
  {input:'预算300元两个人学生，想去贺兰山和沙坡头',check:e=>e.budget===300&&e.destinationIds.includes('helan-mountain')&&e.destinationIds.includes('shapotou')&&e.companions.includes('students')},
  {input:'不想走太多路，带老人去银川',check:e=>e.companions.includes('parents')&&e.constraints.includes('low_walking')&&e.cities.includes('银川')},
  {input:'我还想去沙坡头',check:e=>e.destinationIds.includes('shapotou')},
  {input:'周末想去宁夏玩五天',check:e=>e.days===5},
  {input:'想去览山公园拍照',check:e=>e.destinationIds.includes('lanshan-park')},
  {input:'想看贺兰山岩画的历史',check:e=>e.destinationIds.includes('helan-rock-painting')},
  {input:'公共交通去银川和中卫',check:e=>e.cities.includes('银川')&&e.cities.includes('中卫')},
  {input:'带孩子去沙坡头',check:e=>e.destinationIds.includes('shapotou')&&e.companions.includes('children')},
  {input:'学生想吃宁夏美食',check:e=>e.companions.includes('students')&&e.preferences.includes('food')}
]
const rows=cases.map(item=>{const entities=parseTouristEntities(item.input);const pass=item.check(entities);return {input:item.input,pass,entities}})
const planCases=[
  {input:'规划沙坡头',requiresDuration:true},
  {input:'预算300元两个人学生，想去贺兰山和沙坡头',requiresDuration:true},
  {input:'安排一天游览览山公园，两个人，喜欢拍照',requiresDuration:false}
]
const plans=planCases.map(({input,requiresDuration})=>{const constraints=trip.parseConstraints(input);const route=router(input,false);const result=constraints.days?trip.planTrip(constraints,{locale:'zh-CN'}):null;const retained=result&&constraints.requestedStops.every(id=>result.days.flatMap(day=>day.items).some(item=>item.id===id));return {input,days:constraints.days,stops:constraints.requestedStops,pass:requiresDuration?constraints.days===null&&['TRIP_PLANNING_NEEDS_DURATION','NEED_DESTINATION_AND_DURATION'].includes(route.intent):Boolean(retained)}})
const failed=rows.filter(row=>!row.pass).concat(plans.filter(row=>!row.pass))
console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',entityCases:rows.length,planCases:plans.length,passed:rows.filter(row=>row.pass).length+plans.filter(row=>row.pass).length,failed},null,2))
if(failed.length)process.exitCode=1
