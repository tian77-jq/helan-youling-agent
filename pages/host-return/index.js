const host=require('../../utils/host-runtime')
Page({data:{hostContext:null},onLoad(){this.setData({hostContext:host.active()})},backToHost(){host.returnToHost()},goTrip(){wx.navigateTo({url:'/pages/trip/index?mode=guide&scenic=shapotou&source=host-demo'})}})
