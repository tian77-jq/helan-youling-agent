const {routeQuestion}=require('./agent-router')

const MODES={
  GENERAL_DISCOVERY:'text_exploration',
  TRIP_PLANNING:'itinerary_card',
  ATTRACTION_QA:'cultural_explanation',
  FOOD_RECOMMENDATION:'food_recommendation',
  ADJUST_TRIP:'adjust_existing_trip',
  META_SYSTEM:'system_answer',
  OUT_OF_DOMAIN:'domain_boundary',
  CLARIFICATION:'clarification'
}

function responseModeRouter(text='',hasExistingPlan=false){
  const value=String(text).trim().toLowerCase()
  const namedAttraction=/西夏陵|贺兰山岩画|岩画|镇北堡|水洞沟|沙坡头|沙湖|宁夏博物馆|66号公路|66公路|腾格里沙漠|西鸽酒庄|酒庄/.test(value)
  const durationSignal=/明天|后天|半天|[一二两三四五六七]天|一日游|当天来回|周末|一周|一星期|\d+\s*(天|日)/.test(value)
  const peopleSignal=/\d+\s*(人|位)|一个人|两个人|三个人|一家|情侣|朋友同行/.test(value)
  const namedStopSignal=/览山公园|览山|镇北堡|西部影城|西部影视城|贺兰山岩画|西夏陵|水洞沟|沙坡头|沙湖|宁夏博物馆|66号公路|66公路|腾格里沙漠|西鸽酒庄|酒庄|[\u4e00-\u9fa5]{2,8}湖/.test(value)
  const adjustmentSignal=/少走|增加|加入|预算降低|换一个景点|重新规划|调整|改一下|慢一点|再加/.test(value)
  const refinementSignal=/^(?:两|三|四|五|一|\d+)天吧?[。！？!?]?$|改成(?:两|三|四|五|一|\d+)天|第二天|第三天|不要去|别去|回到刚才(?:路线|行程)/.test(value)
  const explicitAdjustment=(adjustmentSignal&&(hasExistingPlan||(!durationSignal&&value.length<=12)))||(hasExistingPlan&&(refinementSignal||/适合亲子|适合老人/.test(value)))
  const travellerSignal=/第一次|父母|老人|长辈|孩子|亲子|朋友|情侣|学生|预算|喜欢|偏好|不想走|少走|想去|想看|历史|文化|自然|美食/.test(value)
  const planningVerb=/怎么玩|怎么游玩|怎么安排|怎么排|有什么安排|规划|安排|行程|路线|旅游计划|旅行计划/.test(value)
  const scenicPlanningVerb=/(?:规划|安排)(?:一下)?/.test(value)&&namedStopSignal
  const richConstraints=/(预算|学生)/.test(value)&&/(两个人|同行|想去|父母|孩子|朋友)/.test(value)
  const openQuestionSignal=/歌颂|赞美|写.{0,18}(诗|文案|散文|导游词|朋友圈)|描写|形容|拟人|想象|创作|诗意|为什么.*宁夏|宁夏.*为什么|塞上江南|宁夏.{0,8}(感觉|气质|魅力|印象|意义|大学|高校|学校|气候|人口|民族|经济)|如何理解.{0,8}宁夏|谈谈宁夏/.test(value)
  // A duration plus an action-oriented travel phrase is already a planning
  // request. Do not require the words “规划/路线/安排”: “我来宁夏了，想玩一天”
  // is an unambiguous trip task and must reach the planner.
  const dayTripAction=durationSignal&&/(想玩|玩玩|游玩|逛逛|来宁夏|来银川|来中卫|到宁夏|到银川|旅行|旅游|出去玩)/.test(value)
  const explicitTrip=((planningVerb||scenicPlanningVerb)&&(durationSignal||travellerSignal||namedStopSignal||/宁夏|银川|中卫|吴忠|石嘴山/.test(value)))||(planningVerb&&durationSignal)||(/(?:想去|准备去|计划去)/.test(value)&&namedStopSignal)||(durationSignal&&travellerSignal)||(durationSignal&&(peopleSignal||namedStopSignal))||richConstraints||dayTripAction
  if(/混元|hunyuan|什么模型|模型厉不厉害|模型怎么样|系统能力|为什么.*回答|ai.?能力|系统.{0,8}角色|(?:小程序|项目).{0,8}(?:ai|模型)/i.test(value))return {intent:'META_SYSTEM',confidence:0.99,response_mode:MODES.META_SYSTEM,need_clarification:false,route:'meta',reason:'meta_system_signal'}
  if(/北京大学|中国人民大学|清华大学|复旦大学|上海交通大学/.test(value))return {intent:'OUT_OF_DOMAIN',confidence:0.99,response_mode:MODES.OUT_OF_DOMAIN,need_clarification:false,route:'boundary',reason:'non_ningxia_entity'}
  if(/人生如梦|下一句|上一句|古诗|诗词|写.{0,18}诗|数学题|股票|天气/.test(value))return {intent:'OUT_OF_DOMAIN',confidence:0.99,response_mode:MODES.OUT_OF_DOMAIN,need_clarification:false,route:'boundary',reason:'out_of_domain_signal'}
  if(/北方民族大学/.test(value))return {intent:'GENERAL_DISCOVERY',confidence:0.96,response_mode:MODES.GENERAL_DISCOVERY,need_clarification:false,route:'travel',reason:'ningxia_university_signal'}
  if(/^来宁夏玩[。！!?？]?$/i.test(value))return {intent:'TRIP_DISCOVERY',confidence:0.88,response_mode:'guided_trip_discovery',need_clarification:false,route:'travel',reason:'trip_discovery_without_constraints'}
  if(explicitAdjustment&&!namedAttraction)return {intent:'ADJUST_TRIP',confidence:0.99,response_mode:MODES.ADJUST_TRIP,need_clarification:false,route:'travel',reason:'adjustment_signal'}
  if(planningVerb&&!hasExistingPlan&&!durationSignal&&!namedStopSignal&&!/半天|一日游|当天来回|周末|一周|一星期|宁夏|银川|中卫|吴忠|石嘴山|固原|第一次/.test(value))return {intent:'NEED_DESTINATION_AND_DURATION',confidence:0.98,response_mode:'trip_slots',need_clarification:true,route:'travel',reason:'missing_destination_and_duration'}
  if(explicitTrip&&!hasExistingPlan&&!durationSignal&&!/一日游|当天来回|半天|周末|一周|一星期/.test(value))return {intent:'TRIP_PLANNING_NEEDS_DURATION',confidence:0.98,response_mode:'trip_duration',need_clarification:true,route:'travel',reason:'missing_duration'}
  if(explicitTrip)return {intent:'TRIP_PLANNING',confidence:0.95,response_mode:MODES.TRIP_PLANNING,need_clarification:false,route:'travel',reason:'explicit_planning_signal'}
  if(openQuestionSignal)return {intent:'GENERAL_DISCOVERY',confidence:0.93,response_mode:MODES.GENERAL_DISCOVERY,need_clarification:false,route:'travel',reason:'open_question_signal'}
  if(/动物|野生|岩羊|蓝马鸡|金雕|荒漠猫|兔狲|候鸟|生态|自然保护|动植物/.test(value))return {intent:'ECOLOGY_QA',confidence:0.97,response_mode:'ecology_explanation',need_clarification:false,route:'ecology',reason:'ecology_signal'}
  if(/^宁夏/.test(value)&&/有哪些|有什么.{0,6}体验|哪里|去哪里/.test(value)&&!/美食|吃|羊肉|八宝茶|特产|小吃|面食|历史|文化|岩画|西夏|非遗|丝绸之路|丝路/.test(value))return {intent:'GENERAL_DISCOVERY',confidence:0.94,response_mode:MODES.GENERAL_DISCOVERY,need_clarification:false,route:'travel',reason:'broad_discovery_signal'}
  if((namedAttraction&&/值得去|值得了解|值得看|注意|怎么样|讲讲|讲述|是什么|适合|老人|亲子|故事|历史|看点|特色|为什么|介绍/.test(value))||/历史|文化|西夏|岩画|非遗|中阿|丝绸之路|丝路/.test(value)&&!explicitTrip)return {intent:'CULTURE_QA',confidence:0.96,response_mode:MODES.ATTRACTION_QA,need_clarification:false,route:'culture',reason:'attraction_or_culture_signal'}
  if(/晚上|夜游|今晚|夜里/.test(value)&&/去哪|哪里|去哪玩|怎么玩|推荐|有什么玩/.test(value))return {intent:'NIGHT_TRAVEL',confidence:0.98,response_mode:'night_recommendation',need_clarification:false,route:'travel',reason:'night_travel_signal'}
  if(/美食|吃什么|好吃|想吃|手抓羊肉|羊杂|八宝茶|枸杞|滩羊|特产|面食|小吃|搓面|蒿子面|夜市/.test(value))return {intent:'FOOD_QA',confidence:0.97,response_mode:MODES.FOOD_RECOMMENDATION,need_clarification:false,route:'travel',reason:'food_signal'}
  if(/宁夏怎么玩|宁夏怎么样|银川值得去吗|怎么去宁夏|想了解一下/.test(value))return {intent:'CLARIFICATION_REQUIRED',confidence:0.45,response_mode:MODES.CLARIFICATION,need_clarification:true,route:'travel',reason:'underspecified_request'}
  const route=routeQuestion(value)
  if(/好玩|旅游|游玩|第一次来|第一次去|推荐|有哪些|有什么|景点|哪里|去哪里/.test(value))return {intent:'GENERAL_DISCOVERY',confidence:0.91,response_mode:MODES.GENERAL_DISCOVERY,need_clarification:false,route:route.route==='unknown'?'travel':route.route,reason:'discovery_signal'}
  if(/下一句|上一句|是什么|什么意思|怎么说|好不好玩|真的吗|为什么|如何理解|再说说|？|\?/.test(value))return {intent:'GENERAL_DISCOVERY',confidence:0.86,response_mode:MODES.GENERAL_DISCOVERY,need_clarification:false,route:route.route==='unknown'?'travel':route.route,reason:'general_question_signal'}
  return {intent:'CLARIFICATION_REQUIRED',confidence:0.55,response_mode:MODES.CLARIFICATION,need_clarification:true,route:route.route==='unknown'?'travel':route.route,reason:'low_confidence'}
}

module.exports={responseModeRouter,MODES}
