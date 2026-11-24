const {attractions,agents}=require('../../knowledge/index')
const contentReview={source:'项目宁夏知识库与景区资料',reviewStatus:'SOURCE_VERIFIED',reviewedBy:null,updatedAt:'2026-08-19'}

const levels=[
  {id:1,title:'识宁夏',subtitle:'先从景区、生态与城市记忆开始',agent:'rock-goat',badge:'helan-explorer',badgeName:'贺兰山探索者',tasks:[
    {id:'l1-1',type:'choice',prompt:'你想向第一次来宁夏的游客介绍贺兰山岩画，最稳妥的切入是什么？',options:['一处记录古代生活与环境记忆的文化遗产','一座可以保证看到野生动物的动物园','一个有固定演出时间的夜游项目'],answer:0,evidenceIds:['helan-rock-painting'],explain:'知识库将贺兰山岩画描述为了解古代先民生活、信仰与环境记忆的入口。'},
    {id:'l1-2',type:'choice',prompt:'哪一个目的地最适合用“沙漠、黄河与绿洲在同一处相遇”来认识？',options:['沙坡头','宁夏博物馆','镇北堡西部影城'],answer:0,evidenceIds:['shapotou'],explain:'沙坡头的知识库事实强调沙漠、黄河与绿洲景观的组合。'},
    {id:'l1-3',type:'choice',prompt:'如果游客想在室内集中了解宁夏历史与民族文化，优先推荐哪里？',options:['宁夏博物馆','贺兰山国家森林公园','沙湖'],answer:0,evidenceIds:['ningxia-museum'],explain:'宁夏博物馆适合在室内集中了解宁夏历史、民族文化与区域发展脉络。'}]},
  {id:2,title:'解文脉',subtitle:'从事实走向原因与文化意义',agent:'sand-fox',badge:'xixia-interpreter',badgeName:'西夏文化解读者',tasks:[
    {id:'l2-1',type:'choice',prompt:'为什么西夏陵适合成为理解西夏文明的入口？',options:['因为它连接了西夏历史文化与可观察的遗址空间','因为这里一定能看到所有西夏文物原件','因为它是宁夏唯一的历史景区'],answer:0,evidenceIds:['xixia-tombs'],explain:'稳妥的文化表达应把西夏陵作为西夏历史文化的重要遗址来理解，避免扩大为“唯一”或未经证实的断言。'},
    {id:'l2-2',type:'choice',prompt:'向游客解释黄河大峡谷时，哪种说法更接近文化转译？',options:['从峡谷与水利景观理解黄河如何塑造宁夏','只强调拍照好看，不解释地方关系','把所有黄河传说都当作已证实历史'],answer:0,evidenceIds:['yellow-river-canyon'],explain:'知识库支持从峡谷与水利景观理解黄河对宁夏的塑造。'},
    {id:'l2-3',type:'choice',prompt:'介绍八宝茶时，最适合补充哪一层地方生活文化？',options:['它常见于宁夏待客与休闲饮茶场景','它一定源自某一位历史人物的发明','它可以替代所有宁夏地方饮食'],answer:0,evidenceIds:['eight-treasure-tea'],explain:'八宝茶的知识库事实支持“待客与休闲饮茶场景”，不支持未经来源的发明故事。'}]},
  {id:3,title:'当导游',subtitle:'把文化理解变成真实的游客方案',agent:'camel',badge:'ningxia-guide',badgeName:'宁夏旅行推荐官',tasks:[
    {id:'l3-1',type:'choice',prompt:'游客只有银川半天、喜欢历史且不想长距离步行，你会怎样安排？',options:['优先市区室内文化点位，并预留交通与休息时间','安排沙坡头与沙湖跨城连跑','只推荐最热门的地方，不询问体力'],answer:0,evidenceIds:['ningxia-museum'],explain:'好的导游建议要匹配时间、兴趣与体力；宁夏博物馆是知识库中适合市区室内文化体验的点位。'},
    {id:'l3-2',type:'choice',prompt:'带老人和孩子去水洞沟，哪种建议更负责任？',options:['景区单独预留半天，并根据体力减少其他点位','一天塞入多个跨城景点，保证“看得多”','承诺所有内部项目都适合任何年龄'],answer:0,evidenceIds:['shuidonggou'],explain:'知识库提示水洞沟内部体验较多、游览距离较长，应为其单独预留半天并减少其他点位。'},
    {id:'l3-3',type:'open',prompt:'请用一句话为一位第一次来宁夏的游客推荐一顿地方美食，并说明理由。',answerKey:['宁夏','美食','味道','地方','手抓羊肉','八宝茶','羊肉'],evidenceIds:['hand-grabbed-lamb','eight-treasure-tea'],explain:'先说清楚食物、地方与体验理由，再避免编造价格、排名或历史来源。'}]},
  {id:4,title:'传世界',subtitle:'把宁夏文化讲给不同语言的游客',agent:'sand-fox',badge:'culture-translator',badgeName:'文化转译者',tasks:[
    {id:'l4-1',type:'open',prompt:'请用中文向外国游客介绍西夏陵，不要只说“很漂亮”，而要说清它为什么值得理解。',answerKey:['西夏','历史','文明','遗址','文化'],evidenceIds:['xixia-tombs'],explain:'文化转译要把“西夏陵”与西夏历史文化、遗址体验和理解入口联系起来。'},
    {id:'l4-2',type:'choice',prompt:'把“塞上江南”讲给外国游客时，更好的方式是什么？',options:['结合宁夏的地理景观与生活文化解释其含义','直接翻译成一个英文单词并结束','说成宁夏所有地方永远都是江南气候'],answer:0,evidenceIds:['yellow-river-canyon','shahu'],explain:'文化转译需要补充地理和生活语境，而不是逐字翻译或扩大成绝对事实。'},
    {id:'l4-3',type:'open',prompt:'请用 English 或中文写一句让外国游客愿意了解贺兰山岩画的话。',answerKey:['岩画','贺兰','Helan','rock'],evidenceIds:['helan-rock-painting'],explain:'表达可以有个人风格，但应让游客知道这是贺兰山岩画，并指向古代生活、信仰或环境记忆。'}]}
]

const drama={id:'xixia-fox-01',title:'沙狐带你走进西夏陵',badge:'xixia-interpreter',duration:'约30秒',evidenceIds:['xixia-tombs'],scenes:[
  {id:'s1',character:'🦊 沙狐',dialogue:'如果一位外国游客问：西夏陵为什么值得看？你会先讲什么？',choices:[{id:'a',text:'只说这里适合拍照',next:'s2a'},{id:'b',text:'从西夏历史文化与遗址空间讲起',next:'s2b'}]},
  {id:'s2a',character:'🦊 沙狐',dialogue:'照片可以留下瞬间，但文化需要一个入口。我们换个角度看看。',choices:[{id:'back',text:'了解西夏陵的文化入口',next:'s2b'}]},
  {id:'s2b',character:'🦊 沙狐',dialogue:'西夏陵是理解西夏历史文化的重要遗址。把事实讲清楚，游客才有机会真正看见宁夏。',choices:[{id:'end',text:'完成这段文化对话',next:'end'}]}
]}

function getLevel(id){return levels.find(level=>level.id===Number(id))||levels[0]}
function getTask(levelId,index){return getLevel(levelId).tasks[index]}
function getAgent(id){return agents.find(agent=>agent.id===id)||agents[0]}
function scoreOpen(task,text){const answer=String(text||'').trim();const matched=task.answerKey.filter(key=>answer.toLowerCase().includes(key.toLowerCase())).length;const unsupported=/(第一|唯一|全部|保证|一定|排名|冠军|发明|始终|永远)/.test(answer)?['请避免使用未经证实的绝对化表述。']:[];const knowledge=Math.min(30,matched*10);const interpretation=Math.min(25,matched>=2?20:matched?12:5);const visitorFit=Math.min(20,answer.length>=12?16:8);const expression=Math.min(25,answer.length>=20?20:answer.length>=8?13:5);return {score:knowledge+interpretation+visitorFit+expression,dimensions:{knowledge,interpretation,visitorFit,expression},feedback:matched?'抓住了知识库支持的文化关键词，可以再把游客为什么值得了解说得更具体。':'先把知识对象和文化意义说清楚，再加上游客视角。',unsupportedClaims:unsupported}}
module.exports={levels,drama,contentReview,getLevel,getTask,getAgent,scoreOpen}
