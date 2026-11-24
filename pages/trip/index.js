const tracker=require('../../utils/tracker')
const aiOrchestrator=require('../../utils/ai-orchestrator')
const conversationGateway=require('../../utils/conversation-gateway')
const safeMode=require('../../utils/competition-safe-mode')
const smoke=require('../../utils/cloud-ai-smoke')
const {attractions,foods,agents}=require('../../knowledge/index')
const runtimeState=require('../../utils/runtime-state')
const conversation=require('../../utils/conversation-state')
const conversationManager=require('../../utils/conversation-manager')
const scenicVisionService=require('../../services/scenicVisionService')
const digitalAvatar=require('../../services/digital-avatar-service')
const shareObject=require('../../utils/share-object-builder')
const hostRuntime=require('../../utils/host-runtime')
const themeContract=require('../../design-tokens/theme-contract')
const motionTokens=require('../../design-tokens/motion-tokens')
const sceneEntry=require('../../utils/scene-entry-controller')
const characterMotionKit=require('../../design-tokens/character-motion-kit')
const tripVisualResolver=require('../../utils/trip-visual-resolver')
const workspaceState=require('../../utils/ai-workspace-state')
const i18n=require('../../utils/i18n-runtime')

const GUIDE_TASKS_ZH=[
  '贺兰山有哪些特色动物？',
  '西夏陵为什么重要？',
  '银川晚上去哪玩？',
  '为什么宁夏被称为塞上江南？'
]
const PLAN_TASKS_ZH=['明天带父母在银川玩一天，不想走太多路','第一次来宁夏，两天时间，喜欢历史和美食','预算300元，学生，两个人，想去贺兰山','带7岁孩子去沙坡头，安排完整一天']
const ADJUSTMENTS=['少走一点','换一个景点','增加美食','预算降低','适合亲子','适合老人','增加文化体验','重新规划']
const LOCALES=[{id:'zh-CN',label:'简体中文'},{id:'en-US',label:'English'},{id:'ar',label:'العربية'}]
function topicViews(locale){return attractions.slice(0,6).map(item=>Object.assign({},item,{displayName:item.name[locale]||item.name['zh-CN']}))}
function quickTasks(locale,mode='guide'){
  if(locale==='ar')return mode==='plan'?['يوم هادئ في ينشوان مع والديّ','أول زيارة إلى نينغشيا لمدة يومين، أحب التاريخ والطعام','طالبان قرب جبل هيلان بميزانية 300 يوان','يوم كامل في شاطئ الرمال مع طفل عمره 7 سنوات']:['ما الأطعمة المحلية التي تنصحني بتجربتها؟','ما الذي يميز رسوم جبل هيلان الصخرية؟','اكتب تحية قصيرة للنهر الأصفر في نينغشيا','لماذا تُسمى نينغشيا واحة ما وراء السور العظيم؟']
  if(mode==='plan'){
    if(locale==='en-US')return ['A relaxed full day in Yinchuan with my parents','First time in Ningxia, two days, interested in history and food','Two students near Helan Mountain with a 300 RMB budget','A complete day at Shapotou with a 7-year-old']
    return PLAN_TASKS_ZH
  }
  if(locale==='en-US')return ['What local food should I try in Ningxia?','What is special about Helan Mountain rock art?','Write a short tribute to the Yellow River in Ningxia','Why is Ningxia called the oasis beyond the Great Wall?']
  return GUIDE_TASKS_ZH
}
function adjustmentViews(locale){const en=['Less walking','Change a stop','Add local food','Lower the budget','Family-friendly','Senior-friendly','Add culture','Replan'];const ar=['مشي أقل','غيّر محطة','أضف طعاماً محلياً','خفّض الميزانية','مناسب للعائلة','مناسب لكبار السن','أضف تجربة ثقافية','أعد التخطيط'];return ADJUSTMENTS.map((key,index)=>({key,label:locale==='en-US'?en[index]:locale==='ar'?ar[index]:key}))}
function attachScenicVisuals(plan,userPrompt){
  try{
    const resolvedPlan=tripVisualResolver.resolvePlan(plan)
    const days=(resolvedPlan&&resolvedPlan.days||[]).map(day=>Object.assign({},day,{items:(day.items||[]).map(item=>{
      if(item.type!=='attraction')return item
      const visual=scenicVisionService.resolveScenicVision({scenicId:item.knowledgeId||item.id,scenicName:item.name,userPrompt,location:item.city||'宁夏'})
      return Object.assign({},item,{image:visual.image||item.image||'',visual,sceneId:item.sceneId,landmarkId:item.landmarkId,character:item.character,aiAction:item.aiAction,region:item.region,city:item.city})
    })}))
    return Object.assign({},resolvedPlan,{days,visionMode:'LOCAL_ONLY',visionArchitecture:'LANDMARK_SCOPED'})
  }catch(error){
    console.error('[SCENIC_VISION][PLAN_DECORATE_FAIL]',error)
    return plan
  }
}
function visibleResponseTrace(input,routing,payload,kind){
  const style=routing&&routing.response_style||payload&&payload.response_style||{}
  const text=kind==='plan'?payload&&payload.plan&&payload.plan.summary:payload&&payload.answer
  const selected=payload&&payload.agent&&payload.agent.id||(kind==='plan'?'camel':'none')
  console.log('[USER_VISIBLE_RESPONSE_TRACE]',{sessionId:routing&&routing.sessionId||payload&&payload.pipelineRouting&&payload.pipelineRouting.sessionId||'unknown',intent:routing&&routing.intent||payload&&payload.pipelineRouting&&payload.pipelineRouting.intent||'unknown',behavior:routing&&routing.response_behavior||payload&&payload.pipelineRouting&&payload.pipelineRouting.behavior||'unknown',responseStyle:style.name||payload&&payload.pipelineRouting&&payload.pipelineRouting.response_style&&payload.pipelineRouting.response_style.name||'unknown',selectedAgent:selected,qualityGate:payload&&payload.quality_gate||'not_applicable',textLength:String(text||'').length})
}

Page({
  data:{prompt:'',scenicId:'ningxia',hostContext:null,shapotouStory:null,sceneToken:themeContract.resolve('MOUNTAIN'),motionToken:motionTokens.grammar.MOUNTAIN,motionMode:'FULL',characterMotionKit,quickTasks:PLAN_TASKS_ZH,adjustments:adjustmentViews('zh-CN'),durationOptions:[],baseCityOptions:[],tripDiscoveryOptions:[],regionalOptions:[],clarificationDays:'',locales:LOCALES,locale:'zh-CN',isRtl:false,loading:false,loadingText:'',error:'',plan:null,planAvatar:null,showFullAnswer:false,hasPlan:false,petAnswer:null,responseRouting:null,conversationState:conversation.load(),isGuideMode:false,agents,guideTopics:topicViews('zh-CN'),mode:'plan',addedItems:[],voiceSheetVisible:false,voiceSheetTitle:'',voiceSheetBody:'',workspace:workspaceState.createState()},
  onLoad(options){
    options=options||{}
    const hostContext=options.source==='host-demo'?hostRuntime.active():null
    if(hostContext)hostRuntime.record('AI_ENTRY',{},hostContext)
    const scenicId=options.scenic==='shapotou'?'shapotou':'ningxia'
    console.log('[AI_RUNTIME_BUILD] unified-conversation-gateway-20260823-14')
    const session=conversationManager.startNewSession()
    const pending=runtimeState.consumePendingTripRequest()
    // Locale is application state: route payloads cannot create a competing
    // page-specific language state or revive a stale locale on re-entry.
    const locale=i18n.getCurrentLocale()
    let prompt=pending&&pending.query!==undefined?pending.query:(pending&&pending.prompt!==undefined?pending.prompt:(options.prompt||''))
    try{if(typeof prompt==='string'&&prompt.includes('%'))prompt=decodeURIComponent(prompt)}catch(error){console.error('[TRIP][AUTO_PLAN][FAIL]',{errMsg:error.message})}
    const mode=pending&&pending.mode?pending.mode:(options.panel==='qa'||options.mode==='guide'?'guide':'plan')
    const resumeRequested=!pending&&options.mode==='resume'
    const workspace=workspaceState.createState({activePanel:options.panel||((mode==='guide')?'qa':'trip'),entrySource:options.source||'trip'})
    const currentTrip=runtimeState.get('currentTrip',null)
    this.setData({locale,prompt,mode,scenicId,hostContext,workspace,plan:resumeRequested?currentTrip:null,hasPlan:!!(resumeRequested&&currentTrip&&currentTrip.days&&currentTrip.days.length),sceneToken:themeContract.resolve(scenicId==='shapotou'?'SHAPOTOU':'MOUNTAIN'),motionToken:motionTokens.grammar[scenicId==='shapotou'?'SHAPOTOU':'MOUNTAIN'],isGuideMode:mode==='guide',guideTopics:topicViews(locale),quickTasks:quickTasks(locale,mode),adjustments:adjustmentViews(locale),addedItems:currentTrip&&currentTrip.addedItems||[],conversationState:Object.assign(conversation.empty(),{sessionId:session.sessionId})})
    this.applyLocale(locale)
    console.log('[TRIP_FLOW][PAGE_ONLOAD]',{mode,locale})
    if(mode==='guide')console.log('[TRIP][RUNTIME] mode=guide')
    const channel=this.getOpenerEventChannel&&this.getOpenerEventChannel()
    if(channel&&typeof channel.on==='function')channel.on('homePlan',data=>{if(data&&data.autoStart&&!this.data.loading){console.log('[TRIP][RUNTIME] eventChannel prompt received');this.setData({prompt:String(data.prompt||''),isGuideMode:false,mode:'plan'},()=>this.generate())}})
    if(prompt)console.log('[TRIP_FLOW][QUERY_RECEIVED]',{length:prompt.length,source:pending&&pending.source||'page-options'})
    if(options&&options.smoke==='1')smoke.runCloudAiSmokeTest().then(result=>{if(!result.pass)this.setData({error:'Cloud AI Smoke Test 未通过，请查看开发者工具 Console。'})})
    tracker.trackEvent('home_view',{page:'trip',locale})
    if(prompt&&(pending?pending.autoStart!==false:true)){console.log('[TRIP_FLOW][AUTOSTART]',{mode});this.setData({},()=>this.generate(prompt))}
  },
  onReady(){console.log('[PAGE][TRIP] onReady')},
  switchWorkspacePanel(e){
    const panel=e&&e.currentTarget&&e.currentTarget.dataset&&e.currentTarget.dataset.panel
    if(!workspaceState.PANELS.includes(panel))return
    if(panel===this.data.workspace.activePanel)return
    if(this.data.loading){wx.showToast({title:'本次回答完成后可切换',icon:'none'});return}
    const previous=workspaceState.createState(this.data.workspace)
    previous[previous.activePanel+'State'].view=workspaceState.capture(this.data)
    const workspace=workspaceState.switchPanel(previous,panel)
    runtimeState.set('workspaceState',workspace)
    const nextMode=panel==='qa'?'guide':'plan'
    const restored=workspaceState.restore(workspace,panel)
    this.setData(Object.assign(restored,{workspace,isGuideMode:panel==='qa',mode:nextMode,hasPlan:!!(this.data.plan&&this.data.plan.days),quickTasks:quickTasks(this.data.locale,nextMode),conversationState:restored.conversationState||this.data.conversationState,workspacePulse:false}),()=>this.setData({workspacePulse:true}))
  },
  onShow(){
    i18n.bindPage(this,this.applyLocale)
    sceneEntry.activate(this,this.data.scenicId==='shapotou'?'SHAPOTOU':'MOUNTAIN')
    const currentTrip=runtimeState.get('currentTrip',null)
    const pending=runtimeState.consumePendingTripRequest()
    if(pending&&typeof pending==='object'&&('query' in pending||'prompt' in pending||'mode' in pending)){
      const prompt=String(pending.query||pending.prompt||'')
      const isGuide=pending.mode==='guide'
      const locale=i18n.getCurrentLocale()
      console.log('[TRIP_FLOW][QUERY_RECEIVED]',{length:prompt.length,source:pending.source||'unknown'})
      const mode=isGuide?'guide':'plan'
      this.setData({prompt,locale,mode,isGuideMode:isGuide,quickTasks:quickTasks(locale,mode),error:'',petAnswer:null},()=>{if(prompt&&pending.autoStart!==false)this.generate()})
    }else if(currentTrip)this.setData({addedItems:currentTrip.addedItems||[]})
  },
  onUnload(){this.destroyed=true;this.requestId=(this.requestId||0)+1;if(this.__localeUnsubscribe)this.__localeUnsubscribe()},
  applyLocale(locale){const uiKeys=['panelCollapse','panelExpand','hostCulture','hostReturn','hostMemory','hostContext','shapotouDemo','stageRiver','stageDesert','stageSunset','stageStars','guideStart','loading','durationTitle','durationCopy','cityTitle','stepTitle','regionTitle','verifiedOnly','sourceHunyuan','sourceKnowledge','subtitleMode','audioMode','fullAnswer','collapseAnswer','aiContent','imageUnavailable','generationUnavailable','latestNotice','retry','home','listenPlan','stop','routeTitle','routeCopy','modify','food','rest','transit','destination','argaliGuide','foxGuide','camelGuide','beforeGo','shapotouTitle','listenStory','saveMemory','added','createMemory','share','creationTitle','creationCopy','currentRoute','qaContent','textCard','aiMemory','savedLocal','saveLocal','continueChat','viewSubtitles','gotIt','budget','scheduledItems','relaxedPace','balancedPace','hostIntro','brandKicker','routeGuideKicker','createPanel','savedStatus','plannedStatus','discoveryStatus'];const localeText={title:i18n.t('trip.title',locale),subtitle:i18n.t('trip.subtitle',locale),generate:i18n.t('trip.generate',locale),placeholder:i18n.t('trip.placeholder',locale),topics:i18n.t('trip.topics',locale),itinerary:i18n.t('trip.itinerary',locale),safety:i18n.t('trip.safety',locale),evidence:i18n.t('trip.evidence',locale),memory:i18n.t('trip.memory',locale),qa:i18n.t('trip.qa',locale),route:i18n.t('trip.route',locale),creation:i18n.t('trip.creation',locale),day:i18n.t('trip.day',locale)};uiKeys.forEach(key=>{localeText[key]=i18n.t(`tripUi.${key}`,locale)});this.setData({locale,isEnglish:locale==='en-US',isRtl:i18n.isRtl(locale),guideTopics:topicViews(locale),quickTasks:quickTasks(locale,this.data.mode),adjustments:adjustmentViews(locale),localeText})},
  inputPrompt(e){const value=e&&e.detail&&e.detail.value!==undefined?String(e.detail.value):'';console.log('[TRIP_INPUT_TRACE]',{event:'input',field:'prompt',inputLength:value.length,mode:this.data.mode});this.setData({prompt:value,error:''})},
  useQuick(e){this.setData({prompt:e.currentTarget.dataset.prompt},()=>this.generate())},
  chooseDuration(e){const value=String(e.currentTarget.dataset.duration||'');const base=String(this.data.prompt||'').trim();if(!value||!base)return;this.setData({prompt:`${base}，${value}`},()=>this.generate())},
  chooseBaseCity(e){const value=String(e.currentTarget.dataset.city||'').trim();const base=String(this.data.prompt||'').trim();if(!value||!base)return;const prompt=value==='我还没决定'?`${base}，我还没决定，请推荐区域路线`:`${base}，主要从${value}开始玩`;this.setData({prompt,baseCityOptions:[]},()=>this.generate())},
  chooseDiscovery(e){const value=String(e.currentTarget.dataset.prompt||'').trim();if(!value)return;const prompt=value==='直接规划'?'帮我规划宁夏旅行':value;this.setData({prompt,tripDiscoveryOptions:[]},()=>this.generate())},
  chooseRegional(e){const prompt=String(e.currentTarget.dataset.prompt||'').trim();if(!prompt)return;this.setData({prompt,regionalOptions:[]},()=>this.generate())},
  changeLocale(e){
    const locale=e.currentTarget.dataset.locale
    i18n.setCurrentLocale(locale)
  },
  generate(eventOrPrompt){
    if(this.data.loading)return
    const eventPrompt=eventOrPrompt&&eventOrPrompt.currentTarget&&eventOrPrompt.currentTarget.dataset?eventOrPrompt.currentTarget.dataset.prompt:undefined
    const promptOverride=typeof eventOrPrompt==='string'?eventOrPrompt:eventPrompt
    const prompt=String(promptOverride===undefined?this.data.prompt:promptOverride||'').trim()
    console.log('[TRIP_SUBMIT_TRACE]',{mode:this.data.mode,fromButton:Boolean(eventPrompt),length:prompt.length})
    if(!prompt){this.setData({error:'请先告诉灵灵你的时间、同行人或旅行偏好。'});return}

    runtimeState.set('currentQuery',prompt)
    const liveSession=conversationManager.getSession(this.data.conversationState&&this.data.conversationState.sessionId)
    console.log('[FINAL_AI_CHAIN]',{entry:'pages/trip/index.js',mode:this.data.mode,sessionId:liveSession.sessionId,inputLength:prompt.length})
    const requestId=(this.requestId||0)+1
    this.requestId=requestId
    this.setData({loading:true,loadingText:this.data.mode==='guide'?'正在让灵灵认真理解你的问题…':'正在把整天的行程、吃饭和休息安排好…',error:''})
    console.log('[TRIP_FLOW][GENERATE_START]',{mode:this.data.mode,promptLength:prompt.length})
    console.log('[AI][TRIP] user request received',{mode:this.data.mode})
    tracker.trackEvent('ai_request_start',{page:'trip',locale:this.data.locale,hasBudget:/预算|budget/i.test(prompt),hasChildren:/孩子|亲子|child/i.test(prompt),entryMode:this.data.mode})
    console.log('[TRIP_FLOW][ORCHESTRATOR_START]',{task:'visitor_conversation'})
    conversationGateway.handle(prompt,{locale:this.data.locale,responseLocale:this.data.locale,existingPlan:this.data.plan,conversationState:this.data.conversationState,entryMode:this.data.mode,source:'trip-page-submit',hostContext:this.data.hostContext}).then(routed=>{
      if(this.destroyed||requestId!==this.requestId)return
      if(this.data.hostContext)hostRuntime.record(routed.kind==='plan'?'TRIP':this._hostStory?'STORY':'QA',{source:routed.result&&routed.result.source,provider:routed.result&&routed.result.source==='cloud'?'cloudbase':null},this.data.hostContext)
      this._hostStory=false
      this.setData({responseRouting:routed,conversationState:routed.conversationState||this.data.conversationState})
      const authorizedPlan=routed.kind==='plan'&&(routed.intent==='TRIP_PLANNING'||routed.intent==='ADJUST_TRIP')
      console.log('[FINAL_AI_CHAIN]',{mode:this.data.mode,intent:routed.intent,agent:routed.result&&routed.result.agent&&routed.result.agent.id||'none',behavior:routed.response_behavior||'unknown',renderer:authorizedPlan?'trip_plan_renderer':routed.format&&routed.format.image_renderer||'text_answer_renderer'})
      if(routed.kind==='plan'&&!authorizedPlan){
        console.error('[FINAL_AI_CHAIN] blocked unauthorized plan renderer',{inputLength:prompt.length,intent:routed.intent,behavior:routed.response_behavior})
        const blocked={source:'local-fallback',type:'UNKNOWN',answer:'当前问题将以知识问答方式处理，请重新提交。',agent:null}
        this.setData({loading:false,petAnswer:blocked,hasPlan:false},()=>visibleResponseTrace(prompt,routed,blocked,'text'))
        return
      }
      if(routed.kind==='text'){
        this.setData({loading:false,petAnswer:routed.result,showFullAnswer:false,hasPlan:false,durationOptions:routed.result&&routed.result.durationOptions||[],baseCityOptions:routed.result&&routed.result.baseCityOptions||[],tripDiscoveryOptions:routed.result&&routed.result.tripDiscoveryOptions||[],regionalOptions:routed.result&&routed.result.regionalOptions||[],clarificationDays:routed.result&&routed.result.clarificationDays||''},()=>visibleResponseTrace(prompt,routed,routed.result,'text'))
        tracker.trackEvent('ai_answer_success',{page:'trip',intent:routed.intent,behavior:routed.response_behavior,source:routed.result&&routed.result.source||'unknown'})
        return
      }
      const result=routed.result
      const plan=Object.assign({},attachScenicVisuals(result.plan,prompt),{aiSource:result.source,aiSourceLabel:'🦊 沙狐 · 已结合宁夏知识库与同行需求'})
      runtimeState.set('latest_trip',plan)
      runtimeState.set('currentTrip',Object.assign({},plan,{addedItems:this.data.addedItems||[]}))
      this.setData({loading:false,plan,planAvatar:null,hasPlan:true},()=>visibleResponseTrace(prompt,routed,{plan,agent:{id:'camel'}},'plan'))
      console.log('[TRIP_FLOW][RENDER_SUCCESS]',{source:result.source}); console.log('AI_SOURCE='+(result.source==='cloud'?'CLOUD':'LOCAL_FALLBACK'))
      tracker.trackEvent('ai_plan_success',{page:'trip',locale:plan.locale,days:plan.days.length,engine:plan.generatedBy,source:result.source})
    }).catch(error=>{
      if(this.destroyed||requestId!==this.requestId)return
      console.error('[TRIP_FLOW][RENDER_FAIL]',{message:error&&error.message})
      this.setData({loading:false,error:safeMode.userMessage(error)})
      tracker.trackEvent('ai_plan_failure',{page:'trip',reason:error.message||'agent_error'})
    })
  },
  speakAnswer(){
    const payload=this.data.petAnswer
    if(!payload)return
    if(payload.avatarState!=='SPEAKING'){const copy=require('../../utils/voice-coming-soon').copy(payload.resolvedCharacter||payload.character);return this.setData({voiceSheetVisible:true,voiceSheetTitle:copy.title,voiceSheetBody:copy.body})}
    if(payload.avatarState==='SPEAKING'){this.stopAnswer();return}
    const now=Date.now()
    if(this._voiceTapAt&&now-this._voiceTapAt<400)return
    if(this._voiceBusy)return
    this._voiceTapAt=now
    this._voiceBusy=true
    console.log('[VOICE_TRIGGER]',{triggerId:`trip-answer-${now}`,page:'pages/trip/index',component:'avatar-actions',eventType:'tap',source:'trip-answer-button',textHash:String(payload.speakText||payload.answerText||'').slice(0,32),character:payload.resolvedCharacter||payload.character||''})
    this.setData({petAnswer:Object.assign({},payload,{avatarState:'SPEAKING'})})
    digitalAvatar.speak(payload).then(result=>{
      this._voiceBusy=false
      this.setData({petAnswer:result})
      const audioUrl=result.audio&&typeof result.audio==='object'?result.audio.url:result.audio
      if(audioUrl){this.answerAudio=wx.createInnerAudioContext();this.answerAudio.src=audioUrl;this.answerAudio.onPlay(()=>this.setData({petAnswer:Object.assign({},this.data.petAnswer,{avatarState:'SPEAKING'})}));this.answerAudio.onEnded(()=>this.setData({petAnswer:Object.assign({},this.data.petAnswer,{avatarState:'IDLE'})}));this.answerAudio.onError(error=>{console.log('[VOICE] answer audio error',error&&error.errCode||'');this.setData({petAnswer:Object.assign({},this.data.petAnswer,{avatarState:'IDLE'})})});this.answerAudio.play()}
    }).catch(error=>{this._voiceBusy=false;console.error('[VOICE][ENTRY_FAIL]',{message:error&&error.message});this.setData({petAnswer:Object.assign({},payload,{avatarState:'HAPPY',voiceReason:error&&error.message||'VOICE_ERROR'})})})
  },
  closeVoiceSheet(){this.setData({voiceSheetVisible:false})},
  continueVoiceChat(){this.setData({voiceSheetVisible:false,mode:'guide',isGuideMode:true})},
  toggleFullAnswer(){this.setData({showFullAnswer:!this.data.showFullAnswer})},
  speakPlan(){
    if(!this.data.plan||this.data.planAvatar&&this.data.planAvatar.avatarState==='SPEAKING')return
    const payload=digitalAvatar.prepare({answerText:this.data.plan.summary||'这是你的宁夏行程。'},'宁夏旅行路线')
    payload.character='shaHu';payload.characterProfile=digitalAvatar.prepare({answerText:'',character:'shaHu'},'').characterProfile
    this.setData({planAvatar:Object.assign({},payload,{avatarState:'SPEAKING'})})
     digitalAvatar.speak(payload).then(result=>{this.setData({planAvatar:result});const audioUrl=result.audio&&typeof result.audio==='object'?result.audio.url:result.audio;if(audioUrl){const audio=wx.createInnerAudioContext();this.planAudio=audio;audio.src=audioUrl;audio.onPlay(()=>this.setData({planAvatar:Object.assign({},this.data.planAvatar,{avatarState:'SPEAKING'})}));audio.onEnded(()=>this.setData({planAvatar:Object.assign({},this.data.planAvatar,{avatarState:'IDLE'})}));audio.onError(error=>console.log('[VOICE] plan audio error',error&&error.errCode||''));audio.play()}})
  },
   stopPlan(){this.planAudio&&this.planAudio.stop&&this.planAudio.stop();this.planAudio=null;this.setData({planAvatar:null})},
  stopAnswer(){this.answerAudio&&this.answerAudio.stop&&this.answerAudio.stop();this.setData({petAnswer:Object.assign({},this.data.petAnswer,{avatarState:'IDLE'})})},
  noop(){},
  adjust(e){
    if(this.data.loading||!this.data.plan)return
    const instruction=e.currentTarget.dataset.instruction

    const requestId=(this.requestId||0)+1
    this.requestId=requestId
    this.setData({loading:true,loadingText:'正在理解调整要求并保留当前行程…',error:''})
    tracker.trackEvent('ai_plan_regenerate',{page:'trip',action:instruction})
    conversationGateway.handle(instruction,{locale:this.data.locale,existingPlan:this.data.plan,conversationState:this.data.conversationState,entryMode:'plan',source:'trip-adjust',hostContext:this.data.hostContext}).then(routed=>{const result=routed.result||routed
      if(this.destroyed||requestId!==this.requestId)return
      if(this.data.hostContext)hostRuntime.record('PATCH',{source:result.source,provider:result.source==='cloud'?'cloudbase':null},this.data.hostContext)
      const plan=Object.assign({},attachScenicVisuals(result.plan,instruction),{aiSource:result.source,aiSourceLabel:'🦊 沙狐 · 已按你的新要求调整'})
      runtimeState.set('latest_trip',plan)
      runtimeState.set('currentTrip',Object.assign({},plan,{addedItems:this.data.addedItems||[]}))
      this.setData({loading:false,plan,hasPlan:true},()=>visibleResponseTrace(instruction,{sessionId:this.data.conversationState&&this.data.conversationState.sessionId,intent:'ADJUST_TRIP',response_behavior:'ADJUST_TRIP',response_style:{name:'双峰驼规划助手风格'},format:{formatter:'timeline_route_card'}},{plan,agent:{id:'camel'}},'plan'))
      tracker.trackEvent('ai_plan_adjust_success',{page:'trip',action:instruction,source:result.source})
    }).catch(error=>{if(!this.destroyed&&requestId===this.requestId)this.setData({loading:false,error:safeMode.userMessage(error)})})
  },
  explain(e){
    const itemId=e.currentTarget.dataset.id
    const item=attractions.find(value=>value.id===itemId)||foods.find(value=>value.id===itemId)
    const local=item?{title:item.name&&item.name[this.data.locale]||item.name&&item.name['zh-CN']||itemId}:null
    if(!local)return
    wx.showLoading({title:'萌宠正在查知识库'})
    conversationGateway.handle(`${local.title}有什么值得了解和注意的？`,{locale:this.data.locale,entryMode:'guide',source:'trip-detail'}).then(routed=>{const result=routed.result||routed
      wx.hideLoading()
      tracker.trackEvent('agent_explain',{page:'trip',itemId,agentId:result.agent.id,locale:this.data.locale,source:result.source})
      wx.showModal({title:`${result.agent.avatar} ${result.agent.name} · ${local.title}`,content:`${result.answer}\n\n${result.source==='cloud'?'基于宁夏知识库的 Cloud AI 表达':'灵灵暂时没能生成更详细的讲解，先提供知识库简要内容。'}`,showCancel:false,confirmText:'知道了'})
    }).catch(()=>{wx.hideLoading();wx.showModal({title:local.title,content:'当前暂时无法连接 AI，请稍后重试。',showCancel:false,confirmText:'知道了'})})
  },
  guideTopic(e){
    const item=attractions.find(x=>x.id===e.currentTarget.dataset.id)
    if(!item)return
    const name=item.name[this.data.locale]||item.name['zh-CN']
    this.setData({prompt:`${name}有什么值得了解和注意的？`,mode:'guide'})
    wx.showLoading({title:'萌宠正在查知识库'})
    conversationGateway.handle(`${name}有什么值得了解和注意的？`,{locale:this.data.locale,entryMode:'guide',source:'guide-topic'}).then(routed=>{const result=routed.result||routed
      wx.hideLoading()
      wx.showModal({title:`${result.agent.avatar} ${result.agent.role}`,content:`${result.answer}\n\n${result.source==='cloud'?'基于宁夏知识库的 Cloud AI 表达':'灵灵暂时没能生成更详细的讲解。'}`,showCancel:false,confirmText:'知道了'})
    }).catch(()=>{wx.hideLoading();wx.showModal({title:name,content:'当前暂时无法连接 AI，请稍后重试。',showCancel:false})})
  },
  retry(){this.generate()},
  goHome(){wx.switchTab({url:'/pages/index/index'})},
  createStory(){if(this.data.loading)return;this.switchWorkspacePanel({currentTarget:{dataset:{panel:'qa'}}});this._hostStory=true;this.setData({prompt:'这里有什么文化故事？'},()=>this.generate())},
  returnToHost(){hostRuntime.returnToHost()},
  openMemoryStar(){wx.switchTab({url:'/pages/admin/index'})},
  createMemory(){this.switchWorkspacePanel({currentTarget:{dataset:{panel:'create'}}})},
  selectMemorySource(e){const source=e.currentTarget.dataset.source;if(['qa','trip'].includes(source))this.setData({'workspace.createState.source':source,'workspace.createState.saved':false})},
  composeMemory(){
    const state=this.data.workspace.createState
    const answer=this.data.workspace.qaState.view&&this.data.workspace.qaState.view.petAnswer
    const text=state.source==='qa'?answer&&(answer.answerText||answer.answer):this.data.plan&&this.data.plan.summary
    if(!text){wx.showToast({title:'请先完成对应问答或路线',icon:'none'});return}
    this.setData({'workspace.createState.card':{id:'memory-'+Date.now(),copy:String(text).slice(0,1200),state:'MEMORY_CREATED',landmarkId:this.data.hostContext&&this.data.hostContext.landmarkId||'',placeName:this.data.hostContext&&this.data.hostContext.scenicName||'宁夏记忆',sessionTraceId:this.data.hostContext&&this.data.hostContext.sessionTraceId||null,createdAt:Date.now(),source:state.source||'trip'},'workspace.createState.saved':false})
  },
  saveWorkspaceMemory(){
    const card=this.data.workspace.createState.card;if(!card)return
    try{const stored=wx.getStorageSync('hly_trip_memories');const list=Array.isArray(stored)?stored:[];wx.setStorageSync('hly_trip_memories',[card,...list.filter(x=>x.id!==card.id)].slice(0,20));this.setData({'workspace.createState.saved':true});if(this.data.hostContext)hostRuntime.record('MEMORY',{objectId:card.id},this.data.hostContext)}catch(error){wx.showToast({title:'保存失败，作品仍在当前页',icon:'none'})}
  },
  onShareAppMessage(){
    tracker.trackEvent('share_trip_plan',{page:'trip',hasPlan:this.data.hasPlan})
    const path='/pages/trip/index?source=share'
    const object=shareObject.build({type:'trip',objectId:this.data.plan&&this.data.plan.id||'trip-inspiration',title:'一起探索宁夏',subtitle:'参考这条路线规划我的宁夏旅行',scene:'river',character:'沙狐',sharePath:'/pages/trip/index',shareQuery:path.split('?')[1]||''});return shareObject.toShareMeta(object)
  }
})
