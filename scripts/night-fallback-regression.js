const {nightFacts,factsForQuestion}=require('../utils/ask-pet-ai')
const cases=[
  ['今晚去哪看夜景','night'],['银川晚上去哪玩','night'],['中卫今晚看星星去哪','night'],
  ['沙坡头今晚有什么实时活动','realtime'],['今晚从日落看到星星怎么安排','night']
]
const failures=[]
cases.forEach(([question,type])=>{
  const facts=nightFacts(question)
  if(type==='realtime'&&facts.length)failures.push(`${question}: realtime must remain unverified`)
  if(type==='night'&&!facts.length)failures.push(`${question}: stable night facts are empty`)
})
const yinchuan=factsForQuestion('银川晚上去哪玩',null,'night_recommendation')
const zhongwei=factsForQuestion('中卫今晚看星星去哪',null,'night_recommendation')
if(!yinchuan.length||!zhongwei.length)failures.push('city-specific night candidates missing')
if(failures.length){console.error(JSON.stringify({pass:false,failures},null,2));process.exit(1)}
console.log(JSON.stringify({pass:true,cases:cases.length,yinchuan:yinchuan.map(item=>item.id),zhongwei:zhongwei.map(item=>item.id)}))
