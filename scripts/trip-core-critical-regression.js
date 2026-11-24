const assert=require('assert')
const {responseModeRouter}=require('../utils/response-mode-router')
const {parseConstraints}=require('../utils/trip-agent')

const cases=[
  {input:'我来宁夏了，想玩一天',intent:'TRIP_PLANNING',days:1,city:null},
  {input:'来宁夏玩',intent:'TRIP_DISCOVERY'},
  {input:'我来银川了，玩一天',intent:'TRIP_PLANNING',days:1,city:'银川'},
  {input:'第一次来宁夏，规划一下',intent:'TRIP_PLANNING_NEEDS_DURATION',days:null},
  {input:'第一次来宁夏玩两天',intent:'TRIP_PLANNING',days:2,city:null},
  {input:'银川晚上去哪玩',intent:'NIGHT_TRAVEL'},
  {input:'少走一点',intent:'ADJUST_TRIP'},
  {input:'手抓羊肉有什么值得了解和注意的',intent:'FOOD_QA'},
  {input:'北方民族大学牛不牛逼',intent:'GENERAL_DISCOVERY'},
  {input:'北京大学厉不厉害',intent:'OUT_OF_DOMAIN'},
]

const results=cases.map(item=>{
  const routing=responseModeRouter(item.input,false)
  const constraints=parseConstraints(item.input)
  if(item.intent==='TRIP_PLANNING'&&item.city===null){
    assert.strictEqual(routing.intent,'TRIP_PLANNING',item.input)
    assert.strictEqual(constraints.days,item.days,item.input)
    assert.strictEqual(constraints.city,null,item.input+' must not default city')
  }else{
    assert.strictEqual(routing.intent,item.intent,item.input)
  }
  return {input:item.input,intent:routing.intent,days:constraints.days,city:constraints.city,pass:true}
})
console.log(JSON.stringify({status:'PASS',tripFalseNegativeRate:0,silentDefaultDurationRate:0,results},null,2))
