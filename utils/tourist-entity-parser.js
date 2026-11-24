const {attractions}=require('../knowledge/index')

const CITY_ALIASES={银川:'银川',中卫:'中卫',吴忠:'吴忠',青铜峡:'吴忠',石嘴山:'石嘴山',固原:'固原',灵武:'灵武'}
const COMPANION_RULES=[
  {value:'parents',pattern:/父母|爸妈|老人|长辈|老年人/},
  {value:'children',pattern:/孩子|儿童|小朋友|亲子/},
  {value:'students',pattern:/学生|同学/},
  {value:'couple',pattern:/情侣|对象|两个人|二人/},
  {value:'friends',pattern:/朋友|闺蜜|同事/}
]

// 宁夏目的地不是一个泛化的“自然/文化”二分法。把本地真实体验拆开，
// 既用于追问，也作为混元的结构化事实输入，避免模型凭空替用户选博物馆。
const EXPERIENCE_RULES=[
  {value:'entertainment',label:'游乐设施',pattern:/游乐|娱乐设施|娱乐项目|游玩项目|滑沙|索道|漂流|水上项目|蹦极|沙漠项目|亲子乐园/},
  {value:'road_trip',label:'公路自驾',pattern:/自驾|开车|公路|66号公路|公路旅行|越野/},
  {value:'desert',label:'沙漠体验',pattern:/沙漠|腾格里|沙丘|骑骆驼|骆驼|沙地/},
  {value:'water_wetland',label:'湖泊与黄河',pattern:/湖|黄河|湿地|候鸟|水景|漂流/},
  {value:'sunset_night',label:'落日与夜游',pattern:/日落|落日|夕阳|夜游|夜景|晚上|傍晚/},
  {value:'history_culture',label:'历史文化',pattern:/历史|文化|西夏|岩画|博物馆|遗址|石窟|古渡/},
  {value:'food_wine',label:'宁夏美食与酒庄',pattern:/美食|吃|羊肉|八宝茶|枸杞|蒿子面|搓面|酒庄|葡萄酒/},
  {value:'nature_ecology',label:'自然生态',pattern:/自然|生态|森林|山地|丹霞|盐湖|观鸟|自然观察/},
  {value:'photography',label:'摄影出片',pattern:/摄影|拍照|出片|打卡|风景照/},
  {value:'slow_city',label:'轻松城市漫游',pattern:/逛逛|慢游|闲逛|城市漫步|不赶时间|轻松/}
]

function findDestinations(text){
  const value=String(text||'')
  return attractions.map(item=>{
    const official=item.name&&item.name['zh-CN']
    const aliases={
      'helan-mountain':['贺兰山','贺兰山森林公园'],
      'helan-rock-painting':['岩画'],
      zhenbeibao:['镇北堡','西部影城','西部影视城'],
      'yellow-river-canyon':['黄河大峡谷','青铜峡'],
      'lanshan-park':['览山'],
      'xige-winery':['西鸽酒庄','酒庄','贺兰山东麓酒庄']
    }[item.id]||[]
    if(item.id==='helan-mountain'&&/岩画/.test(value))aliases.length=0
    const terms=[official].concat(aliases).filter(Boolean)
    const hit=terms.map(term=>({term,index:value.indexOf(term)})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index)[0]
    return hit?{id:item.id,name:official,city:item.city,index:hit.index,matchedBy:hit.term}:null
  }).filter(Boolean).sort((a,b)=>a.index-b.index)
}

function parseTouristEntities(text=''){
  const value=String(text||'').trim()
  const destinations=findDestinations(value)
  const cities=Object.keys(CITY_ALIASES).filter(city=>value.includes(city)).map(city=>CITY_ALIASES[city]).filter((city,index,array)=>array.indexOf(city)===index)
  const companions=COMPANION_RULES.filter(rule=>rule.pattern.test(value)).map(rule=>rule.value)
  const budgetMatch=value.match(/(?:预算|预算控制在|最多花费|花费|人均)[^\d]{0,8}(\d+)/)||value.match(/(\d+)\s*元/)
  const dayMatch=value.match(/(\d+)\s*(天|日)/)
  const chineseDay={'一天':1,'两天':2,'三天':3,'四天':4,'五天':5}
  const constraints=[]
  if(/少走|不想走|不能走|不想太累|轻松|少步行/.test(value))constraints.push('low_walking')
  if(/自驾|开车/.test(value))constraints.push('self_drive')
  if(/公交|公共交通|地铁|换乘/.test(value))constraints.push('public_transport')
  if(/第一次|初次/.test(value))constraints.push('first_visit')
  const preferences=[]
  if(/历史|文化|西夏|岩画|博物馆/.test(value))preferences.push('history_culture')
  if(/自然|生态|山|沙漠|黄河|摄影|拍照/.test(value))preferences.push('nature_ecology')
  if(/美食|吃|羊肉|八宝茶|枸杞/.test(value))preferences.push('food')
  // Location slots win over keyword matching. “湖北襄阳” contains the
  // character 湖, but it is not a water/wetland preference.
  const locationMasked=value.replace(/(?:从|来自|出发地(?:是)?)[^，。；,;]{0,8}?(?:湖北襄阳|襄阳|北京|上海|西安|兰州|银川|中卫|吴忠|石嘴山|固原)/g,'')
  const experiences=EXPERIENCE_RULES.filter(rule=>rule.pattern.test(locationMasked)).map(rule=>rule.value)
  const experienceLabels=EXPERIENCE_RULES.filter(rule=>rule.pattern.test(locationMasked)).map(rule=>rule.label)
  const originMatch=value.match(/(?:从|来自|出发地(?:是)?)[^，。；,;]{0,8}?(湖北襄阳|襄阳|北京|上海|西安|兰州|银川|中卫|吴忠|石嘴山|固原)/)
  const originCity=originMatch?originMatch[1]:null
  const arrivalMatch=value.match(/(?:坐飞机|乘飞机|飞机)?(?:到达|到|抵达)(银川|中卫|吴忠|石嘴山|固原|宁夏)/)
  const arrivalCity=arrivalMatch?arrivalMatch[1]:(/到宁夏|来宁夏|抵达宁夏/.test(value)?'宁夏':null)
  const baseMatch=value.match(/(?:当天|当日|开始|主要)(?:去|在|到)?(银川|中卫|吴忠|石嘴山|固原)(?:玩|游玩|活动|开始)?/)
  const baseCity=baseMatch?baseMatch[1]:null
  const repeatVisitorHint=/第\s*[二三四五六七八九十\d]+\s*次来|再次来|重游/.test(value)
  return {
    raw:value,
    destinations,
    destinationIds:destinations.map(item=>item.id),
    cities,
    originCity,
    arrivalCity,
    baseCity,
    destinationScope:arrivalCity||((cities.length===1)?cities[0]:null)||(/宁夏/.test(value)?'宁夏':null),
    repeatVisitorHint,
    companions,
    budget:budgetMatch?Number(budgetMatch[1]):null,
    days:dayMatch?Number(dayMatch[1]):Object.keys(chineseDay).find(key=>value.includes(key))?chineseDay[Object.keys(chineseDay).find(key=>value.includes(key))]:null,
    constraints,
    preferences,
    experiences,
    experienceLabels,
    explicitInterest:experiences.length>0||preferences.length>0,
    // 供追问器使用：只有用户实际说过的体验才会进入候选，不做默认偏好。
    intentSignals:{destination:destinations.map(item=>item.name),city:cities,companions,experiences,preferences,constraints},
    explicit:destinations.length>0||cities.length>0||companions.length>0||Boolean(budgetMatch)||Boolean(dayMatch)||Object.keys(chineseDay).some(key=>value.includes(key))||constraints.length>0||experiences.length>0
  }
}

module.exports={parseTouristEntities,findDestinations,CITY_ALIASES,EXPERIENCE_RULES}
