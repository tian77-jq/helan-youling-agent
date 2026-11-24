const {responseModeRouter}=require('../utils/response-mode-router')
const cases=[
  ['贺兰山有哪些特色动物？','ECOLOGY_QA','ecology'],['岩羊有什么特点？','ECOLOGY_QA','ecology'],['贺兰山为什么重要？','GENERAL_DISCOVERY','ecology'],
  ['西夏陵为什么重要？','CULTURE_QA','culture'],['西夏文化有什么特点？','CULTURE_QA','culture'],['贺兰山岩画为什么值得去？','CULTURE_QA','culture'],
  ['宁夏有哪些特色美食？','FOOD_QA','travel'],['吴忠早茶值得吃什么？','FOOD_QA','travel'],['怀远夜市有什么推荐？','FOOD_QA','travel'],
  ['帮我规划三天宁夏文化旅行','TRIP_PLANNING','travel'],['两天带父母去银川怎么玩？','TRIP_PLANNING','travel'],['预算500元两个人去贺兰山','TRIP_PLANNING_NEEDS_DURATION','travel'],
  ['第二天不要去中卫','ADJUST_TRIP','travel',true],['两天吧','ADJUST_TRIP','travel',true],['回到刚才路线，第二天轻松一点','ADJUST_TRIP','travel',true],
  ['腾讯混元模型厉不厉害？','META_SYSTEM','meta'],['你用的是什么模型？','META_SYSTEM','meta'],['这个小程序用什么AI？','META_SYSTEM','meta'],
  ['人生如梦下一句是什么？','OUT_OF_DOMAIN','boundary'],['今天股票怎么样？','OUT_OF_DOMAIN','boundary'],['帮我做一道数学题','OUT_OF_DOMAIN','boundary'],
  ['宁夏有什么好玩的？','GENERAL_DISCOVERY','travel'],['银川晚上去哪玩？','NIGHT_TRAVEL','travel'],['宁夏有哪些非遗？','CULTURE_QA','culture'],['览山公园什么时候去最好？','GENERAL_DISCOVERY','travel'],
  ['蓝马鸡生活在什么环境？','ECOLOGY_QA','ecology'],['金雕在贺兰山常见吗？','ECOLOGY_QA','ecology'],['黄河文化和宁夏有什么关系？','CULTURE_QA','culture'],['中阿交流在宁夏有哪些体现？','CULTURE_QA','culture'],['水洞沟有什么看点？','CULTURE_QA','culture'],
  ['八宝茶有什么特点？','FOOD_QA','travel'],['帮我安排两天宁夏亲子游','TRIP_PLANNING','travel'],['预算降低一点','ADJUST_TRIP','travel',true],['银川夜游去哪里？','NIGHT_TRAVEL','travel'],['从银川去沙坡头怎么走？','GENERAL_DISCOVERY','travel'],
  ['那蓝马鸡呢？','ECOLOGY_QA','ecology'],['这个系统为什么会给出不同角色？','META_SYSTEM','meta'],['写一首关于月亮的诗','OUT_OF_DOMAIN','boundary'],['宁夏博物馆有什么值得看？','CULTURE_QA','culture'],['中卫有哪些特色美食？','FOOD_QA','travel']
]
const rows=cases.map(([input,intent,route,hasPlan])=>{const actual=responseModeRouter(input,Boolean(hasPlan));return {input,expected:{intent,route},actual:{intent:actual.intent,route:actual.route},pass:actual.intent===intent&&actual.route===route}})
const failed=rows.filter(row=>!row.pass)
console.log(JSON.stringify({INTENT_ROUTER_REGRESSION:`${rows.length-failed.length}/${rows.length} PASS`,status:failed.length?'FAIL':'PASS',rows},null,2))
if(failed.length)process.exitCode=1
