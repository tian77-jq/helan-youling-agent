const manager=require('../utils/conversation-manager')
const {responseModeRouter}=require('../utils/response-mode-router')
const character=require('../services/character-router')
const turns=[
  ['贺兰山有哪些特色动物？','ECOLOGY_QA','yanYang'],['宁夏有哪些特色美食？','FOOD_QA','shaHu'],['帮我规划三天文化旅行','TRIP_PLANNING','shaHu'],['第二天不要去中卫','ADJUST_TRIP','shaHu'],['西夏陵为什么重要？','CULTURE_QA','luoTuo'],['腾讯混元模型厉不厉害？','META_SYSTEM','shaHu'],['回到刚才路线，第二天安排轻松一点','ADJUST_TRIP','shaHu'],['岩羊有什么特点？','ECOLOGY_QA','yanYang'],['吴忠早茶值得吃什么？','FOOD_QA','shaHu'],['人生如梦下一句是什么？','OUT_OF_DOMAIN','shaHu'],['贺兰山岩画为什么值得去？','CULTURE_QA','luoTuo'],['两天吧','ADJUST_TRIP','shaHu'],['银川晚上去哪玩？','NIGHT_TRAVEL','shaHu'],['宁夏有哪些非遗？','CULTURE_QA','luoTuo'],['这个小程序用什么AI？','META_SYSTEM','shaHu'],['沙湖适合亲子吗？','CULTURE_QA','shaHu'],['预算500元两个人去贺兰山','TRIP_PLANNING','shaHu'],['少走一点','ADJUST_TRIP','shaHu'],['宁夏和丝绸之路有什么关系？','CULTURE_QA','luoTuo'],['再说说贺兰山生态','ECOLOGY_QA','yanYang']
]
turns.push(
  ['蓝马鸡生活在什么环境？','ECOLOGY_QA','yanYang'],['黄河文化和宁夏有什么关系？','CULTURE_QA','luoTuo'],['怀远夜市有什么推荐？','FOOD_QA','shaHu'],['改成两天','ADJUST_TRIP','shaHu'],['水洞沟有什么看点？','CULTURE_QA','luoTuo'],
  ['这个系统为什么会给出不同角色？','META_SYSTEM','shaHu'],['写一首关于月亮的诗','OUT_OF_DOMAIN','shaHu'],['带父母去宁夏两天怎么玩？','TRIP_PLANNING','shaHu'],['第二天安排轻松一点','ADJUST_TRIP','shaHu'],['金雕在贺兰山常见吗？','ECOLOGY_QA','yanYang'],
  ['宁夏博物馆有什么值得看？','CULTURE_QA','luoTuo'],['八宝茶有什么特点？','FOOD_QA','shaHu'],['从银川去沙坡头怎么走？','GENERAL_DISCOVERY','shaHu'],['腾讯混元能做什么？','META_SYSTEM','shaHu'],['今天股票怎么样？','OUT_OF_DOMAIN','shaHu'],
  ['再说说贺兰山生态','ECOLOGY_QA','yanYang'],['中阿交流在宁夏有哪些体现？','CULTURE_QA','luoTuo'],['帮我安排两天宁夏亲子游','TRIP_PLANNING','shaHu'],['预算降低一点','ADJUST_TRIP','shaHu'],['晚上想去览山公园','TRIP_PLANNING','shaHu'],
  ['兔狲适应什么环境？','ECOLOGY_QA','yanYang'],['西夏文化有什么特点？','CULTURE_QA','luoTuo'],['吴忠早茶值得吃什么？','FOOD_QA','shaHu'],['回到刚才路线，别去中卫','ADJUST_TRIP','shaHu'],['我就想白天去览山公园','CLARIFICATION_REQUIRED','shaHu'],
  ['荒漠猫能近距离接触吗？','ECOLOGY_QA','yanYang'],['宁夏有哪些非遗？','CULTURE_QA','luoTuo'],['中卫蒿子面有什么特色？','FOOD_QA','shaHu'],['再规划三天宁夏文化旅行','TRIP_PLANNING','shaHu'],['第三天不要太累','ADJUST_TRIP','shaHu']
)
const session=manager.startNewSession();let hasPlan=false
const rows=turns.map(([input,intent,expectedCharacter])=>{const route=responseModeRouter(input,hasPlan);if(route.intent==='TRIP_PLANNING')hasPlan=true;manager.append(input,'ok',session.sessionId);const latest=manager.contextForModel(session.sessionId,1).recent.filter(item=>item.role==='user').slice(-1)[0];const actualCharacter=character.select(input);const expected= input.includes('岩画')?'yanYang':expectedCharacter;return {input,intent:route.intent,character:actualCharacter,pass:route.intent===intent&&actualCharacter===expected&&latest&&latest.content===input}})
const failed=rows.filter(row=>!row.pass)
console.log(JSON.stringify({CONVERSATION_CONTEXT_STRESS:failed.length?'FAIL':'PASS',turns:rows.length,failed},null,2))
if(failed.length)process.exitCode=1
