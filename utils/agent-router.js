const {attractions,foods,agents}=require('../knowledge/index')

const ROUTES={ecology:{agentId:'rock-goat',keywords:['生态','自然','动物','植物','地理','贺兰山','岩羊','蓝马鸡','金雕','荒漠猫','兔狲','nature','ecology','animal','mountain']},culture:{agentId:'sand-fox',keywords:['历史','西夏','文化','民俗','文物','故事','岩画','非遗','丝路','丝绸之路','history','culture','heritage']},travel:{agentId:'camel',keywords:['路线','景区','美食','吃','预算','行程','旅行','交通','food','route','travel']}}
function routeQuestion(text=''){
  const value=String(text).toLowerCase()
  if(/不存在|未知|星际|天气|票价|开放时间|实时/.test(value))return {route:'unknown',agent:null,confidence:'guarded-unknown'}
  if(/西夏|历史|文化|民俗|文物|故事|岩画|非遗|丝绸之路|丝路/.test(value))return {route:'culture',agent:agents.find(item=>item.id==='sand-fox'),confidence:'keyword-grounded'}
  if(/生态|自然|动物|植物|地理|岩羊|蓝马鸡|金雕|荒漠猫|兔狲|湿地/.test(value))return {route:'ecology',agent:agents.find(item=>item.id==='rock-goat'),confidence:'keyword-grounded'}
  if(/少走|增加|加入|预算|路线|行程|旅行|拍照|萌宠|美食|吃|交通/.test(value))return {route:'travel',agent:agents.find(item=>item.id==='camel'),confidence:'keyword-grounded'}
  const scores=Object.keys(ROUTES).map(key=>({key,score:ROUTES[key].keywords.reduce((n,k)=>n+(value.includes(k.toLowerCase())?1:0),0)})).sort((a,b)=>b.score-a.score)
  const winner=scores[0]
  return winner.score?{route:winner.key,agent:agents.find(item=>item.id===ROUTES[winner.key].agentId),confidence:'keyword-grounded'}:{route:'unknown',agent:null,confidence:'none'}
}
function routeKnowledge(id){const item=attractions.find(x=>x.id===id)||foods.find(x=>x.id===id);return item?{route:item.category==='history'||item.category==='culture'?'culture':item.category==='nature'?'ecology':'travel',agent:agents.find(x=>x.id===item.agentId),knowledgeId:item.id}:routeQuestion('')}
module.exports={routeQuestion,routeKnowledge,ROUTES}
