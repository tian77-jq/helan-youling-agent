const cloudAI=require('./cloud-ai')
const guard=require('./hallucination-guard')
const router=require('./agent-router')
const {hasTripTemplate,cleanAnswer}=require('./response-formatter')
const personalityLayer=require('./tourist-personality-layer')
const {attractions,foods,agents}=require('../knowledge/index')
const {scenicCollabs}=require('./data')
const groundedAnswer=require('./knowledge-grounded-answer')
const taskContract=require('./task-contract')
const regionalScope=require('./regional-scope-gate')
const knowledgePipeline=require('../services/knowledge-pipeline')

function includesAny(value,words){return words.some(word=>String(value||'').includes(word))}
function listValue(value){return Array.isArray(value)?value.join(' '):String(value||'')}
function matchesCity(item,city){return !city||String(item.city||'').includes(city)}

function discoveryFacts(question){
  const value=String(question||'')
  const city=['银川','中卫','吴忠','石嘴山'].find(name=>value.includes(name))
  const topicNature=/自然|生态|动物|野生|鸟类|候鸟|山野|沙漠|黄河|湿地|湖|风景/.test(value)
  const audit=regionalScope.audit(attractions,value,topicNature?item=>item.category==='nature':null)
  console.log('[REGIONAL_SCOPE_GATE]',Object.assign({},audit,{items:undefined}))
  let list=audit.items.filter(item=>matchesCity(item,city))
  const themeFilters=[
    {hit:/自然|生态|动物|野生|鸟类|候鸟|山野|沙漠|黄河|湿地|湖|风景/.test(value),test:item=>item.category==='nature'},
    {hit:/历史|文化|文明|遗址|博物馆|故事/.test(value),test:item=>['history','culture'].includes(item.category)},
    {hit:/亲子|孩子|儿童|一家人/.test(value),test:item=>listValue(item.suitableFor).includes('亲子')},
    {hit:/父母|老人|长辈|少走/.test(value),test:item=>listValue(item.suitableFor).includes('老人')||item.id==='ningxia-museum'},
    {hit:/拍照|摄影|出片/.test(value),test:item=>`${listValue(item.suitableFor)} ${listValue(item.tags)}`.includes('摄影')}
  ]
  themeFilters.forEach(filter=>{
    if(!filter.hit)return
    const narrowed=list.filter(filter.test)
    if(narrowed.length)list=narrowed
  })
  return (list.length?list:regionalScope.filter(attractions,value).filter(item=>matchesCity(item,city))).slice(0,6)
}

function foodFacts(question){
  const value=String(question||'')
  const city=['银川','中卫','吴忠'].find(name=>value.includes(name))
  let list=foods.filter(item=>matchesCity(item,city))
  if(/羊肉|滩羊/.test(value)){
    const lamb=list.filter(item=>`${item.name&&item.name['zh-CN']} ${item.intro}`.includes('羊'))
    if(lamb.length)list=lamb
  }else if(/面|主食/.test(value)){
    const noodles=list.filter(item=>String(item.name&&item.name['zh-CN']).includes('面'))
    if(noodles.length)list=noodles
  }else if(/茶|饮品|喝什么/.test(value)){
    const drinks=list.filter(item=>/茶|饮/.test(`${item.name&&item.name['zh-CN']} ${item.intro}`))
    if(drinks.length)list=drinks
  }
  return (list.length?list:foods).slice(0,6)
}

function nightFacts(question){
  const value=String(question||'')
  const city=['银川','中卫','吴忠','石嘴山'].find(name=>value.includes(name))
  const liveRequest=/实时|当前|最新|活动|演出|音乐会|烟花|直播|live/i.test(value)
  if(liveRequest)return []
  const stableIds=city==='银川'?['lanshan-park','yellow-river-ancient-ferry']:
    city==='中卫'?['shapotou','tengger-desert','66-highway']:
    city==='吴忠'?['yellow-river-canyon']:
    city==='石嘴山'?['shahu']:
    ['lanshan-park','yellow-river-ancient-ferry','shapotou','tengger-desert','66-highway']
  const local=stableIds.map(id=>attractions.find(item=>item.id===id)).filter(Boolean)
  const evening=local.filter(item=>item.preferredVisit==='evening'||/沙坡头|沙漠|黄河|星空|览山/.test(item.name&&item.name['zh-CN']))
  return (evening.length?evening:local).slice(0,6)
}

function namedFacts(question,itemId){
  const item=itemId?guard.knowledgeItem(itemId):null
  if(item&&regionalScope.matches(item,question))return [item]
  const value=String(question||'')
  const catalog=[...attractions,...foods]
  // Full catalogue names always win. Do not use loose three-character
  // fragments: “贺兰山” otherwise made the forest park collide with rock art.
  const exact=catalog.filter(candidate=>{
    const name=String(candidate.name&&candidate.name['zh-CN']||'')
    return name&&value.includes(name)
  }).sort((left,right)=>String(right.name&&right.name['zh-CN']||'').length-String(left.name&&left.name['zh-CN']||'').length)[0]
  if(exact&&regionalScope.matches(exact,value))return [exact]
  const aliases={
    '镇北堡':'zhenbeibao','西部影城':'zhenbeibao','西部影视城':'zhenbeibao',
    '贺兰山森林公园':'helan-mountain','岩画':'helan-rock-painting','西夏':'xixia-tombs',
    '黄河大峡谷':'yellow-river-canyon','手抓':'hand-grabbed-lamb','臊子面':'lamb-noodles',
    '老搓面':'wu-zhong-noodles','蒿子面':'zhongwei-haozimian'
  }
  const aliasId=Object.keys(aliases).find(alias=>value.includes(alias))
  const named=aliasId&&catalog.find(candidate=>candidate.id===aliases[aliasId])
  if(named&&regionalScope.matches(named,value))return [named]
  return []
}

function factsForQuestion(question,itemId,responseMode){
  const direct=namedFacts(question,itemId)
  if(direct.length)return direct
  const value=String(question||'')
  if(responseMode==='text_exploration'){
    if(/美食|吃什么|好吃|手抓羊肉|羊杂|八宝茶|枸杞|滩羊|特产|面食|小吃|搓面|蒿子面/.test(value))return foodFacts(value)
    return discoveryFacts(value)
  }
  if(responseMode==='food_recommendation')return foodFacts(value)
  if(responseMode==='night_recommendation')return nightFacts(value)
  const route=router.routeQuestion(question)
  if(route.route==='unknown')return []
  return regionalScope.filter([...attractions,...foods],value).filter(item=>item.agentId===route.agent.id).slice(0,8)
}

function behaviorFor(question,options){
  if(options&&options.responseBehavior)return options.responseBehavior
  const value=String(question||'')
  if(/美食|吃什么|好吃|手抓羊肉|羊杂|八宝茶|枸杞|滩羊|特产/.test(value))return 'FOOD_GUIDE'
  if(/西夏陵|贺兰山岩画|镇北堡|水洞沟|历史|文化|岩画|故事/.test(value))return 'STORY_EXPLANATION'
  if(/晚上|夜游|今晚|夜里/.test(value)&&/去哪|哪里|去哪玩|怎么玩|推荐|有什么玩/.test(value))return 'NIGHT_GUIDE'
  if(/\d+\s*(天|日)|一天|两天|明天.*怎么玩|怎么安排|路线|行程|计划|预算|带.*去/.test(value))return 'TRIP_PLAN'
  return 'DIRECT_ANSWER'
}

function agentFor(behavior,route){
  if(behavior==='TRIP_PLAN'||behavior==='ADJUST_TRIP')return agents.find(item=>item.id==='camel')
  if(behavior==='STORY_EXPLANATION')return agents.find(item=>item.id==='camel')
  if(behavior==='FOOD_GUIDE'||behavior==='NIGHT_GUIDE')return agents.find(item=>item.id==='sand-fox')
  if(behavior==='DIRECT_ANSWER')return route&&route.agent||agents.find(item=>item.id==='rock-goat')
  return route.agent||agents.find(item=>item.id==='rock-goat')
}

function agentForCharacter(character, fallback){
  const legacy={yanYang:'rock-goat',shaHu:'sand-fox',luoTuo:'camel'}[character]
  return agents.find(item=>item.id===legacy)||fallback
}

function isCreativeQuestion(question){
  return /歌颂|赞美|写.{0,18}(诗|文案|散文|导游词|朋友圈)|描写|形容|拟人|想象|用.+口吻|讲个故事|创作|诗意/.test(String(question||''))
}

function unknownSpecificPlace(question,explicitlyKnown){
  const value=String(question||'').trim()
  if(explicitlyKnown)return false
  const generic=/^(?:宁夏|银川|中卫|吴忠|石嘴山)?.{0,8}(?:有什么|有哪些|推荐|哪里|去哪).{0,6}(?:景区|公园|古镇|寺|峡谷|陵|岩画|博物馆|影城|湖)/.test(value)
  if(generic)return false
  const namedSuffix='(?:景区|公园|古镇|寺|峡谷|陵|岩画|博物馆|影城|湖|石窟|沙漠|酒庄)'
  const travelRequest=new RegExp(`(?:想去|要去|准备去|计划去|参观|游览|打卡).{0,20}${namedSuffix}`)
  const directQuestion=new RegExp(`${namedSuffix}.{0,12}(?:值得|怎么样|好不好|介绍|历史|故事|注意|去吗|玩吗|几天|路线|行程|？|\\?)`)
  return travelRequest.test(value)||directQuestion.test(value)
}

function conceptOnlyPlace(question,explicitlyKnown){
  if(explicitlyKnown)return null
  const value=String(question||'')
  return (scenicCollabs||[]).find(item=>item.entityType==='concept'&&item.scenicName&&value.includes(item.scenicName))||null
}

function placeBoundary(question,explicitlyKnown){
  const known=Boolean(explicitlyKnown)||namedFacts(question,null).length>0
  const concept=conceptOnlyPlace(question,known)
  if(concept)return {type:'CONCEPT_ONLY',item:concept}
  return unknownSpecificPlace(question,known)?{type:'UNKNOWN_PLACE'}:null
}

function localAnswer(facts,behavior,personality,question=''){
  const items=Array.isArray(facts)?facts:[]
  const item=items[0]
  if(!item)return guard.unknownFact()
  let answer=''
  const name=value=>value.name&&value.name['zh-CN']||value.id
  const phrase=value=>String(value||'').trim().replace(/[。；;]+$/,'')
  const discoveryLead=(value,index)=>{
    if(value.category==='nature')return index===0?'想看宁夏的山河反差，可以先到':'换一种自然气质，可以看'
    if(value.category==='history')return index===0?'想读懂宁夏的时间线，可以先从':'顺着历史往前走，可以看'
    if(value.category==='culture')return index===0?'想感受宁夏的文化气质，可以先到':'换个有故事的场景，可以看'
    const topic=`${listValue(value.tags)} ${listValue(value.suitableFor)}`
    if(/摄影/.test(topic))return index===0?'想慢慢看、好好拍，可以先去':'也很适合留出时间给'
    return index===0?'先认识':'还可以看看'
  }
  if(behavior==='FOOD_GUIDE'){
    const picks=items.slice(0,3)
    const leads=['先从','想吃主食，再试','走累时喝一杯']
    answer=picks.map((value,index)=>`${leads[index]||'还可以尝尝'}${name(value)}，${phrase(value.intro)}`).join('；')
    answer+='。不用一次全打卡，选两样坐下来慢慢吃，反而更有宁夏的味道。'
  }else if(behavior==='NIGHT_GUIDE'){
    const picks=items.slice(0,3)
    answer=picks.map(value=>`${name(value)}：${phrase(value.intro)}。建议放在傍晚或晚间，具体开放安排以当天官方信息为准`).join('；')+'。'
  }else if(behavior==='STORY_EXPLANATION'){
    const clues=listValue(item.tags).replace(/\s+/g,'、')
    answer=`${name(item)}值得停下来看看。${phrase(item.intro)}。参观时别只看一个结果，可以沿着${clues||'遗址、环境和人的生活'}这些线索慢慢读，它真正动人的地方，是把宁夏的自然环境和人的生活连接在一起。${item.tips?`出发前再留意：${phrase(item.tips)}。`:''}`.trim()
  }else{
    const picks=items.slice(0,3)
    const city=['银川','中卫','吴忠','石嘴山','固原'].find(value=>String(question).includes(value))
    answer=city?`${city}值得慢慢玩：${picks.map((value,index)=>`${discoveryLead(value,index)}${name(value)}，${phrase(value.intro)}`).join('；')}。不用急着全打卡，先选最合心意的一两处，${city}会更耐看。`:picks.map((value,index)=>`${discoveryLead(value,index)}${name(value)}，${phrase(value.intro)}`).join('；')+'。不用急着全打卡，先选最合心意的一两处，宁夏会更耐看。'
  }
  return personalityLayer.applyLocal(answer,personality)
}

function questionDomain(question,behavior){
  const value=String(question||'')
  if(behavior==='FOOD_GUIDE'||/美食|吃什么|羊肉|八宝茶|夜市|面食|蒿子面/.test(value))return 'FOOD'
  if(behavior==='STORY_EXPLANATION'||/历史|文化|西夏|岩画|非遗|中阿|丝路|丝绸之路|博物馆/.test(value))return 'HISTORY_CULTURE'
  if(/动物|野生|生态|自然|岩羊|蓝马鸡|金雕|荒漠猫|兔狲|鸟类|候鸟|植物|地质|贺兰山/.test(value))return 'ECOLOGY'
  if(/路线|行程|怎么玩|去哪玩|怎么走|交通|住宿|几天|公园|景区|夜市|夜游/.test(value))return 'TRAVEL'
  return 'GENERAL'
}

function domainMismatch(answer,domain){
  const value=String(answer||'')
  const signals={
    ECOLOGY:/动物|野生|生态|自然|岩羊|蓝马鸡|金雕|荒漠猫|兔狲|候鸟|保护|山地/,
    HISTORY_CULTURE:/历史|文化|西夏|岩画|遗址|丝路|非遗|博物馆/,
    FOOD:/美食|羊肉|八宝茶|面|早茶|夜市|味道/,
    TRAVEL:/景点|出行|游玩|路线|交通|行程|建议|公园|夜市|夜游|怎么走|父母|体力|休息/
  }
  return signals[domain]&&!signals[domain].test(value)
}

// Image checks are deliberately isolated from answer checks. At present text
// responses render no images; a visual mismatch must never replace grounded text.
function imageRelevanceIssue(){ return 'NONE' }

function poorFinalAnswer(answer,behavior,facts,question){
  if(behavior==='TRIP_PLAN'||behavior==='ADJUST_TRIP')return ''
  const value=String(answer||'').trim()
  if(/请选择|你更想了解|我可以(?:帮你)?(?:介绍|规划)|请输入需求|旅游规划|旅行规划|路线建议|行程安排|景区图片|推荐图片|第\s*[一二三四五六七八九十\d]+\s*天|day\s*[123]/i.test(value))return 'MECHANICAL_OR_TRIP_LANGUAGE'
  if(/系统占位|占位字符|没有具体想聊|没有具体内容|无法提供具体|请提供更多信息|我可以为你提供帮助|看起来你想了解/.test(value))return 'PLACEHOLDER_OR_GENERIC_RESPONSE'
  if(value.length<12)return 'TOO_SHORT'
  const domain=questionDomain(question,behavior)
  if(domainMismatch(value,domain))return `DOMAIN_MISMATCH_${domain}`
  const names=(facts||[]).map(item=>String(item.name&&item.name['zh-CN']||'')).filter(Boolean)
  if((behavior==='FOOD_GUIDE'||behavior==='STORY_EXPLANATION')&&names.length&&!names.some(name=>value.includes(name)))return 'MISSING_KNOWLEDGE_ANCHOR'
  return ''
}

async function ask(question,locale='zh-CN',itemId,options={}){
  console.log('[PET][QUESTION]',{inputLength:String(question||'').length})
  const responseBehavior=behaviorFor(question,options)
  const personality=options.personality||personalityLayer.resolve(options.intent,responseBehavior,options.context)
  const route=itemId?router.routeKnowledge(itemId):router.routeQuestion(question)
  console.log('[PET][ROUTER]',route.route==='ecology'?'ECOLOGY_AGENT':route.route==='culture'?'CULTURE_AGENT':route.route==='travel'?'TRAVEL_AGENT':'UNKNOWN')
  const resolvedCharacter=options.resolvedCharacter||taskContract.characterFor(options.intent)
  const agent=agentForCharacter(resolvedCharacter,agentFor(responseBehavior,route))
  const retrieval=knowledgePipeline.retrieve(question,factsForQuestion(question,itemId,options.responseMode),options.hostContext)
  options=Object.assign({},options,{evidenceTrace:retrieval.trace})
  const explicitlyKnown=namedFacts(question,itemId).length>0||Boolean(retrieval.trace&&retrieval.trace.evidence.some(e=>e.sourceType==='BUYER_DATA'))
  // Known 景点/美食仍由混元回答，但只允许它基于对应知识条目作答；
  // 真正开放、知识库没有对应实体的问题才进入开放通识回答。
  const hasCuratedAnswerType=responseBehavior==='FOOD_GUIDE'||responseBehavior==='STORY_EXPLANATION'||responseBehavior==='NIGHT_GUIDE'
  const useOpenModel=isCreativeQuestion(question)||(!hasCuratedAnswerType&&!explicitlyKnown&&(Boolean(options.forceOpen)||options.intent==='GENERAL_DISCOVERY'))
  console.log('[AI_PIPELINE]',`inputLength=${String(question||'').length} intent=${options.intent||''} behavior=${responseBehavior} selected_agent=${agent&&agent.id||'none'} resolvedCharacter=${resolvedCharacter} prompt_type=${useOpenModel?'open_answer':responseBehavior==='FOOD_GUIDE'?'food_answer':responseBehavior==='STORY_EXPLANATION'?'story_answer':responseBehavior==='TRIP_PLAN'?'trip_plan':'direct_answer'} final_mode=${responseBehavior==='TRIP_PLAN'?'itinerary_card':'text_first'}`)
  const facts=retrieval.facts
  const topicMatcher=/生态|自然|动物|野生|候鸟|湿地|湖|盐湖|山地/.test(String(question||''))?item=>item.category==='nature':null
  const scopeAudit=regionalScope.audit([...attractions,...foods],question,topicMatcher)
  console.log('[REGIONAL_SCOPE_RUNTIME]',{queryScope:scopeAudit.queryScope.scope,retrievedCount:scopeAudit.retrievedCount,topicMatchedCount:scopeAudit.topicMatchedCount,regionMatchedCount:scopeAudit.regionMatchedCount,entityValidatedCount:scopeAudit.entityValidatedCount,selectedKnowledgeCount:facts.length,rejectedCrossRegionCount:scopeAudit.rejectedCrossRegionCount})
  if(facts.length)console.log('[PET][KNOWLEDGE] grounded',{count:facts.length})
  const boundary=placeBoundary(question,explicitlyKnown)
  if(boundary&&boundary.type==='CONCEPT_ONLY'){
    return {source:'local-fallback',type:'CONCEPT_ONLY',answer:`“${boundary.item.scenicName}”目前在小程序中展示为联名视觉提案，尚未进入已核验的宁夏旅行知识目录。我不能据此编造景点介绍、开放信息、路线或旅行图片推荐；如需出行，请以官方信息为准。`,agent,character:resolvedCharacter,knowledgeIds:[],evidence:'concept_only',quality_gate:'CONCEPT_PLACE_BOUNDARY'}
  }
  if(boundary&&boundary.type==='UNKNOWN_PLACE'){
    return {source:'local-fallback',type:'UNKNOWN',answer:'这个具体景点目前不在小程序的宁夏本地景点目录里，我不能据此编造介绍、路线或图片。你可以换成目录中的景点名称，或以景区官方最新信息为准。',agent,character:resolvedCharacter,knowledgeIds:[],evidence:'unknown_catalog',quality_gate:'UNKNOWN_PLACE_BOUNDARY'}
  }
  if(!facts.length&&!useOpenModel)return {source:'local-fallback',type:'UNKNOWN',answer:guard.unknownFact(),agent,character:resolvedCharacter,knowledgeIds:[]}
  try{
    if(useOpenModel){
      const grounded=groundedAnswer.answerFor(question)
      if(grounded){
        return Object.assign({source:'grounded-knowledge',agent,evidence:'curated_general_fact',response_style:personality,quality_gate:'GROUNDED_FACT'},grounded)
      }
      const value=await cloudAI.askOpen(question,agent,facts,locale,options)
      const allowed=new Set(facts.map(item=>item.id))
      const knowledgeIds=(value.knowledgeIds||[]).filter(id=>allowed.has(id)&&guard.validateKnowledgeId(id))
      const answer=cleanAnswer(value.answer)
      const qualityIssue=poorFinalAnswer(answer,'DIRECT_ANSWER',facts,question)
      const imageIssue=imageRelevanceIssue(answer,question)
      if(qualityIssue){
        console.log('[FINAL_RESPONSE_QUALITY_GATE]',`behavior=OPEN_ANSWER result=${facts.length?'LOCAL_KNOWLEDGE_FALLBACK':'OPEN_ANSWER_REJECTED'} reason=${qualityIssue}`)
        if(facts.length)return {source:'local-fallback',type:'FACT',answer:localAnswer(facts,responseBehavior,personality,question),agent,knowledgeIds:facts.slice(0,5).map(item=>item.id),evidence:'knowledge',reason:qualityIssue,response_style:personality,quality_gate:qualityIssue}
        return {source:'local-fallback',type:'UNKNOWN',answer:'这个问题值得认真回答，但灵灵这次没有生成可靠内容。换一种说法再问一次，我会重新组织。',agent,knowledgeIds:[],reason:qualityIssue,quality_gate:qualityIssue}
      }
      console.log('[IMAGE_RELEVANCE_GATE]',`result=${imageIssue} action=TEXT_UNCHANGED`)
       return {source:'cloud',type:'OPEN_ANSWER',answer:personalityLayer.limit(answer,{max:260}),agent,character:resolvedCharacter,knowledgeIds,evidence:knowledgeIds.length?'knowledge+model':'model-general',response_style:personality,quality_gate:'OPEN_CLOUD_ANSWER',image_quality_gate:imageIssue}
    }
    const value=await cloudAI.askPet(question,agent,facts,locale,options)
    const allowed=new Set(facts.map(item=>item.id))
    const knowledgeIds=value.knowledgeIds.filter(id=>allowed.has(id))
    if(value.type==='REALTIME_UNVERIFIED'||guard.detectRealtimeClaim(value.answer))return {source:'cloud',type:'REALTIME_UNVERIFIED',answer:'实时信息暂未核验，请以官方最新信息为准。',agent,knowledgeIds}
    if(value.type==='UNKNOWN'||!knowledgeIds.length){
      if(hasCuratedAnswerType&&facts.length){
        return {source:'local-fallback',type:'FACT',answer:localAnswer(facts,responseBehavior,personality,question),agent,knowledgeIds:facts.slice(0,5).map(item=>item.id),evidence:'knowledge',reason:'CURATED_KNOWLEDGE_FALLBACK',response_style:personality,quality_gate:'CURATED_KNOWLEDGE_FALLBACK'}
      }
      return {source:'cloud',type:'UNKNOWN',answer:guard.unknownFact(),agent,knowledgeIds:[]}
    }
    const rawAnswer=String(value.answer||'')
    const qualityIssue=poorFinalAnswer(rawAnswer,responseBehavior,facts,question)
    const imageIssue=imageRelevanceIssue(rawAnswer,question)
    const answer=cleanAnswer(rawAnswer)
    if(responseBehavior!=='TRIP_PLAN'&&responseBehavior!=='ADJUST_TRIP'&&hasTripTemplate(answer)){
      console.log('[FINAL_RESPONSE_TRACE]',`inputLength=${String(question||'').length} intent=${options.intent||''} behavior=${responseBehavior} agent=${agent.id} prompt_type=${responseBehavior} formatter=trip_template_blocked image_renderer=none final_type=LOCAL_KNOWLEDGE_FALLBACK`)
      return {source:'local-fallback',type:'FACT',answer:localAnswer(facts,responseBehavior,personality,question),agent,knowledgeIds:facts.slice(0,5).map(item=>item.id),evidence:'knowledge',reason:'TRIP_TEMPLATE_BLOCKED',response_style:personality}
    }
    if(qualityIssue){
      console.log('[FINAL_RESPONSE_QUALITY_GATE]',`behavior=${responseBehavior} result=LOCAL_KNOWLEDGE_FALLBACK reason=${qualityIssue}`)
      return {source:'local-fallback',type:'FACT',answer:localAnswer(facts,responseBehavior,personality,question),agent,knowledgeIds:facts.slice(0,5).map(item=>item.id),evidence:'knowledge',reason:qualityIssue,response_style:personality,quality_gate:qualityIssue}
    }
    console.log('[FINAL_RESPONSE_QUALITY_GATE]',`behavior=${responseBehavior} result=CLOUD_POLISHED reason=OK`)
    console.log('[IMAGE_RELEVANCE_GATE]',`result=${imageIssue} action=TEXT_UNCHANGED`)
    return {source:'cloud',type:value.type||'FACT',answer:personalityLayer.polish(answer,personality),agent,character:resolvedCharacter,knowledgeIds,evidence:'knowledge',provenance:value.evidenceTrace||null,traceId:value.traceId,response_style:personality,quality_gate:'CLOUD_POLISHED',image_quality_gate:imageIssue}
  }catch(error){
    console.log('[PET][FALLBACK] local agent activated',{reason:error.message||'CLOUD_AI_ERROR'})
    if(!facts.length)return {source:'local-fallback',type:'UNKNOWN',answer:'灵灵暂时没连上混元，这个开放问题先记下了。稍后重新问一次，我会直接回答，不让你重新选择模式。',agent,knowledgeIds:[],reason:error.message||'CLOUD_AI_ERROR',response_style:personality,quality_gate:'OPEN_CLOUD_UNAVAILABLE'}
    return {source:'local-fallback',type:'FACT',answer:localAnswer(facts,responseBehavior,personality,question),agent,knowledgeIds:facts.slice(0,5).map(item=>item.id),evidence:'knowledge',reason:error.message||'CLOUD_AI_ERROR',response_style:personality,quality_gate:'CLOUD_ERROR_FALLBACK'}
  }
}

module.exports={ask,placeBoundary,questionDomain,domainMismatch,nightFacts,factsForQuestion}
