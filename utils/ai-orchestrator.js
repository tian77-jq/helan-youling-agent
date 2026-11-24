const cloudAI=require('./cloud-ai')
const tripAgent=require('./trip-agent')
const guard=require('./hallucination-guard')
const askPet=require('./ask-pet-ai')
const {responseModeRouter}=require('./response-mode-router')
const conversation=require('./conversation-state')
const conversationManager=require('./conversation-manager')
const touristMemory=require('./tourist-context-memory')
const formatter=require('./response-formatter')
const {styleFor}=require('./response-style')
const {parseTouristContext}=require('./tourist-context-parser')
const {responseBehaviorRouter}=require('./response-behavior-router')
const {cleanAnswer}=require('./response-formatter')
const config=require('../config/cloud')
const personalityLayer=require('./tourist-personality-layer')
const {parseTouristEntities}=require('./tourist-entity-parser')
const scenicVisionService=require('../services/scenicVisionService')
// Keep the release compatibility service reachable from the unified Agent Core;
// it adapts the existing local planner and does not create a second planner.
const tripService=require('../services/trip-service')
const taskContract=require('./task-contract')
const regionalStrategies=require('./trip-regional-strategies')
const feasibility=require('../services/plan-feasibility')

function pipelineTrace(data){console.log('[AI_PIPELINE_TRACE]',JSON.stringify(data))}
function promptType(behavior,entryMode){if(entryMode==='guide'&&behavior==='DIRECT_ANSWER')return 'open_answer';return behavior==='FOOD_GUIDE'?'food_answer':behavior==='NIGHT_GUIDE'?'night_answer':behavior==='STORY_EXPLANATION'?'story_answer':behavior==='TRIP_PLAN'?'trip_plan':behavior==='ADJUST_TRIP'?'adjustment':'direct_answer'}
function selectedAgent(behavior,character){const legacy={yanYang:'rock-goat',luoTuo:'camel',shaHu:'sand-fox'};return legacy[character]||'none'}
function tripContract(plan){
  if(!plan||!Array.isArray(plan.days))return plan
  return Object.assign({},plan,{daysPlan:plan.days.map((day,index)=>({day:index+1,theme:day.date||`第${index+1}天`,morning:(day.items||[]).filter(item=>/^08|^09|^10|^11/.test(String(item.time||''))),afternoon:(day.items||[]).filter(item=>/^12|^13|^14|^15|^16/.test(String(item.time||''))),evening:(day.items||[]).filter(item=>/^17|^18|^19|^20|^21/.test(String(item.time||''))),notes:[]}))})
}
function checkedPlan(plan,constraints){const checked=feasibility.evaluate(guard.guardPlan(plan),constraints||{});return {plan:tripContract(Object.assign({},checked.plan,{feasibility:checked.feasibility})),feasibility:checked.feasibility}}
function requestedUnknownPlace(value){
  const text=String(value||'').trim()
  const match=text.match(/[\u4e00-\u9fa5A-Za-z0-9·]{2,24}(?:景区|公园|古镇|寺|峡谷|陵|岩画|博物馆|影城|湖|石窟|沙漠|酒庄)/)
  return String(match&&match[0]||'宁夏小众旅行目的地').replace(/^(?:我|我们|游客)?(?:想|要|准备|计划)?去/,'').slice(-24)
}

function adjustmentText(instruction,parsed){
  if(!parsed||!parsed.changes)return instruction
  const changes=parsed.changes
  const labels=[]
  if(changes.pace==='slow'||changes.elderlyFriendly)labels.push('少走一点')
  if(changes.childFriendly)labels.push('适合亲子')
  if(changes.addFood)labels.push('增加美食')
  if(changes.lowerBudget)labels.push('预算降低')
  if(changes.changeStop)labels.push('换一个景点')
  if(changes.addCulture)labels.push('增加文化体验')
  return labels.join(' ')||instruction
}

async function plan(text,locale,hostContext){
  console.log('[TRIP_FLOW][ORCHESTRATOR_START]',{task:'plan',promptLength:String(text||'').length})
  const base=tripAgent.parseConstraints(text,locale)
  if(hostContext){base.city=hostContext.city;base.requestedStops=[hostContext.landmarkId];base.hostContext={landmarkId:hostContext.landmarkId,city:hostContext.city}}
  try{
    const constraints=await cloudAI.extractIntent(text,base,locale)
    const baseline=guard.guardPlan(tripAgent.planTrip(constraints,{locale}))
    try{
      const generated=await cloudAI.generateTripPlan(text,constraints,locale,baseline)
      console.log('[AI][CLOUD] planning completed',{engine:'cloud-ai-planner'})
      const checked=checkedPlan(generated,constraints);console.log('[PLAN_FEASIBILITY_TRACE]',JSON.stringify({checkerVersion:feasibility.VERSION,finalStatus:checked.feasibility.finalStatus,repairRounds:checked.feasibility.repairRounds.length,highViolationCount:checked.feasibility.highViolationCount,fallbackUsed:checked.feasibility.fallbackUsed})); return {plan:checked.plan,feasibility:checked.feasibility,source:'cloud',reason:'',engine:'cloud-ai-planner'}
    }catch(planError){
      console.log('[TRIP_FLOW][CLOUD_PLAN_FAIL]',{reason:planError.message||'CLOUD_AI_INVALID_TRIP_PLAN'})
      console.log('[AI][LOCAL] planning fallback',{after:'cloud_schema'})
      const checked=checkedPlan(baseline,constraints);return {plan:checked.plan,feasibility:checked.feasibility,source:'local-fallback',reason:planError.message||'CLOUD_AI_PLAN_FALLBACK',engine:'local-safe-fallback'}
    }
  }catch(error){
    console.log('[TRIP_FLOW][CLOUD_FAIL]',{reason:error.message||'CLOUD_AI_ERROR'}); console.log('[TRIP_FLOW][FALLBACK]',{task:'plan'}); const checked=checkedPlan(tripAgent.planTrip(base,{locale}),base);return {plan:checked.plan,feasibility:checked.feasibility,source:'local-fallback',reason:error.message||'CLOUD_AI_ERROR'}
  }
}

async function adjust(previousPlan,instruction,conversationState){
  const session=conversationManager.getSession(conversationState&&conversationState.sessionId)
  const context=touristMemory.ingest(instruction,session.sessionId)
  const modelContext=conversationManager.contextForModel(session,3)
  const latestHistoryInput=(session.history||[]).slice().reverse().find(item=>item.role==='user')
  const historyIntent=latestHistoryInput?responseModeRouter(latestHistoryInput.content,false).intent:'NONE'
  const finalInstruction=`当前问题 intent=ADJUST_TRIP；只调整已有路线，历史只用于补充游客画像。`
  console.log('[CONTEXT_PRIORITY_TRACE]',`inputLength=${String(instruction||'').length} history_count=${modelContext.historyCount} current_intent=ADJUST_TRIP history_intent=${historyIntent}`)
  const traceBase={sessionId:session.sessionId,input:String(instruction||'').slice(0,240),history:modelContext.recent,intent:'ADJUST_TRIP',behavior:'ADJUST_TRIP',resolvedCharacter:'shaHu',selected_agent:'sand-fox',prompt_type:'adjustment',messages_count:3,model:config.cloudAiModel}
  pipelineTrace(Object.assign({},traceBase,{final_response_type:'pending'}))
  console.log('[REAL_AI_TRACE]',`inputLength=${String(instruction||'').length} page=pages/trip/index.js sessionId=${session.sessionId} historyCount=${session.history.length} intent=ADJUST_TRIP behavior=TRIP_PLAN`)
  let normalized=instruction
  let reason=''
  try{normalized=adjustmentText(instruction,await cloudAI.interpretAdjustment(instruction,previousPlan.locale,{history:modelContext.recent,historySummary:modelContext.summary,historyCount:modelContext.historyCount,currentIntent:'ADJUST_TRIP',historyIntent,contextPriorityInstruction:finalInstruction,context}))}catch(error){reason=error.message||'CLOUD_AI_ERROR';console.log('[AI][CLOUD] failed',{task:'adjust_trip',reason});console.log('[AI][FALLBACK] local agent activated')}
  const adjusted=checkedPlan(tripAgent.adjustTrip(previousPlan,normalized),(previousPlan&&previousPlan.constraints)||{});const result={plan:adjusted.plan,feasibility:adjusted.feasibility,source:reason?'local-fallback':'cloud',reason}
  conversationManager.append(instruction,'行程已调整',session.sessionId)
  pipelineTrace(Object.assign({},traceBase,{final_response_type:'TRIP_PLAN'}))
  console.log('[REAL_AI_TRACE]',`agent=TRIP_AGENT prompt=adjustment model=${reason?'local-fallback':'cloud'} responseType=TRIP_ADJUSTMENT`)
  return result
}

async function respond(text,locale,existingPlan,conversationState,entryMode='auto',runtimeOptions={}){
  const isGuideEntry=entryMode==='guide'
  const session=conversationManager.getSession(conversationState&&conversationState.sessionId)
  let state=conversationState||conversation.load()
  let reference=conversation.resolveReference(text,state)
  // A short cultural follow-up (for example “注意事项？”) inherits only the
  // immediately preceding topic, not its response mode or trip-planning state.
  if(/^(?:注意事项|有什么要注意|注意什么)[？?！!。.]?$/.test(String(reference.text||'').trim())&&['ATTRACTION_QA','CULTURE_QA'].includes(state.last_intent)&&state.last_topic){
    const topic=guard.knowledgeItem(state.last_topic)
    if(topic)reference=Object.assign({},reference,{text:`${topic.name['zh-CN']}有什么值得了解和注意？`,entity:topic,referenced:true})
  }
  const priorContext=touristMemory.load(session.sessionId)
  const entities=parseTouristEntities(reference.text)
  if(runtimeOptions.hostContext){
    const host=runtimeOptions.hostContext
    if(!entities.cities.length&&!entities.destinations.length){entities.cities=[host.city];entities.destinations=[host.scenicName];entities.destinationIds=[host.landmarkId]}
  }
  console.log('[TOURIST_ENTITY_TRACE]',JSON.stringify({inputLength:reference.text.length,destinations:entities.destinationIds,cities:entities.cities,originCity:entities.originCity||null,companions:entities.companions,budget:entities.budget,days:entities.days,constraints:entities.constraints,preferences:entities.preferences}))
  const context=Object.assign({},parseTouristContext(reference.text),touristMemory.ingest(reference.text,session.sessionId))
  // Slot continuation has priority over a fresh intent classification. A
  // reply such as “银川” or “湖北襄阳” is first interpreted as the answer to
  // the question we just asked, never as a standalone QA query.
  const pending=state.pendingTripRequest
  let pendingOriginOnly=false
  let pendingRegionalChoice=false
  let pendingDurationOnly=false
  if(!isGuideEntry&&pending&&pending.awaitingSlot==='BASE_CITY'){
    const cityAnswer=entities.cities&&entities.cities[0]
    const bareOriginMatch=String(reference.text||'').trim().match(/^(湖北襄阳|襄阳|北京|上海|西安|兰州)$/)
    const originAnswer=entities.originCity||(bareOriginMatch&&bareOriginMatch[1])
    if(/还没决定|没决定|不知道从哪/.test(reference.text)){
      pendingRegionalChoice=true
      state=conversation.clearPendingTrip(state)
    }else if(cityAnswer){
      reference=Object.assign({},reference,{text:`${pending.originalInput}，主要从${cityAnswer}开始玩`})
      state=conversation.save(Object.assign({},state,{baseCity:cityAnswer,originCity:pending.tripSlots&&pending.tripSlots.originCity||state.originCity||null}))
      state=conversation.clearPendingTrip(state)
    }else if(originAnswer){
      pending.tripSlots=Object.assign({},pending.tripSlots,{originCity:originAnswer})
      state=conversation.save(Object.assign({},state,{originCity:originAnswer,baseCity:null}))
      pendingOriginOnly=true
      state=conversation.setPendingTrip(state,pending)
    }else{
      // A fresh question is not an answer to the base-city slot. Drop the
      // stale slot so phrases such as “宁夏有什么美食” cannot become a city.
      state=conversation.clearPendingTrip(state)
    }
  }else if(!isGuideEntry&&pending&&pending.awaitingSlot==='DURATION'&&entities.days){
    reference=Object.assign({},reference,{text:`${pending.originalInput}，${entities.days}天`})
    state=conversation.clearPendingTrip(state)
  }else if(!isGuideEntry&&pending&&pending.awaitingSlot==='DURATION'){
    const isConstraintOnly=Boolean((entities.companions&&entities.companions.length)||(entities.constraints&&entities.constraints.length)||(entities.preferences&&entities.preferences.length))&&!/[？?]|什么|怎么|哪里|推荐/.test(reference.text)
    if(isConstraintOnly){
      pending.originalInput=`${pending.originalInput}，${reference.text}`
      state=conversation.setPendingTrip(state,pending)
      pendingDurationOnly=true
    }else state=conversation.clearPendingTrip(state)
  }
  // The page entry is a hard product boundary: the Q&A entry never inherits
  // a planning mode from old turns, while the planning entry never silently
  // turns a knowledge question into a route.
  let detectedRouting=pendingOriginOnly
    ? {intent:'TRIP_NEEDS_BASE_CITY',confidence:0.99,response_mode:'trip_base_city',need_clarification:true,route:'travel',reason:'base_city_slot_continuation'}
    : pendingDurationOnly
      ? {intent:'TRIP_PLANNING_NEEDS_DURATION',confidence:0.99,response_mode:'trip_duration',need_clarification:true,route:'travel',reason:'duration_slot_context_update'}
    : responseModeRouter(reference.text,!!existingPlan)
  if(pendingRegionalChoice)detectedRouting={intent:'TRIP_REGIONAL_OPTIONS',confidence:0.99,response_mode:'trip_regional_options',need_clarification:false,route:'travel',reason:'regional_choice_required'}
  let routing=isGuideEntry&&['TRIP_PLANNING','ADJUST_TRIP','CLARIFICATION_REQUIRED'].includes(detectedRouting.intent)
    ? {intent:'GENERAL_DISCOVERY',confidence:0.99,response_mode:'text_exploration',need_clarification:false,route:'travel',reason:'q_and_a_entry'}
    : detectedRouting
  // 问答入口的未命中问题仍然是开放问题，不得被本地澄清模板截断。
  // 只有空输入才允许页面层拦截；非空文本统一交给 Hunyuan open-answer。
  if(isGuideEntry&&routing.intent==='CLARIFICATION_REQUIRED')routing={intent:'GENERAL_DISCOVERY',confidence:0.7,response_mode:'text_exploration',need_clarification:false,route:'travel',reason:'guide_open_question_fallback'}
  const hasPriorContext=priorContext.first_visit||(priorContext.companions&&priorContext.companions.length)||(priorContext.time)||(priorContext.location)||(priorContext.budget)||(priorContext.preferences&&priorContext.preferences.length)||(priorContext.action_limits&&priorContext.action_limits.length)
  // One day in Ningxia is actionable, but Ningxia is too large to pick a
  // departure city by popularity. Ask only for the blocking slot; preserve the
  // original request so the next chip tap can resume planning.
  if(!isGuideEntry&&routing.intent==='TRIP_PLANNING'&&entities.days<=2&&!entities.cities.length&&!entities.destinations.length&&!priorContext.location){
    routing={intent:'TRIP_NEEDS_BASE_CITY',confidence:0.99,response_mode:'trip_base_city',need_clarification:true,route:'travel',reason:'short_regional_trip_missing_base_city'}
    state=conversation.setPendingTrip(state,{originalInput:reference.text,taskType:'TRIP_PLANNING',tripSlots:{days:entities.days,destinationScope:entities.destinationScope||'宁夏',originCity:entities.originCity||'',arrivalCity:entities.arrivalCity||'宁夏',repeatVisitorHint:Boolean(entities.repeatVisitorHint)},missingSlots:['baseCity'],awaitingSlot:'BASE_CITY'})
  }
  if(!isGuideEntry&&routing.intent==='TRIP_PLANNING_NEEDS_DURATION')state=conversation.setPendingTrip(state,{originalInput:reference.text,taskType:'TRIP_PLANNING',tripSlots:{destinationScope:'宁夏'},missingSlots:['days'],awaitingSlot:'DURATION'})
  if(!isGuideEntry&&routing.intent==='ADJUST_TRIP'&&!existingPlan&&hasPriorContext){
    // A preference-only follow-up cannot create an itinerary without a
    // duration. Keep the preference in memory and collect the missing slot.
    routing={intent:'TRIP_PLANNING_NEEDS_DURATION',confidence:0.99,response_mode:'trip_duration',need_clarification:true,route:'travel',reason:'preference_follow_up_missing_duration'}
    state=conversation.setPendingTrip(state,{originalInput:reference.text,taskType:'TRIP_PLANNING',tripSlots:{destinationScope:'宁夏'},missingSlots:['days'],awaitingSlot:'DURATION'})
  }
  // entryMode is only a UI hint. It must never convert an unrelated or
  // underspecified utterance into a trip task.
  if(routing.intent==='META_SYSTEM'||routing.intent==='OUT_OF_DOMAIN'){
    const isMeta=routing.intent==='META_SYSTEM'
    const response={source:'local-fallback',type:routing.intent,answer:isMeta?'当前项目将腾讯混元生成能力与宁夏文旅知识库、任务路由和原创角色人格结合使用；模型输出会经过知识与安全约束，不宣称自研大模型。':'这个问题不属于宁夏文旅的服务范围，不会写入你的行程偏好。你可以继续问宁夏景点、文化、生态、美食或旅行安排。',agent:null,knowledgeIds:[],quality_gate:isMeta?'META_SYSTEM_BOUNDARY':'OUT_OF_DOMAIN_BOUNDARY'}
    const behavior={response_behavior:'DIRECT_ANSWER',need_clarification:false}
    const formatted=formatter.format(routing,response,behavior)
    conversationManager.append(text,response.answer,session.sessionId)
    console.log('[CURRENT_TURN_BOUNDARY]',JSON.stringify({inputLength:text.length,intent:routing.intent,tripStatePreserved:Boolean(existingPlan)}))
    return Object.assign(routing,{kind:'text',context,behavior,response_behavior:behavior.response_behavior,result:response,format:formatted,sessionId:session.sessionId,conversationState:Object.assign(conversation.update(state,routing,response,text),{sessionId:session.sessionId})})
  }
  const behavior=responseBehaviorRouter(routing,context)
  const contract=taskContract.contract(routing)
  const resolvedCharacter=contract.character
  const personality=personalityLayer.resolve(routing.intent,behavior.response_behavior,context)
  const modelContext=conversationManager.contextForModel(session,3)
  const latestHistoryInput=(session.history||[]).slice().reverse().find(item=>item.role==='user')
  const historyIntent=latestHistoryInput?responseModeRouter(latestHistoryInput.content,false).intent:'NONE'
  const intentOverride=historyIntent!=='NONE'&&historyIntent!==routing.intent
  const finalInstruction=intentOverride
    ? `当前问题 intent=${routing.intent} 与历史 intent=${historyIntent} 不同；必须回答当前问题，历史仅可提供游客画像，禁止延续历史的回答模式。`
    : `当前问题 intent=${routing.intent}；历史只用于补充游客画像，不得替代当前问题。`
  console.log('[CONTEXT_PRIORITY_TRACE]',`inputLength=${String(text||'').length} history_count=${modelContext.historyCount} current_intent=${routing.intent} history_intent=${historyIntent}`)
  const traceBase={sessionId:session.sessionId,entry_mode:entryMode,inputLength:String(text||'').length,historyCount:modelContext.historyCount,intent:routing.intent,taskType:contract.intent,behavior:behavior.response_behavior,resolvedCharacter,selected_agent:selectedAgent(behavior.response_behavior,resolvedCharacter),prompt_type:promptType(behavior.response_behavior,entryMode),messages_count:3,model:config.cloudAiModel}
  pipelineTrace(Object.assign({},traceBase,{final_response_type:'pending'}))
  console.log('[REAL_AI_TRACE]',`inputLength=${String(text||'').length} page=pages/trip/index.js sessionId=${session.sessionId} historyCount=${session.history.length} intent=${routing.intent} behavior=${behavior.response_behavior}`)
  console.log('[AI][RESPONSE_ROUTER]',{intent:routing.intent,response_behavior:behavior.response_behavior,sessionId:session.sessionId})
  if(routing.intent==='TRIP_REGIONAL_OPTIONS'){
    const days=pending&&pending.tripSlots&&pending.tripSlots.days||entities.days||2
    const options=regionalStrategies.filter(item=>item.duration[0]<=days&&item.duration[1]>=days)
    const response={source:'local-fallback',type:'TRIP_REGIONAL_OPTIONS',answer:days<=1?'一天不适合跨很多城市，我先给你几个有依据的起点方向：':'第一次来、两天左右又想兼顾景区和美食，可以先选一种区域节奏：',agent:null,knowledgeIds:[],regionalOptions:(options.length?options:regionalStrategies).map(item=>({id:item.id,label:item.label,description:item.why,prompt:`${pending.originalInput}，选择${item.label}`}))}
    const formatted=formatter.format(routing,response,behavior)
    conversationManager.append(text,response.answer,session.sessionId)
    return Object.assign(routing,{kind:'text',context,contract,resolvedCharacter,behavior,response_behavior:behavior.response_behavior,result:response,format:formatted,sessionId:session.sessionId,conversationState:conversation.update(state,routing,response,text)})
  }
  if(routing.intent==='TRIP_DISCOVERY'){
    const response={source:'local-fallback',type:'TRIP_DISCOVERY',answer:'欢迎来宁夏。你是想先看看哪里值得去，还是直接让我帮你规划？',agent:null,knowledgeIds:[],tripDiscoveryOptions:['看看有什么好玩','直接规划','今晚怎么玩','找宁夏美食']}
    const formatted=formatter.format(routing,response,behavior)
    conversationManager.append(text,response.answer,session.sessionId)
    return Object.assign(routing,{kind:'text',context,contract,resolvedCharacter,behavior,response_behavior:behavior.response_behavior,result:response,format:formatted,sessionId:session.sessionId,conversationState:conversation.update(state,routing,response,text)})
  }
  // The planning page also accepts ordinary questions. Only explicit route
  // requests enter the itinerary renderer; other questions use open-answer.
  if(behavior.need_clarification){console.log('[AI_PIPELINE]',`intent=${routing.intent} behavior=${behavior.response_behavior} selected_agent=CLARIFICATION prompt_type=clarification final_mode=clarification`);const durationPrompt=routing.intent==='TRIP_PLANNING_NEEDS_DURATION';const baseCityPrompt=routing.intent==='TRIP_NEEDS_BASE_CITY';const slotPrompt=routing.intent==='NEED_DESTINATION_AND_DURATION';const pendingDays=state.pendingTripRequest&&state.pendingTripRequest.tripSlots&&state.pendingTripRequest.tripSlots.days;const dayLabel=pendingDays||entities.days||'';const dayText=dayLabel?`${dayLabel}天`:'这段时间';const originLabel=state.originCity||entities.originCity;const response={source:'local-fallback',type:durationPrompt?'TRIP_PLANNING_NEEDS_DURATION':baseCityPrompt?'TRIP_NEEDS_BASE_CITY':slotPrompt?'NEED_DESTINATION_AND_DURATION':'CLARIFICATION',answer:durationPrompt?'好，先把时间告诉我，我就能帮你把宁夏排得舒服一点。':baseCityPrompt?`${originLabel?`记住了，你从${originLabel}来。`:''}到宁夏后这${dayText}想从哪个城市开始？银川 / 中卫 / 吴忠 / 固原 / 石嘴山`:slotPrompt?'想去宁夏哪个城市或区域？大概玩几天？我会按你的时间先排一版可执行路线。':formatter.clarification(),agent:null,character:resolvedCharacter,knowledgeIds:[],clarificationDays:dayLabel,durationOptions:durationPrompt?['半天','1天','2天','3天','4天','5天+']:[],baseCityOptions:baseCityPrompt?['银川','中卫','吴忠','固原','石嘴山','我还没决定']:[]};const formatted=formatter.format(routing,response,behavior);conversationManager.append(text,response.answer,session.sessionId);pipelineTrace(Object.assign({},traceBase,{selected_agent:'none',prompt_type:'clarification',final_response_type:response.type}));console.log('[FINAL_RESPONSE_TRACE]',`intent=${routing.intent} behavior=${behavior.response_behavior} agent=none prompt_type=clarification formatter=${formatted.formatter} image_renderer=${formatted.image_renderer} final_type=${formatted.output_type}`);return Object.assign(routing,{kind:'text',context,contract,resolvedCharacter,behavior,response_behavior:behavior.response_behavior,result:response,format:formatted,sessionId:session.sessionId,conversationState:conversation.update(state,routing,response,text)})}
  if(behavior.response_behavior==='TRIP_PLAN'&&routing.intent==='TRIP_PLANNING'){
    const boundary=askPet.placeBoundary(reference.text,false)
    if(boundary){
      const concept=boundary.type==='CONCEPT_ONLY'
      const unknownName=concept?boundary.item.scenicName:requestedUnknownPlace(reference.text)
      const visual=concept?null:await scenicVisionService.generateTravelImage({scenicName:unknownName,scene:unknownName,userPrompt:reference.text,description:'根据游客需求生成旅行氛围参考，不代表景区真实外观',cultureTags:['宁夏','贺兰山','黄河文化'],style:'真实摄影风格'})
      const response={source:'local-fallback',type:boundary.type,answer:concept?`“${boundary.item.scenicName}”目前仅是小程序中的联名视觉提案，尚未进入已核验旅行目录，因此不能为它编造路线、开放信息或景区图片推荐。请换成已收录景点，或以官方信息为准。`:`“${unknownName}”目前不在已核验的宁夏本地景点目录中，因此我不会编造票价、开放信息或交通数据。下面的图片仅是腾讯混元生成的旅行效果预览，不代表目的地真实外观；实际出行请先核对官方资料。`,agent:null,knowledgeIds:[],visual}
      const formatted=formatter.format(Object.assign({},routing,{response_mode:'text_exploration'}),response,{response_behavior:'DIRECT_ANSWER'})
      conversationManager.append(text,response.answer,session.sessionId)
      pipelineTrace(Object.assign({},traceBase,{selected_agent:'none',prompt_type:'place_boundary',final_response_type:boundary.type}))
      return Object.assign(routing,{kind:'text',context,behavior:{response_behavior:'DIRECT_ANSWER'},response_behavior:'DIRECT_ANSWER',response_style:personality,result:response,format:formatted,sessionId:session.sessionId,conversationState:conversation.update(state,routing,response,text)})
    }
    console.log('[AI_PIPELINE]',`inputLength=${String(text||'').length} intent=${routing.intent} behavior=${behavior.response_behavior} selected_agent=sand-fox prompt_type=trip_plan final_mode=itinerary_card`);const result=await plan(`${reference.text}\n游客上下文：${touristMemory.prompt(context)}`,locale,runtimeOptions.hostContext);const formatted=formatter.format(routing,result,behavior);conversationManager.append(text,result.plan&&result.plan.summary||'行程已生成',session.sessionId);pipelineTrace(Object.assign({},traceBase,{final_response_type:'TRIP_PLAN'}));console.log('[FINAL_RESPONSE_TRACE]',`inputLength=${String(text||'').length} intent=${routing.intent} behavior=${behavior.response_behavior} agent=sand-fox prompt_type=trip_plan formatter=${formatted.formatter} image_renderer=${formatted.image_renderer} final_type=${formatted.output_type}`);return Object.assign(routing,{kind:'plan',context,contract,resolvedCharacter,behavior,response_behavior:behavior.response_behavior,response_style:personality,result,format:formatted,sessionId:session.sessionId,conversationState:conversation.update(state,routing,result,text)})}
  if(routing.intent==='ADJUST_TRIP'){
    if(existingPlan){const result=await adjust(existingPlan,text,{sessionId:session.sessionId});const formatted=formatter.format(routing,result,behavior);console.log('[FINAL_RESPONSE_TRACE]',`inputLength=${String(text||'').length} intent=${routing.intent} behavior=${behavior.response_behavior} agent=camel prompt_type=adjustment formatter=${formatted.formatter} image_renderer=${formatted.image_renderer} final_type=${formatted.output_type}`);return Object.assign(routing,{kind:'plan',context,behavior,response_behavior:behavior.response_behavior,response_style:personality,result,format:formatted,sessionId:session.sessionId,conversationState:conversation.update(state,routing,result,text)})}
    const response={source:'local-fallback',type:'CLARIFICATION',answer:'告诉我出行时间或目的地，我就能把这个偏好放进行程。',agent:null,knowledgeIds:[]};const formatted=formatter.format(routing,response,behavior);conversationManager.append(text,response.answer,session.sessionId);console.log('[FINAL_RESPONSE_TRACE]',`inputLength=${String(text||'').length} intent=${routing.intent} behavior=${behavior.response_behavior} agent=none prompt_type=clarification formatter=${formatted.formatter} image_renderer=${formatted.image_renderer} final_type=${formatted.output_type}`);return Object.assign(routing,{kind:'text',context,behavior,response_behavior:behavior.response_behavior,result:response,format:formatted,sessionId:session.sessionId,conversationState:conversation.update(state,routing,response,text)})
  }
  const result=await askPet.ask(reference.text,locale,reference.entity&&reference.entity.id,{hostContext:runtimeOptions.hostContext,responseMode:routing.response_mode,style:styleFor(routing.intent),context,responseBehavior:behavior.response_behavior,history:modelContext.recent,historySummary:modelContext.summary,historyCount:modelContext.historyCount,currentIntent:routing.intent,historyIntent,contextPriorityInstruction:finalInstruction,intent:routing.intent,forceOpen:isGuideEntry,personality,resolvedCharacter})
  result.answer=cleanAnswer(result.answer)
  conversationManager.append(text,result.answer,session.sessionId)
  const formatted=formatter.format(routing,result,behavior)
  pipelineTrace(Object.assign({},traceBase,{selected_agent:result.agent&&result.agent.id||'none',final_response_type:result.type||'UNKNOWN'}))
  console.log('[REAL_AI_TRACE]',`agent=${result.agent&&result.agent.id||'none'} final_mode=${routing.response_mode||'text_first'} responseType=${result.type||'UNKNOWN'} textLength=${String(result.answer||'').length}`)
  console.log('[FINAL_RESPONSE_TRACE]',`inputLength=${String(text||'').length} intent=${routing.intent} behavior=${behavior.response_behavior} agent=${result.agent&&result.agent.id||'none'} prompt_type=${promptType(behavior.response_behavior,entryMode)} formatter=${formatted.formatter} image_renderer=${formatted.image_renderer} final_type=${formatted.output_type}`)
  return Object.assign(routing,{kind:'text',context,contract,resolvedCharacter,behavior,response_behavior:behavior.response_behavior,response_style:personality,result,referencedEntity:reference.entity||null,format:formatted,sessionId:session.sessionId,conversationState:Object.assign(conversation.update(state,routing,result,text),{sessionId:session.sessionId})})
}

async function askPetThroughPipeline(text,locale,itemId){
  const session=conversationManager.getSession()
  const routed=await respond(text,locale,null,{sessionId:session.sessionId,turns:[]})
  if(routed.result&&typeof routed.result==='object'){
    routed.result.pipelineFormat=routed.format
    routed.result.pipelineRouting={sessionId:routed.sessionId,intent:routed.intent,behavior:routed.response_behavior,response_style:routed.response_style}
  }
  return routed.result
}

module.exports={plan,adjust}
module.exports.respond=respond
module.exports.askPet=askPetThroughPipeline
module.exports.evaluateOpenAnswer=cloudAI.evaluateOpenAnswer
module.exports.startNewSession=conversationManager.startNewSession
module.exports.restoreSession=conversationManager.restoreSession
