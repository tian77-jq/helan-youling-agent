const config=require('../config/cloud')
let initialized=false

function ensureCloud(){
  if(initialized)return true
  if(!wx.cloud||typeof wx.cloud.init!=='function')return false
  wx.cloud.init({env:config.envId,traceUser:true})
  initialized=true
  console.log('[CLOUD] lazy feature initialization',{env:config.envId})
  return true
}

module.exports={ensureCloud}
