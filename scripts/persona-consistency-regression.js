const router=require('../services/character-router')
const avatar=require('../services/digital-avatar-service')
const cases=[
  ['贺兰山有哪些动物？','yanYang'],['岩羊为什么能爬悬崖？','yanYang'],['贺兰山岩画值得看吗？','yanYang'],['贺兰山有什么植物？','yanYang'],['贺兰山生态怎么样？','yanYang'],
  ['贺兰山金雕怎么保护？','yanYang'],['兔狲生活在哪里？','yanYang'],['贺兰山地质有什么特点？','yanYang'],['西夏陵为什么重要？','luoTuo'],['西夏文字有什么特点？','luoTuo'],
  ['宁夏与丝绸之路什么关系？','luoTuo'],['黄河文化怎么理解？','luoTuo'],['西夏王朝有什么特点？','luoTuo'],['宁夏有哪些非遗？','luoTuo'],['博物馆值得看什么？','luoTuo'],
  ['银川晚上去哪玩？','shaHu'],['怀远夜市有什么好吃的？','shaHu'],['第一次来宁夏怎么玩？','shaHu'],['览山公园几点去好？','shaHu'],['宁夏有什么美食？','shaHu'],
  ['宁夏景点怎么选？','shaHu'],['银川交通方便吗？','shaHu'],['宁夏住哪里方便？','shaHu'],['沙坡头怎么安排？','shaHu'],['宁夏适合年轻人玩吗？','shaHu'],
  ['宁夏特产买什么？','shaHu'],['夜游银川怎么走？','shaHu'],['银川有什么景点推荐？','shaHu'],['八宝茶哪里好喝？','shaHu'],['宁夏两天怎么玩？','shaHu']
]
const results=cases.map(([question,expected])=>{const selected=router.select(question);const prepared=avatar.prepare({answer:'测试回答'},question);const pass=selected===expected&&prepared.resolvedCharacter===expected&&prepared.character===expected&&prepared.voiceCharacter===expected&&prepared.uiCharacter===expected;return {question,expected,selected,prepared:prepared.resolvedCharacter,pass}})
const passed=results.filter(x=>x.pass).length
console.log(JSON.stringify({status:passed===cases.length?'PASS':'FAIL',PERSONA_CONSISTENCY_TEST:`${passed}/${cases.length} PASS`,results},null,2))
process.exitCode=passed===cases.length?0:1
