function parseTouristContext(text=''){
  const value=String(text).trim()
  const dayMatch=value.match(/(\d+)\s*(天|日)/)
  const ageMatch=value.match(/(\d+)\s*岁/)
  const budgetMatch=value.match(/(?:预算|花费|人均)[^\d]{0,8}(\d+)/)
  const places=[]
  ;[['银川','银川'],['中卫','中卫'],['吴忠','吴忠'],['石嘴山','石嘴山'],['西夏陵','西夏陵'],['贺兰山岩画','贺兰山岩画'],['沙坡头','沙坡头'],['镇北堡','镇北堡'],['水洞沟','水洞沟'],['沙湖','沙湖']].forEach(([key,label])=>{if(value.includes(key))places.push(label)})
  const companions=[]
  if(/父母|老人|长辈/.test(value))companions.push('parents')
  if(/孩子|儿童|亲子|小朋友/.test(value))companions.push('children')
  if(/情侣|对象|两个人/.test(value))companions.push('couple')
  if(/朋友|同学/.test(value))companions.push('friends')
  const interests=[]
  if(/历史|文化|西夏|岩画|博物馆/.test(value))interests.push('history_culture')
  if(/自然|生态|山|沙漠|黄河|摄影/.test(value))interests.push('nature_ecology')
  if(/美食|吃|羊肉|八宝茶|枸杞/.test(value))interests.push('food')
  const constraints=[]
  if(/不喜欢爬山|不爬山|少走|不想走|轻松|不能走太多/.test(value))constraints.push('low_walking')
  if(/不喜欢|不要|避免/.test(value))constraints.push('preference_avoidance')
  if(/第一次|初次/.test(value))constraints.push('first_visit')
  return {time:/明天/.test(value)?'明天':/半天/.test(value)?'半天':/一天/.test(value)?'一天':dayMatch?`${dayMatch[1]}天`:null,city:places.find(x=>['银川','中卫','吴忠','石嘴山'].includes(x))||null,places,companions,age:ageMatch?Number(ageMatch[1]):null,interests,budget:budgetMatch?Number(budgetMatch[1]):null,constraints,raw:value}
}
module.exports={parseTouristContext}
