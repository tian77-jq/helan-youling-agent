const runtimeState=require('./runtime-state')

function fail(title){
  wx.showToast({title:title||'页面打开失败，请重试',icon:'none'})
}
function navigate(url){
  if(!url)return Promise.reject(new Error('EMPTY_ROUTE'))
  return new Promise((resolve,reject)=>wx.navigateTo({url,success:resolve,fail:error=>{console.error('[NAV][FAIL]',{url,errMsg:error&&error.errMsg,error});fail();reject(error)}}))
}
function switchTab(url){
  return new Promise((resolve,reject)=>wx.switchTab({url,success:resolve,fail:error=>{console.error('[TAB][FAIL]',{url,errMsg:error&&error.errMsg,error});fail();reject(error)}}))
}
function isTripTabBar(){
  const app=typeof getApp==='function'?getApp():null
  return Boolean(app&&app.globalData&&app.globalData.tripIsTabBar)
}
function openTripPlanner(options){
  options=options||{}
  const query=String(options.query===undefined?options.prompt||'':options.query||'')
  const mode=options.mode==='guide'?'guide':'plan'
  console.log('[TRIP_FLOW][NAV_START]',{route:'/pages/trip/index',mode,promptLength:query.length,source:options.source||'unknown'})
  runtimeState.set('currentQuery',query)
  runtimeState.setPendingTripRequest({query,autoStart:options.autoStart!==false,source:options.source||'unknown',mode,locale:options.locale||''})
  const open=navigate('/pages/trip/index')
  return open.then(result=>{console.log('[TRIP_FLOW][NAV_SUCCESS]',{route:'/pages/trip/index',method:'navigateTo'});return result}).catch(error=>{console.error('[TRIP_FLOW][NAV_FAIL]',{route:'/pages/trip/index',method:'navigateTo',errMsg:error&&error.errMsg,error});runtimeState.clear('pendingTripRequest');fail('AI灵游暂时无法打开，请重试');throw error})
}
const openTrip=openTripPlanner
module.exports={navigate,switchTab,openTrip,openTripPlanner,fail}
