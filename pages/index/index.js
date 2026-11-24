const entries=[
  {id:'avatar',icon:'◌',title:'问灵灵',copy:'先问一个问题，再走进宁夏',url:'/pages/trip/index?mode=guide'},
  {id:'trip',icon:'→',title:'AI灵游',copy:'把时间、感觉和想去的地方排成路线',url:'/pages/trip/index'},
]
const narrative=require('../../utils/cultural-narrative-engine')
const runtimeState=require('../../utils/runtime-state')
const memoryEngine=require('../../utils/ningxia-memory-engine')
const themeContract=require('../../design-tokens/theme-contract')
const motionTokens=require('../../design-tokens/motion-tokens')
const characterMotionKit=require('../../design-tokens/character-motion-kit')
const sceneEntry=require('../../utils/scene-entry-controller')
const i18n=require('../../utils/i18n-runtime')
Page({
  data:{entries:[{id:'yanYang',image:'/assets/thumbs/products/avatar_yanyang_ai.jpg',title:'跟着岩羊看山与生命',copy:'贺兰山',url:'/pages/trip/index?mode=guide&prompt=贺兰山有哪些生态故事'},{id:'luoTuo',image:'/assets/thumbs/products/avatar_camel_ai.jpg',title:'跟着骆驼听时间与文明',copy:'西夏陵 · 黄河',url:'/pages/trip/index?mode=guide&prompt=宁夏有哪些历史文化故事'},{id:'shaHu',image:'/assets/thumbs/products/avatar_fox_ai.jpg',title:'跟着沙狐走进今天的宁夏',copy:'城市 · 味道 · 夜游',url:'/pages/trip/index?mode=guide&prompt=银川晚上去哪玩'}],stories:narrative.listStories().slice(0,8),destinations:[{id:'helan-mountain',name:'贺兰山',url:'/feature/attraction/detail?id=helan-mountain'},{id:'xixia-tombs',name:'西夏陵',url:'/feature/attraction/detail?id=xixia-tombs'},{id:'yellow-river-canyon',name:'黄河大峡谷',url:'/feature/attraction/detail?id=yellow-river-canyon'}],sceneMeta:memoryEngine.getScene('mountain'),sceneToken:themeContract.resolve('MOUNTAIN'),motionToken:motionTokens.grammar.MOUNTAIN,motionMode:'FULL',characterMotionKit,hasTrip:false,tripTitle:'',onboardingVisible:false,petRoles:[
    {id:'rock-goat',name:'岩羊',image:'/assets/thumbs/products/avatar_yanyang_ai.jpg'},
    {id:'sand-fox',name:'沙狐',image:'/assets/thumbs/products/avatar_fox_ai.jpg'},
    {id:'camel',name:'双峰驼',image:'/assets/thumbs/products/avatar_camel_ai.jpg'}
  ],runtimeErrors:0,startedAt:0},
  onLoad(){
    const app=getApp&&getApp()
    const startedAt=app&&app.globalData&&app.globalData.startupTimeline&&app.globalData.startupTimeline.APP_LAUNCH||Date.now()
    if(app&&app.globalData&&app.globalData.startupTimeline)app.globalData.startupTimeline.PAGE_LOAD=Date.now()
    this.setData({startedAt})
    try{console.log('[HOME_V2] static shell ready')}catch(error){this.data.runtimeErrors+=1;console.error('[HOME_RUNTIME_CHECK][LOAD]',error)}
  },
  onShow(){
    i18n.bindPage(this,this.applyLocale)
    sceneEntry.activate(this,'MOUNTAIN')
    this.replayHero()
    const trip=runtimeState.get('currentTrip',null)
    const seen=runtimeState.get('homeOnboardingSeen',false)
    this.setData({hasTrip:Boolean(trip&&trip.days&&trip.days.length),tripTitle:trip&&trip.summary||'',onboardingVisible:!seen})
  },
  replayHero(){
    clearTimeout(this._heroStart);clearTimeout(this._heroEnd)
    this.setData({heroEntering:false})
    if(this.data.motionMode!=='FULL')return
    this._heroStart=setTimeout(()=>{
      this.setData({heroEntering:true})
      this._heroEnd=setTimeout(()=>this.setData({heroEntering:false}),1600)
    },60)
  },
  onHeroLoad(){this.setData({heroImageLoaded:true,heroImageFailed:false});this.replayHero()},
  onHeroError(){this.setData({heroImageLoaded:false,heroImageFailed:true})},
  onHide(){clearTimeout(this._heroStart);clearTimeout(this._heroEnd);this.setData({heroEntering:false})},
  onUnload(){clearTimeout(this._heroStart);clearTimeout(this._heroEnd);if(this.__localeUnsubscribe)this.__localeUnsubscribe()},
  applyLocale(locale){
    const text=key=>i18n.t(`home.${key}`,locale)
    const personaKey={yanYang:'yanyang',luoTuo:'luotuo',shaHu:'shahu'}
    const territory={yanYang:{'zh-CN':'贺兰山','en-US':'Helan Mountain',ar:'جبل هيلان'},luoTuo:{'zh-CN':'西夏陵 · 黄河','en-US':'Western Xia Tombs · Yellow River',ar:'أضرحة شيا الغربية · النهر الأصفر'},shaHu:{'zh-CN':'城市 · 味道 · 夜游','en-US':'City · Flavor · Nightlife',ar:'المدينة · النكهات · جولات المساء'}}
    const entries=this.data.entries.map(item=>Object.assign({},item,{title:text(`persona.${personaKey[item.id]}`),copy:territory[item.id][locale]||territory[item.id]['zh-CN']}))
    this.setData({locale,isEnglish:locale==='en-US',isRtl:i18n.isRtl(locale),ui:{eyebrow:text('eyebrow'),title:text('title'),subtitle:text('subtitle'),fallback:text('fallback'),caption:text('caption'),credit:text('credit'),tripKicker:text('tripKicker'),tripTitle:text('tripTitle'),newTrip:text('newTrip'),create:text('create'),resumeTrip:text('resumeTrip'),noTrip:text('noTrip'),quick:text('quick'),qaKicker:text('qaKicker'),qaTitle:text('qaTitle'),qaCopy:text('qaCopy'),ask:text('ask'),scrollHint:text('scrollHint'),note:text('note')},entries})
  },
  onReady(){
    const now=Date.now();const startup=this.data.startedAt?now-this.data.startedAt:0;const app=getApp&&getApp();const timeline=app&&app.globalData&&app.globalData.startupTimeline||{};timeline.STATIC_SHELL_READY=now;timeline.FIRST_INTERACTIVE=now;if(app&&app.globalData)app.globalData.startupTimeline=timeline
    console.log('[HOME_RUNTIME_CHECK]',{startupMs:startup,firstPaintMs:null,firstPaintMeasurement:'NOT_DIRECTLY_MEASURED',timeline:{APP_LAUNCH:timeline.APP_LAUNCH,PAGE_LOAD:timeline.PAGE_LOAD,STATIC_SHELL_READY:timeline.STATIC_SHELL_READY,FIRST_INTERACTIVE:timeline.FIRST_INTERACTIVE},dataCount:{entries:this.data.entries.length,petRoles:this.data.petRoles.length},errorCount:this.data.runtimeErrors||0})
  },
  openEntry(e){const url=e.currentTarget.dataset.url;if(!url)return;const tab=['/pages/ip/index','/pages/shop/index'].includes(url);wx[tab?'switchTab':'navigateTo']({url,fail:error=>console.error('[HOME_V2][NAV_FAIL]',{url,error})})}
  ,openStory(e){wx.navigateTo({url:'/feature/ip/detail?storyId='+e.currentTarget.dataset.id})}
  ,dismissOnboarding(){runtimeState.set('homeOnboardingSeen',true);this.setData({onboardingVisible:false})}
  ,closeTrip(){runtimeState.clear('currentTrip');this.setData({hasTrip:false,tripTitle:''})}
  ,newTrip(){wx.navigateTo({url:'/pages/trip/index?mode=plan&prompt='+encodeURIComponent('第一次来宁夏，两天时间，喜欢历史和美食，从银川开始')+'&source=home-plan'})}
  ,resumeTrip(){wx.navigateTo({url:'/pages/trip/index?mode=resume'})}
  ,openDestination(e){const url=e.currentTarget.dataset.url;if(url)wx.navigateTo({url})}
  ,openTrip(){wx.navigateTo({url:'/pages/trip/index'})}
  ,openCreate(){wx.navigateTo({url:'/pages/ai-create/index'})}
  ,startTrip(){wx.navigateTo({url:'/pages/trip/index'})}
  ,handleHomePlanRuntime(){const prompt=String(this.data.heroPrompt||'').trim();if(prompt)runtimeState.setPendingTripRequest({query:prompt,mode:'guide',source:'home-ask'});return prompt}
  ,handleHomePetRuntime(){const request={query:'宁夏有什么值得了解的文化故事？',mode:'guide',source:'home-pet',autoStart:true};runtimeState.setPendingTripRequest(request);return Promise.resolve(request)}
  ,go(e){const url=e&&e.currentTarget&&e.currentTarget.dataset&&e.currentTarget.dataset.to;if(!url)return;const isTrip=url.indexOf('/pages/trip/index')===0;if(isTrip)runtimeState.setPendingTripRequest({query:'',mode:'plan',source:'home-entry',autoStart:false});wx.navigateTo({url})}
})
