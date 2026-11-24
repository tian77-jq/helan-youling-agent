const {scenes}=require('./studio-config')
const service=require('./studio-service')
Page({data:{scenes,quota:{remaining:20},recent:[]},onShow(){this.setData({quota:service.quota()})},openScene(e){const scene=e.currentTarget.dataset.scene;wx.navigateTo({url:'/feature/create/config?scene='+scene})},openRecent(e){const item=this.data.recent[Number(e.currentTarget.dataset.index)];if(!item)return;wx.setStorageSync('helan_create_result',item);wx.navigateTo({url:'/feature/create/result'})}})
