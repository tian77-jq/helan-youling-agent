const {questionDomain,domainMismatch}=require('../utils/ask-pet-ai')

const cases=[
  ['贺兰山有哪些特色动物？','ECOLOGY','岩羊、蓝马鸡和金雕等动物体现了贺兰山山地生态的多样性。'],
  ['贺兰山为什么重要？','ECOLOGY','贺兰山是宁夏重要的生态屏障，也提供了山地自然观察场景。'],
  ['岩羊有什么特点？','ECOLOGY','岩羊适应陡峭岩壁环境，是典型的山地野生动物。'],
  ['西夏陵为什么值得了解？','HISTORY_CULTURE','西夏陵保存了认识西夏历史和陵寝文化的重要线索。'],
  ['西夏文化有什么特点？','HISTORY_CULTURE','西夏文化体现了多民族交流中的文字、建筑与制度遗存。'],
  ['宁夏和丝绸之路有什么关系？','HISTORY_CULTURE','宁夏处在历史文化交流通道上，与丝路文化联系紧密。'],
  ['银川晚上去哪玩？','TRAVEL','可以选择城市夜游与公共文化空间，出行前留意开放信息。'],
  ['第一次来宁夏怎么玩三天？','TRAVEL','三天行程可按银川文化、贺兰山生态和中卫沙漠分区安排。'],
  ['览山公园什么时候去最好？','TRAVEL','傍晚光线柔和，适合在览山公园看城市落日；以现场开放为准。'],
  ['宁夏有哪些特色美食？','FOOD','手抓羊肉、八宝茶和地方风味面食都是宁夏美食体验。'],
  ['吴忠早茶值得吃什么？','FOOD','吴忠早茶可尝试八宝茶和地方点心，按个人口味选择。'],
  ['怀远夜市有什么推荐？','FOOD','怀远夜市适合体验宁夏小吃和夜间市集氛围。'],
  ['贺兰山岩画为什么值得去？','HISTORY_CULTURE','贺兰山岩画保留了史前人群表达生活与信仰的文化线索。'],
  ['宁夏有哪些非遗？','HISTORY_CULTURE','宁夏非遗承载了多民族生活技艺与地方文化记忆。'],
  ['为什么宁夏有丰富的多元文化？','HISTORY_CULTURE','宁夏多元文化与黄河文明、丝路交流和多民族交往有关。'],
  ['蓝马鸡生活在什么环境？','ECOLOGY','蓝马鸡适应山地林缘环境，观察时应保持距离。'],
  ['金雕对贺兰山生态有什么意义？','ECOLOGY','金雕是山地生态系统中具有代表性的猛禽之一。'],
  ['荒漠猫适合近距离观察吗？','ECOLOGY','野生动物观察应保持安全距离，不干扰其自然活动。'],
  ['兔狲为什么适应干旱环境？','ECOLOGY','兔狲的生境适应与干旱、半干旱地区的自然条件有关。'],
  ['黄河文化如何影响宁夏？','HISTORY_CULTURE','黄河灌溉、渡口和沿岸聚落共同塑造了宁夏的地域文化。'],
  ['中阿交流在宁夏有哪些体现？','HISTORY_CULTURE','宁夏的多元文化体现了长期交流互鉴的历史脉络。'],
  ['宁夏博物馆有什么值得看？','HISTORY_CULTURE','宁夏博物馆可帮助理解区域历史与多民族文化。'],
  ['水洞沟为什么有文化价值？','HISTORY_CULTURE','水洞沟连接史前遗存与边塞文化线索。'],
  ['八宝茶有什么特点？','FOOD','八宝茶以茶和多种配料形成甜润、层次丰富的地方风味。'],
  ['羊肉臊子面适合什么时候吃？','FOOD','羊肉臊子面适合作为紧凑行程中的地方风味午餐。'],
  ['中卫蒿子面有什么特色？','FOOD','中卫蒿子面是具有地方记忆的传统面食。'],
  ['银川夜游去哪里比较合适？','TRAVEL','可选择城市公共空间夜游，并留意开放和返程信息。'],
  ['从银川去沙坡头怎么走？','TRAVEL','跨城前应预留交通时间并确认当天往返方式。'],
  ['带父母去宁夏怎么玩更轻松？','TRAVEL','减少点位、预留休息并优先选择体力友好的体验。'],
  ['宁夏的交通安排要注意什么？','TRAVEL','跨城出行应预留交通时间，并以当天官方信息为准。']
]

const rows=cases.map(([question,expected,answer])=>{
  const actual=questionDomain(question,'DIRECT_ANSWER')
  return {question,expected,actual,answer,pass:actual===expected&&!domainMismatch(answer,actual)}
})
const failed=rows.filter(row=>!row.pass)
console.log(JSON.stringify({ANSWER_RELEVANCE_REGRESSION:`${rows.length-failed.length}/${rows.length} PASS`,status:failed.length?'FAIL':'PASS',rows},null,2))
if(failed.length)process.exitCode=1
