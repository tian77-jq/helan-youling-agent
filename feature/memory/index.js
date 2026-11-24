const tracker=require('../../utils/tracker')
const {attractions,agents}=require('../../knowledge/index')
const {toFeatureAsset}=require('../utils/assets')
const shareObject=require('../../utils/share-object-builder')
const MEMORY_PLACES=attractions.slice(0,8).map(item=>Object.assign({},item,{displayName:item.name['zh-CN'],image:toFeatureAsset(item.image)}))
function makeCopy(place,agent,note){const memory=note||'第一次来到宁夏，风和山都比想象中更有故事。';const voices={'rock-goat':'岩羊说：愿你记得的不只是远山，也有一路对自然保持的温柔。','sand-fox':'沙狐说：把今天的风味、夜色和路上的小惊喜一起收好。',camel:'双峰驼说：让我把这段西夏与丝路的时间回响，安静地交到你手里。'};return `${memory}\n\n在${place.name['zh-CN']}，我与${agent.name}留下了这份旅行记忆。${voices[agent.id]}`}
Page({
  data:{attractions:MEMORY_PLACES,agents,placeId:'xixia-tombs',agentId:'sand-fox',note:'',generated:false,card:null,saved:false},
  onLoad(){const latest=wx.getStorageSync('hly_latest_trip');const first=latest&&latest.days&&latest.days[0]&&latest.days[0].items.find(item=>item.type==='attraction');if(first&&MEMORY_PLACES.some(item=>item.id===first.id))this.setData({placeId:first.id,agentId:MEMORY_PLACES.find(item=>item.id===first.id).agentId});tracker.trackEvent('trip_memory_view',{page:'memory'})},
  selectPlace(e){const place=MEMORY_PLACES.find(item=>item.id===e.currentTarget.dataset.id);this.setData({placeId:place.id,agentId:place.agentId,generated:false,saved:false})},
  selectAgent(e){this.setData({agentId:e.currentTarget.dataset.id,generated:false,saved:false})},
  inputNote(e){this.setData({note:e.detail.value,generated:false,saved:false})},
  generate(){const place=MEMORY_PLACES.find(item=>item.id===this.data.placeId)||MEMORY_PLACES[0];const agent=agents.find(item=>item.id===this.data.agentId)||agents[1];const card={id:`memory-${Date.now()}`,placeId:place.id,placeName:place.name['zh-CN'],image:place.image,agent,copy:makeCopy(place,agent,(this.data.note||'').trim()),createdAt:new Date().toLocaleDateString('zh-CN')};this.setData({generated:true,card,saved:false});tracker.trackEvent('trip_card_generate',{page:'memory',placeId:place.id,agentId:agent.id})},
  save(){if(!this.data.card)return;const list=wx.getStorageSync('hly_trip_memories')||[];list.unshift(this.data.card);wx.setStorageSync('hly_trip_memories',list.slice(0,20));this.setData({saved:true});wx.showToast({title:'已保存到本机',icon:'success'})},
  copy(){if(this.data.card)wx.setClipboardData({data:this.data.card.copy})},
  onShareAppMessage(){const card=this.data.card;const object=shareObject.build({type:'memory',objectId:card&&card.id,title:card?`我在${card.placeName}遇见了${card.agent.name}`:'我的宁夏旅行纪念',subtitle:'一张属于自己的宁夏记忆卡',scene:'star',character:card&&card.agent.name,image:card&&card.image,sharePath:'/feature/memory/index',aiGenerated:false});tracker.trackEvent('share_trip_card',{page:'memory',placeId:card&&card.placeId,objectType:object.type});return shareObject.toShareMeta(object)}
})
