const {attractions, foods, agents} = require('../knowledge/index')
const {parseTouristEntities}=require('./tourist-entity-parser')

const SAFETY_NOTE = {
  'zh-CN':'票价、开放时间、预约、天气与交通班次可能变化，请以景区和相关部门官方最新公告为准。',
  'en-US':'Ticket prices, opening hours, reservations, weather and transport schedules may change. Check the latest official notices.',
  ar:'قد تتغير الأسعار ومواعيد الزيارة والحجوزات والطقس ومواعيد النقل. يُرجى مراجعة أحدث الإعلانات الرسمية.'
}

const COPY = {
  'zh-CN':{summary:'已根据你的时间、同行人和偏好组合路线',history:'优先安排历史文化体验',nature:'优先安排自然生态体验',food:'已把地方风味放进用餐时段',easy:'减少点位并预留休息时间',reason:'与本次偏好匹配，且按区域组合以减少折返。',meal:'用一顿地方味道补充旅途记忆。',break:'在市区休息、补水，并为下一段行程留出弹性。',day:'第',daySuffix:'天'},
  'en-US':{summary:'A route matched to your time, companions and interests',history:'History and culture are prioritized',nature:'Nature and ecology are prioritized',food:'Local food is included at meal times',easy:'Fewer stops and more rest time',reason:'Matched to your interests and grouped by area to reduce backtracking.',meal:'Add a memorable local flavor to the journey.',break:'Rest and hydrate in the city, leaving flexibility for the next stop.',day:'Day ',daySuffix:''},
  ar:{summary:'مسار يناسب وقتك ورفاقك واهتماماتك',history:'تجارب التاريخ والثقافة لها الأولوية',nature:'تجارب الطبيعة والبيئة لها الأولوية',food:'أُدرجت الأطعمة المحلية ضمن أوقات الوجبات',easy:'محطات أقل ووقت أطول للراحة',reason:'يناسب اهتماماتك ويرتب الأماكن حسب المنطقة لتقليل التنقل ذهاباً وإياباً.',meal:'أضف نكهة محلية مميزة إلى رحلتك.',break:'استرح واشرب الماء في المدينة، واترك وقتاً مرناً للمرحلة التالية.',day:'اليوم ',daySuffix:''}
}

function normalizeLocale(locale){return ['zh-CN','en-US','ar'].includes(locale)?locale:'zh-CN'}
function localizedName(item,locale){return item.name[locale]||item.name['zh-CN']}
function localizedDuration(value,locale){
  if(locale==='zh-CN')return value
  if(locale==='ar'){
    const hours=/2\.5-3/.test(value)?'٢٫٥–٣':/2-3/.test(value)?'٢–٣':/1-1\.5/.test(value)?'١–١٫٥':null
    if(hours)return `${hours} ساعات`
    if(/大半天/.test(value))return 'معظم اليوم'
    if(/半天/.test(value))return 'نصف يوم'
    if(/1-1\.5小时/.test(value))return 'ساعة إلى ساعة ونصف'
    return 'وقت مرن'
  }
  const hours=/2\.5-3/.test(value)?'2.5–3':/2-3/.test(value)?'2–3':/1-1\.5/.test(value)?'1–1.5':null
  if(hours)return `${hours} hours`
  if(/大半天/.test(value))return 'most of the day'
  if(/半天/.test(value))return 'half a day'
  return 'flexible time'
}
function localizedCity(city,locale){
  if(locale==='zh-CN')return city
  const en={银川:'Yinchuan',中卫:'Zhongwei',吴忠:'Wuzhong',石嘴山:'Shizuishan',固原:'Guyuan',灵武:'Lingwu',定边:'Dingbian',宁夏:'Ningxia'}
  const ar={银川:'ينشوان',中卫:'تشونغوي',吴忠:'ووتشونغ',石嘴山:'石嘴山',固原:'固原',灵武:'灵武',定边:'定边',宁夏:'宁夏'}
  return (locale==='ar'?ar:en)[city]||city
}

function requestedAttractions(text=''){
  const value=String(text||'')
  const aliases={
    'lanshan-park':['览山公园','览山'],
    zhenbeibao:['镇北堡西部影城','镇北堡','西部影城','西部影视城'],
    'helan-rock-painting':['贺兰山岩画','岩画'],
    'xixia-tombs':['西夏陵'],
    'ningxia-museum':['宁夏博物馆'],
    shuidonggou:['水洞沟'],
    'helan-mountain':['贺兰山国家森林公园','贺兰山'],
    shapotou:['沙坡头'],
    'tengger-desert':['腾格里沙漠','腾格里'],
    '66-highway':['66号公路','66公路'],
    'jinsha-island':['金沙岛'],
    'wulan-lake':['乌兰湖'],
    'tiange-lake':['天鹅湖'],
    shahu:['沙湖'],
    'yellow-river-canyon':['黄河大峡谷'],
    'xige-winery':['西鸽酒庄','酒庄','贺兰山东麓酒庄']
  }
  const hits=[]
  attractions.forEach(item=>{
    const name=String(item.name&&item.name['zh-CN']||'')
    const exactIndex=name?value.indexOf(name):-1
    const aliasIndexes=(aliases[item.id]||[]).map(alias=>value.indexOf(alias)).filter(index=>index>=0)
    const index=[exactIndex].concat(aliasIndexes).filter(index=>index>=0).sort((a,b)=>a-b)[0]
    if(index!==undefined)hits.push({id:item.id,index})
  })
  return hits.sort((a,b)=>a.index-b.index).map(hit=>hit.id)
}

// “去过/玩过/到过”是硬约束，不是给模型参考的偏好。只有在用户明确
// 再次要求重游时才允许重新加入；默认路线永远排除这些地点。
function visitedAttractions(text=''){
  const value=String(text||'')
  const visited=[]
  attractions.forEach(item=>{
    const names=[String(item.name&&item.name['zh-CN']||'')]
    const aliases={shapotou:['沙坡头'],'tengger-desert':['腾格里沙漠','腾格里'],'66-highway':['66号公路','66公路'], 'jinsha-island':['金沙岛'],'wulan-lake':['乌兰湖'],'tiange-lake':['天鹅湖'],'helan-mountain':['贺兰山','贺兰山国家森林公园'],'helan-rock-painting':['贺兰山岩画','岩画'],'zhenbeibao':['镇北堡','西部影城'],'shuidonggou':['水洞沟'],'xixia-tombs':['西夏陵'],'shahu':['沙湖'],'yellow-river-canyon':['黄河大峡谷','青铜峡黄河大峡谷'],'ningxia-museum':['宁夏博物馆'],'lanshan-park':['览山公园','览山']}
    ;(aliases[item.id]||[]).forEach(name=>names.push(name))
    if(names.some(name=>name&&new RegExp(`(?:去过|玩过|到过|逛过|已经去过)[^，。！？；\\n]{0,24}${name}|${name}[^，。！？；\\n]{0,12}(?:去过|玩过|到过|逛过)`).test(value)))visited.push(item.id)
  })
  return [...new Set(visited)]
}

function requestedFoods(text=''){
  const value=String(text||'')
  const aliases={
    'hand-grabbed-lamb':['手抓羊肉','手抓'],
    'lamb-noodles':['羊肉臊子面','臊子面'],
    'eight-treasure-tea':['八宝茶'],
    'wu-zhong-noodles':['羊肉老搓面','老搓面'],
    'zhongwei-haozimian':['中卫蒿子面','蒿子面']
  }
  const hits=[]
  foods.forEach(item=>{
    const name=String(item.name&&item.name['zh-CN']||'')
    const exactIndex=name?value.indexOf(name):-1
    const aliasIndexes=(aliases[item.id]||[]).map(alias=>value.indexOf(alias)).filter(index=>index>=0)
    const index=[exactIndex].concat(aliasIndexes).filter(index=>index>=0).sort((a,b)=>a-b)[0]
    if(index!==undefined)hits.push({id:item.id,index})
  })
  return hits.sort((a,b)=>a.index-b.index).map(hit=>hit.id)
}

function requestedTimeSlots(text='',requestedStops=[]){
  const value=String(text||'')
  const markers=[
    {slot:'morning',words:['早上','上午','清晨']},
    {slot:'daytime',words:['白天','中午']},
    {slot:'afternoon',words:['下午']},
    {slot:'evening',words:['傍晚','晚上','夜里','夜晚']}
  ]
  const slots={}
  const aliases={
    'lanshan-park':['览山公园','览山'],zhenbeibao:['镇北堡西部影城','镇北堡','西部影城','西部影视城'],
    'helan-rock-painting':['贺兰山岩画','岩画'],'xixia-tombs':['西夏陵'],'ningxia-museum':['宁夏博物馆'],
    shuidonggou:['水洞沟'],'helan-mountain':['贺兰山国家森林公园','贺兰山'],shapotou:['沙坡头'],
    shahu:['沙湖'],'yellow-river-canyon':['青铜峡黄河大峡谷','黄河大峡谷']
  }
  requestedStops.forEach(id=>{
    const targetIndex=(aliases[id]||[]).map(term=>value.indexOf(term)).filter(index=>index>=0).sort((a,b)=>a-b)[0]
    if(targetIndex===undefined||targetIndex<0)return
    const nearby=markers.find(marker=>marker.words.some(word=>{
      const timeIndex=value.indexOf(word)
      return timeIndex>=0&&Math.abs(timeIndex-targetIndex)<=12
    }))
    if(nearby)slots[id]=nearby.slot
  })
  // For a single named destination, “下午去那里” has an unambiguous target.
  if(requestedStops.length===1&&!slots[requestedStops[0]]){
    const global=markers.find(marker=>marker.words.some(word=>value.includes(word)))
    if(global)slots[requestedStops[0]]=global.slot
  }
  return slots
}

function parseConstraints(text='', locale='zh-CN'){
  const value=String(text).trim()
  const dayMatch=value.match(/(\d+)\s*(天|day|days|يوم)/i)
  const budgetMatch=value.match(/(?:预算|budget|ميزانية)[^\d]{0,6}(\d+)/i) || value.match(/(\d+)\s*元/)
  const peopleMatch=value.match(/(\d+)\s*(人|位|people|persons)/i)
  const chinesePeopleMatch=value.match(/([一二两三四五六七八九十])\s*(?:个人|位|人)/)
  const chinesePeopleMap={一:1,两:2,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10}
  const ageMatch=value.match(/(\d+)\s*(岁|year|years|سنة)/i)
  const chineseDays=/一周|一星期/.test(value)?7:/周末/.test(value)?2:/五天/.test(value)?5:/四天/.test(value)?4:/三天/.test(value)?3:/两天/.test(value)?2:/一天|一日|一日游|当天来回/.test(value)?1:null
  const wordDays=/\b(five|four|three|two|one)\s+days?\b/i.exec(value)
  const wordDayMap={one:1,two:2,three:3,four:4,five:5}
  const arabicDays=/(خمسة|أربعة|ثلاثة|يومان|يومين|يوم واحد)/.exec(value)
  const arabicDayMap={'خمسة':5,'أربعة':4,'ثلاثة':3,'يومان':2,'يومين':2,'يوم واحد':1}
  const parsedEntities=parseTouristEntities(value)
  const excludedStops=visitedAttractions(value)
  const stops=[...new Set(requestedAttractions(value).concat(parsedEntities.destinationIds||[]))].filter(id=>!excludedStops.includes(id))
  // Never invent a duration.  A missing day count must be clarified by the
  // conversation layer instead of silently becoming a two-day itinerary.
  let days=dayMatch?Math.min(Math.max(Number(dayMatch[1]),1),7):(chineseDays||wordDays&&wordDayMap[wordDays[1].toLowerCase()]||arabicDays&&arabicDayMap[arabicDays[1]]||null)
  const halfDay=/半天|半日|half\s*day/i.test(value)
  if(halfDay)days=1
  // 只点名一个景区且没有说几天时，默认围绕该景区完成一日体验，
  // 不再擅自拼接第二座跨城景区。
  if(!dayMatch&&!chineseDays&&!wordDays&&!arabicDays&&stops.length===1)days=null
  const cityMentions=[
    {city:'银川',words:['银川','yinchuan']},
    {city:'中卫',words:['中卫','沙坡头','腾格里沙漠','66号公路','金沙岛','乌兰湖','天鹅湖','shapotou','tengger','zhongwei','شابوتو','تشونغوي']},
    {city:'吴忠',words:['吴忠','青铜峡','黄河大峡谷','wuzhong','ووتشونغ']},
    {city:'石嘴山',words:['石嘴山','沙湖','北武当','shahu','shizuishan','شاهو']},
    {city:'固原',words:['固原','火石寨','双龙石窟','guyuan']},
    {city:'灵武',words:['灵武','lingwu']},
    {city:'定边',words:['定边盐湖','定边','dingbian']}
  ].map(item=>({city:item.city,index:Math.min(...item.words.map(word=>{const index=value.toLowerCase().indexOf(word.toLowerCase());return index<0?Number.POSITIVE_INFINITY:index}))})).sort((a,b)=>a.index-b.index)
  const cityExplicit=Number.isFinite(cityMentions[0].index)
  // A regional request without an evidence-backed base city stays regional;
  // the conversation layer asks for the departure city when that blocks a
  // short itinerary. Never silently turn Ningxia into Yinchuan.
  let city=cityExplicit?cityMentions[0].city:null
  // A named, verified attraction is sufficient to establish a base city when
  // every requested stop belongs to the same city. This avoids asking users
  // where to start after they already named an unambiguous local destination.
  if(!city&&stops.length){
    const requestedCities=[...new Set(stops.map(id=>attractions.find(item=>item.id===id)).filter(Boolean).map(item=>item.city))]
    if(requestedCities.length===1)city=requestedCities[0]
  }
  // 仅仅提到“去过中卫景点”不能把用户继续锁在中卫；否则会把已去地点
  // 再次排进路线。没有新的明确目的地时，回到银川作为多区域候选起点。
  if(excludedStops.length&&!stops.length)city=null
  const explicitPeople=peopleMatch?Number(peopleMatch[1]):(chinesePeopleMatch?chinesePeopleMap[chinesePeopleMatch[1]]:null)
  const hasParents=/父母|爸妈|双亲|我还有父母|和父母|带父母|跟父母|"parents"/i.test(value)
  const hasChildren=/孩子|儿童|小朋友|带娃|亲子|"children"/i.test(value)
  const hasPartner=/我和对象|跟我对象|情侣|两个人|二人|couple/i.test(value)
  const hasFriends=/朋友(?:同行|一起|来)|和朋友|跟朋友|朋友一起来|friends/i.test(value)
  // 显式人数优先；没有数字时按自然语言关系推断“用户本人”也在同行者中。
  // “我和/带父母”=本人+父母两人，“我和父母带孩子”再加一人。
  const inferredPeople=hasParents?(hasChildren?4:3):hasPartner||hasFriends||hasChildren?2:1
  const peopleCount=explicitPeople||inferredPeople
  return {
    raw:value,locale:normalizeLocale(locale),days,halfDay,city,cityExplicit,
    // 同行关系是硬事实：朋友/对象/家人同行至少 2 人，不能被模型默认成 1 人。
    people:peopleCount,
    peopleCount,
    companions:parsedEntities.companions||[],
    age:ageMatch?Number(ageMatch[1]):null,
    budget:budgetMatch?Number(budgetMatch[1]):null,
    withChildren:/孩子|儿童|亲子|child|kid|family|"children"/i.test(value),
    withElderly:/父母|老人|长辈|elder|senior|"parents"/i.test(value),
    student:/学生|student|طالب/i.test(value),
    interests:{history:/历史|文化|西夏|岩画|history|culture|heritage/i.test(value),nature:/自然|生态|山|沙漠|黄河|nature|eco|mountain|desert/i.test(value),food:/美食|吃|羊肉|food|cuisine|eat/i.test(value),photo:/摄影|拍照|photo|photography/i.test(value)},
    // 细分宁夏体验；这些字段只来自用户原话，模型不得自行补全。
    experiences:parsedEntities.experiences||[],
    experienceLabels:parsedEntities.experienceLabels||[],
    explicitInterest:Boolean(parsedEntities.explicitInterest),
    intentSignals:parsedEntities.intentSignals||{},
    pace:/少走|轻松|慢|不想走|不想太累|太累|easy|slow|less walking|not too tiring|low_walking|مريح|قليل المشي/i.test(value)?'relaxed':'balanced',
    romantic:/浪漫|约会|对象|情侣|纪念日|romantic|date|couple/i.test(value),
    transport:/自驾|drive|car|سيارة/i.test(value)?'car':/公交|公共交通|bus|transit|حافلة/i.test(value)?'public':'flexible',
    // These are non-negotiable visitor choices, not model suggestions. Keep
    // them through Cloud intent extraction so the local itinerary and image
    // cards can use only known attractions.
    requestedStops:stops,
    excludedStops,
    requestedFoods:requestedFoods(value)
    ,requestedTimeSlots:requestedTimeSlots(value,stops)
  }
}

function chooseRoute(c, adjustment=''){
  const easy=c.pace==='relaxed'||c.withElderly||/少走|老人|降低|less|easy/i.test(adjustment)
  const child=c.withChildren||/亲子|孩子|child|family/i.test(adjustment)
  let defaults=[]
  if(c.experiences&&c.experiences.includes('entertainment'))defaults=c.city==='中卫'?['shapotou','jinsha-island']:['shapotou','zhenbeibao','shahu']
  else if(c.experiences&&c.experiences.includes('road_trip'))defaults=['66-highway','tengger-desert','shapotou','wulan-lake']
  else if(c.experiences&&c.experiences.includes('desert'))defaults=['shapotou','tengger-desert','jinsha-island','wulan-lake']
  else if(c.experiences&&c.experiences.includes('water_wetland'))defaults=['shahu','tiange-lake','yellow-river-canyon','jinsha-island']
  else if(c.experiences&&c.experiences.includes('sunset_night'))defaults=['lanshan-park','yellow-river-ancient-ferry','zhenbeibao','shapotou']
  else if(c.experiences&&c.experiences.includes('food_wine'))defaults=['xige-winery','ningxia-museum','zhenbeibao','yellow-river-ancient-ferry']
  else if(c.experiences&&c.experiences.includes('photography'))defaults=['lanshan-park','shapotou','wulan-lake','helan-rock-painting']
  else if(c.city==='中卫')defaults=c.days===1?['shapotou']:['shapotou','xixia-tombs','ningxia-museum']
  else if(c.city==='吴忠')defaults=['yellow-river-canyon','ningxia-museum','xixia-tombs']
  else if(c.city==='石嘴山')defaults=['shahu','ningxia-museum','xixia-tombs']
  else if(easy)defaults=['ningxia-museum','xixia-tombs','zhenbeibao']
  else if(child)defaults=['ningxia-museum','zhenbeibao','shuidonggou','shahu']
  else if(c.romantic)defaults=['xixia-tombs','ningxia-museum','zhenbeibao','helan-rock-painting']
  else if(c.interests.nature&&!c.interests.history)defaults=['helan-mountain','shahu','yellow-river-canyon','shapotou']
  else if(c.interests.history)defaults=['xixia-tombs','helan-rock-painting','ningxia-museum','zhenbeibao','shuidonggou']
  else defaults=['xixia-tombs','helan-rock-painting','zhenbeibao','ningxia-museum']
  // 览山公园 is deliberately reserved for the evening slot below. The other
  // named attractions lead the route before any generic recommendation.
  const excluded=new Set(c.excludedStops||[])
  const requested=(c.requestedStops||[]).filter(id=>!excluded.has(id))
  const candidates=requested.concat(defaults.filter(id=>!requested.includes(id)&&!excluded.has(id)))
  // 默认优先同城且有知识库证据的景点，只有天数确实需要时才跨城。
  const sameCity=candidates.filter(id=>{const item=attractions.find(x=>x.id===id);return item&&item.city===c.city})
  const otherCity=candidates.filter(id=>!sameCity.includes(id))
  // 用户只说“想玩项目/看湖/看沙漠”而未指定城市时，先尊重体验类型，
  // 不因默认起点银川把中卫、石嘴山的代表体验挤掉。
  const safe=(c.experiences&&c.experiences.length&&!c.cityExplicit)?candidates:sameCity.concat(otherCity)
  if(safe.length)return safe.slice(0,Math.max(c.days*2,2))
  return attractions.filter(item=>!excluded.has(item.id)).slice(0,Math.max(c.days*2,2)).map(item=>item.id)
}

function chooseFood(c, dayIndex, adjustment='', mealIndex=0){
  const used=c._usedFoodIds||(c._usedFoodIds=[])
  const requested=(c.requestedFoods||[])[dayIndex*2+(mealIndex>0?1:0)]
  const preferred=[]
  if(requested)preferred.push(requested)
  if(c.city==='中卫')preferred.push('zhongwei-haozimian','zhongwei-roasted-lamb-ribs','zhongwei-stir-fried-chicken')
  if(c.city==='吴忠')preferred.push('wu-zhong-noodles','hand-grabbed-lamb')
  if(c.city==='固原')preferred.push('guyuan-cold-noodles','guyuan-qiaomian','guyuan-yanmian')
  if(c.city==='灵武')preferred.push('lingwu-stewed-chicken','lingwu-longju')
  if(c.city==='石嘴山')preferred.push('lamb-tea','dawukou-tofu')
  if(c.student||c.budget&&c.budget<400||/预算降低|budget/i.test(adjustment))preferred.push('lamb-noodles')
  preferred.push('hand-grabbed-lamb','lamb-noodles','eight-treasure-tea','yinchuan-spicy-paste','lamb-intestine-noodles','guyuan-cold-noodles','zhongwei-haozimian')
  const picked=preferred.map(id=>foods.find(item=>item.id===id)).find(item=>item&&!used.includes(item.id))||foods.find(item=>!used.includes(item.id))||foods[0]
  if(picked&&!used.includes(picked.id))used.push(picked.id)
  return picked
}

function reasonFor(attraction,c,locale){
  if(locale!=='zh-CN')return COPY[locale].reason
  const name=localizedName(attraction,locale)
  if(c.experiences&&c.experiences.includes('entertainment')&&['shapotou','jinsha-island','zhenbeibao'].includes(attraction.id))return `${name}有更明确的体验项目或互动场景，回应你提出的游乐/体验需求；具体项目以现场和官方公告为准。`
  if(c.experiences&&c.experiences.includes('road_trip')&&['66-highway','tengger-desert','wulan-lake'].includes(attraction.id))return `${name}适合把公路、自驾和荒漠景观连成一段宁夏路线；出发前核对路况、车辆和补给。`
  if(c.experiences&&c.experiences.includes('desert')&&['shapotou','tengger-desert','jinsha-island','wulan-lake'].includes(attraction.id))return `${name}对应宁夏的沙漠/沙地体验，不把它替换成泛泛的城市景点；项目强度按体力现场调整。`
  if(c.experiences&&c.experiences.includes('water_wetland')&&['shahu','tiange-lake','yellow-river-canyon','jinsha-island'].includes(attraction.id))return `${name}回应你对湖泊、湿地或黄河水景的兴趣，适合放慢节奏观察水域生态。`
  if(c.experiences&&c.experiences.includes('sunset_night')&&['lanshan-park','yellow-river-ancient-ferry'].includes(attraction.id))return `${name}适合安排在傍晚，回应你想看落日/夜景的明确表达；日落时间和开放情况请以当天官方信息为准。`
  if(c.experiences&&c.experiences.includes('food_wine')&&attraction.id==='xige-winery')return `${name}把贺兰山东麓葡萄酒作为地方产业文化体验，不把“美食”泛化成普通餐馆推荐。`
  if((c.withElderly||c.pace==='relaxed')&&attraction.suitableFor&&attraction.suitableFor.includes('老人'))return `${name}以室内参观为主，适合父母同行；当天减少其他点位，给休息留出余量。`
  if(c.withElderly||c.pace==='relaxed')return `把${name}作为当天主体验，不赶场，游览后留出充分休息时间。`
  if(c.withChildren&&attraction.suitableFor&&attraction.suitableFor.includes('亲子'))return `${name}兼顾知识性和体验感，适合带孩子边看边聊。`
  if(c.interests.history&&['history','culture'].includes(attraction.category))return `${name}正好接住你对历史文化的兴趣，能把宁夏的时间线看得更清楚。`
  if(c.interests.nature&&attraction.category==='nature')return `${name}符合自然生态偏好，也能看到宁夏区别于其他目的地的地貌。`
  if(c.interests.photo)return `${name}的场景辨识度高，适合放慢脚步观察和拍摄。`
  return `${name}能代表宁夏的一种独特气质，并与当天其他体验按区域组合，减少折返。`
}

function attractionItem(attraction,time,locale,c){
  const copy=COPY[locale]
  return {time,type:'attraction',id:attraction.id,knowledgeId:attraction.id,name:localizedName(attraction,locale),reason:reasonFor(attraction,c,locale)||copy.reason,duration:localizedDuration(attraction.duration,locale),tips:locale==='zh-CN'?attraction.tips:SAFETY_NOTE[locale],tags:attraction.tags,agentId:attraction.agentId,image:attraction.image,city:localizedCity(attraction.city,locale),evidence:'knowledge'}
}

function restItem(time,name,reason,locale){
  const arabic=locale==='ar'
  return {time,type:'rest',id:`rest-${time.replace(':','')}`,name:locale==='zh-CN'?name:arabic?'العشاء والعودة إلى الفندق':'Dinner and return to the hotel',reason:locale==='zh-CN'?reason:COPY[locale].break,duration:locale==='zh-CN'?'弹性安排':arabic?'وقت مرن':'flexible',tips:locale==='zh-CN'?'当天体力优先；累了就直接休息，不必为了打卡勉强加点。':SAFETY_NOTE[locale],tags:[],agentId:'camel'}
}

function transitItem(attraction,c,locale,originCity){
  const destination=attraction.city
  const crossCity=originCity&&destination&&originCity!==destination
  if(locale!=='zh-CN'){
    const arabic=locale==='ar'
    const name=arabic?(crossCity?`التنقل إلى ${localizedCity(destination,locale)}`:`التوجه إلى ${localizedName(attraction,locale)}`):(crossCity?`Transfer to ${localizedCity(destination,locale)}`:`Travel to ${localizedName(attraction,locale)}`)
    const reason=arabic?'اترك وقتاً كافياً بين المدن وتحقق من مواعيد العودة الرسمية قبل الانطلاق.':crossCity?'Leave a generous intercity buffer and confirm the latest return transport before departure.':COPY[locale].reason
    return {time:crossCity?'07:30':'08:30',type:'transit',id:`transit-${attraction.id}`,name,reason,duration:arabic?'وقت مرن':'flexible',tips:SAFETY_NOTE[locale],tags:[],agentId:'camel'}
  }
  return {time:crossCity?'07:30':'08:30',type:'transit',id:`transit-${attraction.id}`,name:crossCity?`前往${destination} · 跨城衔接`:`前往${localizedName(attraction,locale)}`,reason:crossCity?`从${originCity}转到${destination}，上午先给交通留足余量；出发前确认去程、返程和最晚班次，不把跨城时间硬塞进景点。`:phraseTransport(attraction.transport),duration:'按当天交通灵活安排',tips:'优先使用正规公共交通、旅游直通车或有资质车辆；实时班次以官方平台为准。',tags:[],agentId:'camel'}
}

function phraseTransport(value){return String(value||'提前确认往返方式，给候车和停车留出余量。').replace(/[。；]+$/,'')+'。'}

function practicalTips(c,days,locale){
  if(locale!=='zh-CN')return [SAFETY_NOTE[locale]]
  const tips=[SAFETY_NOTE[locale],'出发前分别确认去程、返程和最后可用交通，不乘坐无资质揽客车辆；消费前先看明码标价。']
  if(days.some(day=>day.items.some(item=>item.type==='transit'&&/跨城/.test(item.name))))tips.push('行程含跨城衔接，建议把交通放在景点之前确认，并为堵车、候车和休息预留弹性。')
  if(c.withElderly||c.pace==='relaxed')tips.push('父母同行以体力为准：随身带常用物品和饮水，出现不适就停止加点，优先休息。')
  if(c.withChildren)tips.push('亲子项目请现场核对年龄、身高和安全限制，不为了完成行程勉强参加。')
  if(c.interests.food)tips.push('点餐前主动说明忌口与过敏需求，确认价格和分量后再下单。')
  return tips
}

function naturalSummary(c,days,locale){
  if(locale!=='zh-CN')return null
  const raw=String(c.raw||'')
  const when=/明天/.test(raw)?'明天':/后天/.test(raw)?'后天':'这次'
  const companions=c.withElderly?'和父母':c.withChildren?'带孩子':c.people>1?'和同行伙伴':''
  const pace=c.pace==='relaxed'||c.withElderly?'轻松走':'从容玩'
  const names=[]
  days.forEach(day=>day.items.forEach(item=>{if(item.type==='attraction'&&!names.includes(item.name))names.push(item.name)}))
  const focus=names.slice(0,2).join('、')
  return `${when}${companions}在${c.city||'宁夏'}${pace}${c.days}天：以${focus||'宁夏代表体验'}为主，不赶点，吃饭和休息都留出余量。`
}

function planTrip(input, options={}){
  const locale=normalizeLocale(options.locale||input.locale)
  const c=typeof input==='string'?parseConstraints(input,locale):Object.assign({},input,{locale})
  const adjustment=options.adjustment||''
  if(/重新规划|replan/i.test(adjustment)) c.interests.nature=!c.interests.nature
  if(/少走|老人|easy|less walking/i.test(adjustment))c.pace='relaxed'
  if(/亲子|孩子|child|family/i.test(adjustment))c.withChildren=true
  if(/文化|culture/i.test(adjustment))c.interests.history=true
  if(/预算降低|lower the budget/i.test(adjustment))c.budget=c.budget?Math.max(100,Math.round(c.budget*.7)):300
  let ids=chooseRoute(c,adjustment)
  if(/换一个景点|重新规划|change a stop|replan/i.test(adjustment)){
    const alternatives=c.city==='中卫'?['shapotou','yellow-river-canyon']:['shuidonggou','zhenbeibao','helan-mountain','ningxia-museum']
    const replacement=alternatives.find(id=>!ids.includes(id))
    if(replacement)ids=[replacement].concat(ids.slice(1))
  }
  const stops=ids.map(id=>attractions.find(x=>x.id===id)).filter(Boolean)
  const crossCityRoute=new Set(stops.map(item=>item.city)).size>1
  const perDay=(c.pace==='relaxed'||c.withElderly||crossCityRoute)?1:2
  const days=[]
  let originCity=c.city
  for(let dayIndex=0;dayIndex<c.days;dayIndex++){
    let dayStops=stops.slice(dayIndex*perDay,(dayIndex+1)*perDay)
    if(!dayStops.length)dayStops.push((c.requestedStops||[]).length?stops[dayIndex%(stops.length||1)]:attractions.find(x=>x.id==='ningxia-museum'))
    const requestedLanshanSlot=c.requestedTimeSlots&&c.requestedTimeSlots['lanshan-park']
    const explicitDaytimeLanshan=dayIndex===0&&c.city==='银川'&&requestedLanshanSlot&&requestedLanshanSlot!=='evening'
    if(explicitDaytimeLanshan){
      const lanshanTarget=attractions.find(item=>item.id==='lanshan-park')
      if(requestedLanshanSlot==='morning')dayStops=[lanshanTarget].concat(dayStops.filter(item=>item.id!==lanshanTarget.id)).slice(0,perDay)
      else dayStops=dayStops.filter(item=>item.id!==lanshanTarget.id).slice(0,Math.max(perDay-1,0)).concat([lanshanTarget])
    }
    const requestedSlots=c.requestedTimeSlots||{}
    const defaultEveningLanshan=(c.requestedStops||[]).includes('lanshan-park')&&!requestedSlots['lanshan-park']
    if(defaultEveningLanshan)dayStops=dayStops.filter(item=>item.id!=='lanshan-park')
    const requestedEveningLanshan=requestedSlots['lanshan-park']==='evening'
    if(requestedEveningLanshan)dayStops=dayStops.filter(item=>item.id!=='lanshan-park')
    const slotRank={morning:0,daytime:1,afternoon:2,evening:3}
    dayStops=dayStops.slice().sort((a,b)=>(slotRank[requestedSlots[a.id]]===undefined?1:slotRank[requestedSlots[a.id]])-(slotRank[requestedSlots[b.id]]===undefined?1:slotRank[requestedSlots[b.id]]))
    const explicitEveningStop=dayStops.find(item=>requestedSlots[item.id]==='evening'&&item.id!=='lanshan-park')
    if(explicitEveningStop)dayStops=dayStops.filter(item=>item.id!==explicitEveningStop.id)
    if(!dayStops.length)dayStops=[attractions.find(item=>item.id==='ningxia-museum')]
    const items=[]
    const crossDayCity=Boolean(originCity&&dayStops[0].city!==originCity)
    const lunch=chooseFood(c,dayIndex,adjustment,0)
    const dinner=chooseFood(c,dayIndex,adjustment,1)
    const foodItem=(time,mealFood)=>({time,type:'food',id:mealFood.id,knowledgeId:mealFood.id,name:localizedName(mealFood,locale),reason:COPY[locale].meal,duration:localizedDuration('1-1.5小时',locale),tips:locale==='zh-CN'?'请按同行人的饮食习惯与过敏情况选择餐食，并在点餐前确认价格与分量。':locale==='en-US'?'Choose food according to dietary needs and allergies.':'اختر الطعام وفق الاحتياجات الغذائية والحساسية.',tags:[mealFood.taste],agentId:mealFood.agentId,image:mealFood.image,city:localizedCity(mealFood.city,locale),evidence:'knowledge'})
    const afternoonOnly=dayStops.length===1&&requestedSlots[dayStops[0].id]==='afternoon'
    if(afternoonOnly){
      items.push(restItem('09:30','上午自由活动与补水','把上午留给轻松整理和市区活动，午餐后再前往览山公园。',locale))
      items.push(foodItem('12:00',lunch))
      const transit=transitItem(dayStops[0],c,locale,originCity);transit.time='13:30';items.push(transit)
      items.push(attractionItem(dayStops[0],'14:30',locale,c))
    }else{
      items.push(transitItem(dayStops[0],c,locale,originCity))
      items.push(attractionItem(dayStops[0],crossDayCity?'10:30':'09:00',locale,c))
      const attractionDuration=String(dayStops[0]&&dayStops[0].duration||'')
      const lunchTime=crossDayCity||/半天|大半天/.test(attractionDuration)?'13:30':'12:30'
      items.push(foodItem(lunchTime,lunch))
    }
    if(dayStops[1])items.push(attractionItem(dayStops[1],'14:30',locale,c))
    else items.push({time:'15:30',type:'rest',id:'flex-time',name:locale==='zh-CN'?'市区休息与自由探索':locale==='en-US'?'City break and flexible exploration':'استراحة واستكشاف مرن في المدينة',reason:COPY[locale].break,duration:locale==='zh-CN'?'1-2小时':locale==='en-US'?'1–2 hours':'1–2 ساعة',tips:locale==='zh-CN'?'根据体力和天气灵活调整。':SAFETY_NOTE[locale],tags:[],agentId:'camel'})
    if(/增加.*美食|add local food|أضف طعام/i.test(adjustment)){
      const extraFood=chooseFood(c,dayIndex,adjustment,3)
      items.push(foodItem('16:30',extraFood))
    }
    const lanshan=dayIndex===0&&c.city==='银川'&&!explicitDaytimeLanshan&&!explicitEveningStop?attractions.find(item=>item.id==='lanshan-park'):null
    if(explicitEveningStop){
      const transit=transitItem(explicitEveningStop,c,locale,originCity);transit.time='17:30';items.push(transit)
      items.push(attractionItem(explicitEveningStop,'18:30',locale,c))
      items.push(foodItem('20:00',dinner))
      items.push(restItem('21:30','晚餐与回住处休息','把晚上的体验留给你点名的景点，结束后直接回住处休息。',locale))
    }else if(lanshan){
      const evening=attractionItem(lanshan,'18:30',locale,c)
      if(locale==='zh-CN')evening.reason=c.withElderly||c.pace==='relaxed'?'如果父母傍晚体力还好，就去看看银川落日；如果累了，这一段随时取消，前面的核心体验已经完整。':'把览山公园留到傍晚看城市与落日，节奏自然，也不会挤占白天的主要游览。'
      items.push(evening)
      items.push(foodItem('20:00',dinner))
      items.push(restItem('21:30','晚餐与回住处休息','找一家顺路的店安心吃晚饭，饭后直接回住处休息，把体力留给第二天。',locale))
    }else{
      items.push(foodItem('18:30',dinner))
      items.push(restItem('20:00','晚餐、轻松散步与回程','晚餐不赶时间；如果还有精神就在附近走走，之后早点回住处休息。',locale))
    }
    days.push({date:`${COPY[locale].day}${dayIndex+1}${COPY[locale].daySuffix}`,items})
    originCity=dayStops[dayStops.length-1].city
  }
  const summaryParts=[naturalSummary(c,days,locale)||COPY[locale].summary]
  if(c.interests.history)summaryParts.push(COPY[locale].history)
  if(c.interests.nature)summaryParts.push(COPY[locale].nature)
  if(c.interests.food||/美食|food|طعام/i.test(adjustment))summaryParts.push(COPY[locale].food)
  if(c.pace==='relaxed'||c.withElderly)summaryParts.push(COPY[locale].easy)
  const foodNames=[]
  days.forEach(day=>day.items.forEach(item=>{if(item.type==='food'&&!foodNames.includes(item.name))foodNames.push(item.name)}))
  const summary=locale==='zh-CN'?summaryParts.map(part=>String(part).replace(/[。；]+$/,'')).join('；')+'。':summaryParts.join('. ')
  return {id:`trip-${Date.now()}`,locale,query:c.raw||'',constraints:c,cityLabel:localizedCity(c.city||'宁夏',locale),summary,days,foodRecommendations:foodNames,tips:practicalTips(c,days,locale),knowledgeVersion:'2026.08-local-v1',generatedBy:'knowledge-agent'}
}

function adjustTrip(previousPlan, instruction){
  const constraints=Object.assign({},previousPlan.constraints,{interests:Object.assign({},previousPlan.constraints.interests)})
  return planTrip(constraints,{locale:previousPlan.locale,adjustment:instruction,previousPlan})
}

function explainKnowledge(id, mode='brief', locale='zh-CN'){
  locale=normalizeLocale(locale)
  const item=attractions.find(x=>x.id===id)||foods.find(x=>x.id===id)
  if(!item)return null
  const agent=agents.find(x=>x.id===item.agentId)||agents[2]
  const name=localizedName(item,locale)
  let content=''
  if(locale==='zh-CN'){
    content=mode==='child'?`我是${agent.name}。把${name}想成一本可以走进去的宁夏故事书：${item.intro}记得只看、只听还不够，也要尊重遗址和自然。`:mode==='travel'?`${item.intro}建议预留${item.duration||'充足时间'}。${item.transport||''}${item.tips||''}`:`${item.intro}${mode==='deep'?` ${item.culture||item.tags&&item.tags.join('、')||''} ${item.tips||''}`:''}`
  }else if(locale==='en-US'){
    content=`${name} is presented from the verified local Ningxia knowledge base. Allow ${localizedDuration(item.duration||'',locale)} and check official notices before visiting.`
  }else{
    content=`يُقدَّم ${name} من قاعدة معرفة نينغشيا المحلية الموثقة. خصص ${localizedDuration(item.duration||'',locale)} وتحقق من الإعلانات الرسمية قبل الزيارة.`
  }
  return {itemId:item.id,knowledgeId:item.id,title:name,content,agent,safetyNote:SAFETY_NOTE[locale],evidence:'knowledge'}
}

module.exports={parseConstraints,planTrip,adjustTrip,explainKnowledge,normalizeLocale,SAFETY_NOTE}
