const tracker=require('../../utils/tracker')
const {creativeProducts,ipRoles}=require('../../utils/data')
const {toFeatureAsset}=require('../utils/assets')
Page({
  data:{product:{},role:{},wished:false},
  onLoad(options){const source=creativeProducts.find(item=>item.id===options.id)||creativeProducts[0];const product=Object.assign({},source,{image:toFeatureAsset(source.image),status:source.status||'概念设计 · 非售卖',tagText:(source.tags||[]).join(' · ')});const role=ipRoles.find(item=>item.id===product.ipId)||ipRoles[0];this.setData({product,role,wished:tracker.getDesignFavorites().some(x=>x.designId===product.id)});tracker.trackEvent('creative_detail_view',{page:'creative-detail',designId:product.id})},
  favorite(){tracker.saveFavorite({id:this.data.product.id,name:this.data.product.name});wx.showToast({title:'已收藏',icon:'success'})},
  intent(){const added=tracker.toggleDesignFavorite({id:this.data.product.id,name:this.data.product.name,source:'creative-detail'});this.setData({wished:added});wx.showToast({title:added?'已收藏':'已取消收藏',icon:added?'success':'none'})},
  bless(){wx.showModal({title:'双语祝福卡',content:'愿这份来自贺兰山的礼物，陪你把美好带向远方。\n\nMay this gift from Helan Mountain carry warmth wherever you go.',showCancel:false})}
})
