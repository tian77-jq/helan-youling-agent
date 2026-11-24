const tracker=require('../../utils/tracker')
const runtimeState=require('../../utils/runtime-state')
const navigation=require('../../utils/navigation')
const {ipRoles}=require('../../utils/data')
const themeContract=require('../../design-tokens/theme-contract');const motionTokens=require('../../design-tokens/motion-tokens')
const sceneEntry=require('../../utils/scene-entry-controller')
const {regions,getRegion}=require('../../utils/memory-region-registry')
const scanRouter=require('../../utils/safe-scan-router')
const hostRuntime=require('../../utils/host-runtime')
const i18n=require('../../utils/i18n-runtime')
function localizedRegion(region,locale){const id=region.regionId||'mountain';const suffix=id==='river'?'River':id==='desert'?'Desert':'Mountain';return Object.assign({},region,{label:i18n.t('my.region'+suffix,locale),emptyState:i18n.t('my.empty'+suffix,locale)})}
const BADGES={"helan-explorer":{id:'helan-explorer',icon:'⌁',name:'贺兰山探索者',description:'完成“识宁夏”文化关卡'},"xixia-interpreter":{id:'xixia-interpreter',icon:'◇',name:'西夏文化解读者',description:'完成“解文脉”文化关卡'},"ningxia-guide":{id:'ningxia-guide',icon:'＋',name:'宁夏旅行推荐官',description:'完成“当导游”文化关卡'},"culture-translator":{id:'culture-translator',icon:'✦',name:'文化转译者',description:'完成“传世界”文化关卡'}}
Page({
  data:{pets:ipRoles,badges:[],preferredPet:'',localeLabel:'中文',hasTrip:false,tripTitle:'还没有旅行计划',tripCopy:'还没有旅行计划，让灵灵带你认识宁夏。',favoriteCount:0,wishCount:0,memoryCount:0,journeyStats:{},regions,activeRegion:regions.mountain,stars:[],activeStar:null,sceneToken:themeContract.resolve('STAR'),motionToken:motionTokens.grammar.STAR,motionMode:'FULL'},
  onShow(){i18n.bindPage(this,this.applyLocale);sceneEntry.activate(this,'STAR');this.refresh();const hostContext=hostRuntime.active();this.setData({hostContext});if(hostContext)hostRuntime.record('STAR',{},hostContext);tracker.trackEvent('page_view',{page:'my'})},
  onUnload(){if(this.__localeUnsubscribe)this.__localeUnsubscribe()},
  applyLocale(locale){this.setData({locale,isEnglish:locale==='en-US',isRtl:i18n.isRtl(locale),ui:{profile:i18n.t('my.profile',locale),subtitle:i18n.t('my.subtitle',locale),scan:i18n.t('my.scan',locale),settings:i18n.t('my.settings',locale),mall:i18n.t('my.mall',locale),atlas:i18n.t('my.atlas',locale),atlasTitle:i18n.t('my.atlasTitle',locale),memories:i18n.t('my.memories',locale),generateMemory:i18n.t('my.generateMemory',locale),favorites:i18n.t('my.favorites',locale),language:i18n.t('my.language',locale),privacy:i18n.t('my.privacy',locale),clear:i18n.t('my.clear',locale),returnToScenic:i18n.t('my.returnToScenic',locale),portalMountain:i18n.t('my.portalMountain',locale),portalRiver:i18n.t('my.portalRiver',locale),portalDesert:i18n.t('my.portalDesert',locale),continueJourney:i18n.t('my.continueJourney',locale),starDetailCopy:i18n.t('my.starDetailCopy',locale),continueWithCompanion:i18n.t('my.continueWithCompanion',locale),rejoinTrip:i18n.t('my.rejoinTrip',locale),viewContinuePlan:i18n.t('my.viewContinuePlan',locale),planWithAi:i18n.t('my.planWithAi',locale),constellationTitle:i18n.t('my.constellationTitle',locale)}})},
  returnToHost(){hostRuntime.returnToHost()},
  refresh(){const trip=runtimeState.get('currentTrip',null);const locale=i18n.getCurrentLocale();const labels={'zh-CN':'简体中文','en-US':'English',ar:'العربية'};const progress=runtimeState.get('culturalProgress',{badges:[]});const saved=wx.getStorageSync('hly_trip_memories')||[];const planned=(trip&&trip.days||[]).reduce((all,day)=>all.concat(day.items||[]),[]).filter(item=>item.type==='attraction');const savedStars=saved.map(item=>({memoryId:item.id,landmarkId:item.placeId||item.landmarkId,sceneId:item.sceneId||null,memoryType:'STORY_MEMORY',character:item.agent&&item.agent.id||'camel',tripId:item.tripId||null,storyId:item.storyId||null,createdAt:item.createdAt,visited:false,saved:true,label:item.placeName||'宁夏记忆',state:'SAVED'}));const plannedStars=planned.map(item=>({memoryId:`planned-${item.id}`,landmarkId:item.landmarkId||item.knowledgeId||item.id,sceneId:item.sceneId||null,memoryType:'TRIP_MEMORY',character:item.character||'camel',tripId:trip.id||null,storyId:null,createdAt:null,visited:false,saved:false,label:item.name||item.title||'宁夏行程',state:'PLANNED'}));const discovery=[{memoryId:'discovery-helan',landmarkId:'helan-mountain',memoryType:'LANDMARK_MEMORY',label:'贺兰山',state:'DISCOVERY_STAR'},{memoryId:'discovery-yellow-river',landmarkId:'yellow-river',memoryType:'LANDMARK_MEMORY',label:'黄河',state:'DISCOVERY_STAR'},{memoryId:'discovery-shapotou',landmarkId:'shapotou',memoryType:'LANDMARK_MEMORY',label:'沙坡头',state:'DISCOVERY_STAR'}];this.setData({badges:(progress.badges||[]).map(id=>BADGES[id]).filter(Boolean),hasTrip:!!(trip&&trip.days&&trip.days.length),tripTitle:trip&&trip.summary||i18n.t('trip.title',locale),tripCopy:trip&&trip.days?i18n.t('trip.saved',locale):i18n.t('trip.subtitle',locale),preferredPet:(runtimeState.get('userPreferences',{})||{}).preferredPet||'',localeLabel:labels[locale]||'简体中文',favoriteCount:(wx.getStorageSync('hly_favorites')||[]).length,wishCount:tracker.getDesignFavorites().length,memoryCount:saved.length,journeyStats:tracker.getDashboardStats(),activeRegion:localizedRegion(this.data.activeRegion||regions.mountain,locale),stars:savedStars.concat(plannedStars,discovery)})},
  switchRegion(e){const id=e.currentTarget.dataset.id;const region=localizedRegion(getRegion(id),i18n.getCurrentLocale());this.setData({activeRegion:null,motionToken:`STAR-PORTAL-${id}-${Date.now()}`},()=>this.setData({activeRegion:region}))},
  openStar(e){const star=this.data.stars.find(item=>item.memoryId===e.currentTarget.dataset.id);if(!star)return;this.setData({activeStar:star});tracker.trackEvent('memory_star_open',{landmarkId:star.landmarkId,memoryType:star.memoryType,state:star.state})},
  closeStar(){this.setData({activeStar:null})},
  noop(){},
  askMemoryAI(){const star=this.data.activeStar;if(!star)return;navigation.openTrip({mode:'guide',prompt:`请介绍${star.label}的真实景观与值得体验的内容`,source:'memory-star'})},
  openTrip(){navigation.openTrip(this.data.hasTrip?{}:{prompt:'第一次来宁夏，两天时间，喜欢历史和美食'})},
  openFavorites(){wx.showModal({title:'我的收藏',content:this.data.favoriteCount?'你收藏的景区、美食和故事会保存在本机。':'收藏你想去的地方，下次打开还能找到。',showCancel:false})},
  openMemories(){navigation.navigate('/feature/memory/index')},
  openWishlist(){wx.switchTab({url:'/pages/shop/index'})},
  openSettings(){this.openLanguage()},
  openMall(){this.openWishlist()},
  choosePet(e){const id=e.currentTarget.dataset.id;const prefs=runtimeState.get('userPreferences',{});runtimeState.set('userPreferences',Object.assign({},prefs,{preferredPet:id}));this.setData({preferredPet:id});wx.showToast({title:'已记住你的萌宠伙伴',icon:'success'})},
  openLanguage(){navigation.navigate('/pages/language/index')},
  scan(){
    wx.scanCode({success:result=>{
      const route=scanRouter.resolve(result&&result.result)
      if(!route.ok){wx.showToast({title:'暂不支持该二维码',icon:'none'});return}
      wx.navigateTo({url:route.url})
    },fail:()=>{wx.showToast({title:'未完成扫码',icon:'none'})}})
  },
  feedback(){wx.showModal({title:'意见反馈',editable:true,placeholderText:'告诉我们你遇到的问题或文创',success:r=>{if(r.confirm&&r.content){tracker.saveSurvey({type:'游客反馈',message:r.content,source:'my'});wx.showToast({title:'反馈已保存',icon:'success'})}}})},
  about(){wx.showModal({title:'关于贺兰有灵',content:'贺兰有灵通过AI旅行规划、宁夏文化互动和原创萌宠IP，让游客更轻松地认识宁夏、发现宁夏、体验宁夏，同时展示项目原创文创设计与文化创意内容。',showCancel:false})},
  clearLocalData(){wx.showModal({title:'清除本机数据',content:'将删除本机保存的旅行计划、对话、收藏、作品记录、偏好、反馈和诊断记录。此操作不可撤销。',confirmText:'确认清除',confirmColor:'#b54535',success:result=>{if(!result.confirm)return;try{const info=wx.getStorageInfoSync();(info.keys||[]).filter(key=>/^hly_|^helan_|^digitalAssets$|^LAST_TTS_DIAGNOSTIC$/.test(key)).forEach(key=>wx.removeStorageSync(key));this.refresh();wx.showToast({title:'本机数据已清除',icon:'success'})}catch(error){wx.showToast({title:'清除失败，请稍后重试',icon:'none'})}}})},
  privacy(){wx.showModal({title:'隐私与AI说明',content:'游客无需登录。旅行计划、对话、收藏、作品记录与偏好优先保存在本机；使用云端AI时，输入会发送至腾讯云开发环境进行处理，请勿输入个人敏感信息。AI图片会显示并在导出文件中保留“AI生成/合成内容”标识。你可在本页清除本机数据。',showCancel:false})}
})
