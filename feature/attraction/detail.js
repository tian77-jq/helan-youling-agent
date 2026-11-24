const {attractions,agents}=require('../../knowledge/index')
const {scenicCollabs}=require('../../utils/data')
const state=require('../../utils/runtime-state')
const navigation=require('../../utils/navigation')
Page({
  data:{item:null,agent:null,loading:false,error:''},
  onLoad(options){
    const id=options&&options.id
    const aliases={'shapotou-camel-collab':'shapotou','zhenbeibao-fox-collab':'zhenbeibao','huanghe-grand-canyon':'yellow-river-canyon'}
    const item=attractions.find(x=>x.id===(aliases[id]||id))||attractions[0]
    const agent=agents.find(x=>x.id===item.agentId)||agents[2]
    const visual=scenicCollabs.find(x=>x.id===id)
    this.setData({item:Object.assign({},item,{image:visual&&visual.image||item.image,suitableText:(item.suitableFor||[]).join(' · ')}),agent})
  },
  ask(){navigation.openTrip({mode:'guide',prompt:this.data.item.name['zh-CN']+'有什么值得了解和注意的？'})},
  add(){
    state.addTripItem({id:this.data.item.id,type:'attraction',name:this.data.item.name['zh-CN'],agentId:this.data.item.agentId,image:this.data.item.image})
    wx.showToast({title:'已加入当前行程',icon:'success'})
  },
  goHome(){navigation.switchTab('/pages/index/index')},
  onShareAppMessage(){return {title:`${this.data.item.name['zh-CN']} · 贺兰有灵`,path:`/feature/attraction/detail?id=${this.data.item.id}`}}
})
