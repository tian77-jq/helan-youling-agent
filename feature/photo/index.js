const tracker=require('../../utils/tracker')
const visionAgent=require('../utils/vision-agent')
const tripAgent=require('../../utils/trip-agent')
const aiOrchestrator=require('../../utils/ai-orchestrator')
const {attractions,agents}=require('../../knowledge/index')
const TOPIC_IDS=['xixia-tombs','helan-rock-painting','shapotou','helan-mountain','shuidonggou']
function topicViews(){return attractions.filter(x=>TOPIC_IDS.includes(x.id)).map(x=>Object.assign({},x,{displayName:x.name['zh-CN']}))}

Page({
  data:{imagePath:'',recognizing:false,error:'',result:null,hasResult:false,locale:'zh-CN',agents,topics:topicViews(),explanation:null,modes:[{id:'brief',label:'30秒听懂'},{id:'deep',label:'深度了解'},{id:'child',label:'讲给小朋友听'},{id:'travel',label:'旅行建议'}]},
  onLoad(){console.log('[PAGE][PHOTO] onLoad')},
  onReady(){console.log('[PAGE][PHOTO] onReady')},
  onShow(){tracker.trackEvent('photo_recognition_view',{page:'photo'})},
  onUnload(){this.destroyed=true;if(this.uploadPromise&&this.uploadPromise.cancel)this.uploadPromise.cancel()},
  choose(){
    if(this.data.recognizing)return
    wx.chooseMedia({count:1,mediaType:['image'],sourceType:['camera','album'],sizeType:['compressed'],success:res=>{const file=res.tempFiles&&res.tempFiles[0];if(!file||!file.tempFilePath){this.setData({error:'灵灵暂时无法确认，请稍后再试'});return}this.setData({imagePath:file.tempFilePath,error:'',result:null,hasResult:false,explanation:null});this.recognize()},fail:error=>{if(!/cancel/i.test(error.errMsg||''))this.setData({error:'灵灵暂时无法确认，请稍后再试'})}})
  },
  recognize(){
    if(!this.data.imagePath||this.data.recognizing)return
    this.setData({recognizing:true,error:''})
    tracker.trackEvent('photo_recognition_start',{page:'photo'})
    const uploadPromise=visionAgent.recognize(this.data.imagePath,this.data.locale);this.uploadPromise=uploadPromise
    uploadPromise.then(result=>{if(this.destroyed)return;if(result.status==='UNKNOWN'){this.setData({recognizing:false,result:{unknown:true},hasResult:true,error:''});tracker.trackEvent('photo_recognition_unknown',{page:'photo',reason:result.reason});return}const known=visionAgent.entityById(result.knowledgeId);if(!known)throw new Error('UNKNOWN_SCENE');const confidenceValue=result.confidence>1?result.confidence:result.confidence*100;const normalized=Object.assign({},result,{id:known.id,name:known.name[this.data.locale]||known.name['zh-CN'],image:known.image,confidenceLabel:`${Math.round(confidenceValue)}%`});this.setData({recognizing:false,result:normalized,hasResult:true,explanation:null});aiOrchestrator.askPet(`请用萌宠方式讲解${normalized.name}`,this.data.locale,known.id).then(pet=>{if(!this.destroyed)this.setData({explanation:{agent:pet.agent,content:pet.answer,safetyNote:'实时信息请以官方最新公告为准。',source:pet.source}})});tracker.trackEvent('photo_recognition_success',{page:'photo',itemId:known.id,agentId:known.agentId,source:'vision'})}).catch(error=>{if(this.destroyed)return;this.setData({recognizing:false,error:visionAgent.friendlyError(error)});tracker.trackEvent('photo_recognition_failure',{page:'photo',reason:error.message||'unknown'})})
  },
  selectTopic(e){const item=attractions.find(x=>x.id===e.currentTarget.dataset.id);if(!item)return;const result={id:item.id,name:item.name[this.data.locale]||item.name['zh-CN'],confidence:null,culturalTags:item.tags,agentId:item.agentId,image:item.image,manual:true};this.setData({result,hasResult:true,error:'',explanation:null});aiOrchestrator.askPet(`请用萌宠方式讲解${result.name}`,this.data.locale,item.id).then(pet=>{if(!this.destroyed)this.setData({explanation:{agent:pet.agent,content:pet.answer,safetyNote:'实时信息请以官方最新公告为准。',source:pet.source}})});tracker.trackEvent('knowledge_topic_select',{page:'photo',itemId:item.id})},
  changeMode(e){if(!this.data.result)return;const explanation=tripAgent.explainKnowledge(this.data.result.id,e.currentTarget.dataset.mode,this.data.locale);this.setData({explanation});tracker.trackEvent('agent_explain',{page:'photo',itemId:this.data.result.id,mode:e.currentTarget.dataset.mode,agentId:explanation.agent.id})},
  goTrip(){navigation.openTrip({prompt:'请把'+this.data.result.name+'加入我的宁夏行程'})},
  onShareAppMessage(){return {title:this.data.hasResult?`贺兰有灵：${this.data.result.name}萌宠讲解`:'拍一拍，认识宁夏',path:'/feature/photo/index'}}
})
const navigation=require('../../utils/navigation')
