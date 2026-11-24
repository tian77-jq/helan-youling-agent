const {foods,agents}=require('../../knowledge/index')
const state=require('../../utils/runtime-state')
const navigation=require('../../utils/navigation')
Page({
  data:{item:null,agent:null},
  onLoad(options){const item=foods.find(x=>x.id===(options&&options.id))||foods[0];this.setData({item,agent:agents.find(x=>x.id===item.agentId)||agents[2]})},
  ask(){navigation.openTrip({mode:'guide',prompt:'请介绍'+this.data.item.name['zh-CN']+'的文化和风味'})},
  add(){state.addTripItem({id:this.data.item.id,type:'food',name:this.data.item.name['zh-CN'],agentId:this.data.item.agentId,image:this.data.item.image});wx.showToast({title:'已加入美食路线',icon:'success'})},
  addTrip(){state.addTripItem({id:this.data.item.id,type:'food',name:this.data.item.name['zh-CN'],agentId:this.data.item.agentId,image:this.data.item.image});navigation.openTrip({prompt:'请把'+this.data.item.name['zh-CN']+'加入我的宁夏行程'})},
  goHome(){navigation.switchTab('/pages/index/index')},
  onShareAppMessage(){return {title:`${this.data.item.name['zh-CN']} · 宁夏味道`,path:`/feature/food/detail?id=${this.data.item.id}`}}
})
