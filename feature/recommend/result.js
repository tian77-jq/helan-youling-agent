const tracker=require('../../utils/tracker')
const navigation=require('../../utils/navigation')
const {generateRecommendation}=require('../utils/recommend')
const {products}=require('../../utils/data')
const {toFeatureAsset}=require('../utils/assets')
Page({
  data:{loading:true,result:{},recommended:[]},
  onLoad(){const form=wx.getStorageSync('hly_latest_recommendation_form')||{};setTimeout(()=>{const result=generateRecommendation(form);const recommended=products.filter(item=>item.ipId===result.ipId).slice(0,3).map(item=>Object.assign({},item,{image:toFeatureAsset(item.image)}));wx.setStorageSync('hly_latest_recommendation_result',result);this.setData({loading:false,result,recommended});tracker.trackEvent('view_recommendation_result',{page:'recommend_result',ipId:result.ipId})},300)},
  favorite(){tracker.saveFavorite({id:this.data.result.id,name:this.data.result.ipName+'设计推荐'});wx.showToast({title:'已收藏',icon:'success'})},
  intent(){const added=tracker.toggleDesignFavorite({id:this.data.result.id,name:this.data.result.giftCombo,source:'recommendation'});wx.showToast({title:added?'已收藏':'已取消收藏',icon:added?'success':'none'})},
  shop(){navigation.switchTab('/pages/shop/index')},
  openProduct(e){navigation.navigate('/feature/shop/detail?id='+e.currentTarget.dataset.id)},
  again(){wx.navigateBack({delta:1})},
  onShareAppMessage(){tracker.trackEvent('share',{page:'recommend_result'});return {title:'贺兰有灵：原创IP设计推荐',path:'/pages/recommend/index'}}
})
