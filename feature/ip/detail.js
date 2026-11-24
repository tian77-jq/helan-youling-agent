const tracker=require('../../utils/tracker')
const {ipRoles,products}=require('../../utils/data')
const {toFeatureAsset}=require('../utils/assets')
const digitalAvatar=require('../../services/digital-avatar-service')
const narrative=require('../../utils/cultural-narrative-engine')
const imprintService=require('../services/cultural-imprint-service')
const characterByLegacy={'rock-goat':'yanYang','sand-fox':'shaHu','camel':'luoTuo'}
Page({
  data:{role:{},recommended:[],storyAvatar:null,story:null,storyLevels:[],voiceSheetVisible:false,voiceSheetTitle:'',voiceSheetBody:'',imprint:null},
  onLoad(options){options=options||{};const story=narrative.getStory(options.storyId);const source=ipRoles.find(item=>item.id===options.id)||ipRoles[0];const role=Object.assign({},source,{image:toFeatureAsset(source.image)});const selectedStory=story||narrative.storiesForCharacter(characterByLegacy[role.id]||'yanYang')[0];const recommended=products.filter(item=>item.ipId===role.id).slice(0,4).map(item=>Object.assign({},item,{image:toFeatureAsset(item.image),status:'概念阶段'}));const storyAvatar=digitalAvatar.prepare({answerText:selectedStory.narrative||role.story,character:selectedStory.narrator},'');this.setData({role,recommended,story:selectedStory,storyLevels:narrative.buildLevels(selectedStory),storyAvatar});tracker.trackEvent('page_view',{page:'ip_detail',ipId:role.id,storyId:selectedStory.storyId})},
  recommend(){wx.navigateTo({url:'/pages/recommend/index?preferredIp='+this.data.role.id})},
  openCreate(){wx.navigateTo({url:'/pages/ai-create/index?storyId='+(this.data.story&&this.data.story.storyId||'mountain')})},
  earnImprint(){const value=imprintService.earn(this.data.story&&this.data.story.storyId,'story-detail');this.setData({imprint:value});wx.showToast({title:'已收下数字探索印记',icon:'success'})},
  openProduct(e){wx.navigateTo({url:'/feature/shop/detail?id='+e.currentTarget.dataset.id})},
  listenStory(){const copy=require('../../utils/voice-coming-soon').copy(this.data.story&&this.data.story.narrator);this.setData({voiceSheetVisible:true,voiceSheetTitle:copy.title,voiceSheetBody:copy.body})},
  closeVoiceSheet(){this.setData({voiceSheetVisible:false})},
  continueVoiceChat(){const story=this.data.story;this.setData({voiceSheetVisible:false},()=>wx.navigateTo({url:'/pages/trip/index?mode=guide&prompt='+encodeURIComponent(story&&story.title||'宁夏有什么值得了解的？')}))},
  stopStory(){this.storyAudio&&this.storyAudio.stop&&this.storyAudio.stop();this.setData({storyAvatar:Object.assign({},this.data.storyAvatar,{avatarState:'IDLE'})})}
  ,noop(){}
})
