const cloud=require('wx-server-sdk')

cloud.init({env:cloud.DYNAMIC_CURRENT_ENV})

exports.main=async(event)=>{
  console.log('[VISION][REQUEST]',{hasCloudFileID:Boolean(event&&event.cloudFileID),locale:event&&event.locale||'zh-CN'})
  if(!event||typeof event.cloudFileID!=='string'||!event.cloudFileID){
    return {success:false,reason:'INVALID_INPUT'}
  }
  // 识别供应商尚未在 CloudBase 控制台配置时，必须安全失败，不能猜测景区。
  if(!process.env.VISION_PROVIDER_ENDPOINT){
    console.log('[VISION][MODEL] provider not configured')
    return {success:false,reason:'VISION_PROVIDER_NOT_CONFIGURED'}
  }
  // 生产接入前在此实现经审核的 Vision Provider，并只返回 knowledgeId。
  // 不把原图、模型原文或用户信息写入数据库。
  return {success:false,reason:'VISION_PROVIDER_NOT_CONFIGURED'}
}
