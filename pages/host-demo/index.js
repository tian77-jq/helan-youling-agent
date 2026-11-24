const host=require('../../utils/host-runtime')
const flags=require('../../config/build-mode')
const runtimeState=require('../../utils/runtime-state')
Page({data:{scenic:{name:'沙坡头',city:'中卫',intro:'通用智慧文旅宿主景点页 · 合成测试资料',services:['景点详情','导览','路线']},hostContext:null},onLoad(options={}){
 if(!flags.HOST_DEMO){wx.reLaunch({url:'/pages/index/index'});return}
 require('../../adapters/buyer-data/demo-fixture').install()
 const context=host.active()
 if(options.returnTrace&&context&&options.returnTrace===context.sessionTraceId){this.setData({hostContext:context,scenic:Object.assign({},this.data.scenic,{name:context.scenicName,city:context.city})});host.record('RETURN_CONFIRMED',{},context)}
},openAIExperience(){const context=host.start('shapotou');if(!context)return;this.setData({hostContext:context});runtimeState.setPendingTripRequest({query:'一家三口，一天，不想太累',mode:'plan',source:'host-demo',autoStart:true});wx.navigateTo({url:'/pages/trip/index?mode=plan&scenic=shapotou&source=host-demo'})},back(){wx.switchTab({url:'/pages/index/index'})}})
