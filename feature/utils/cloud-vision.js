const config=require('../../config/cloud')
const {attractions,foods}=require('../../knowledge/index')

function timeoutPromise(promise,timeout){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('VISION_TIMEOUT')),timeout)
    Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value)},error=>{clearTimeout(timer);reject(error)})
  })
}
function readBase64(filePath){
  return new Promise((resolve,reject)=>{
    if(!wx.getFileSystemManager)return reject(new Error('VISION_FILE_API_UNAVAILABLE'))
    wx.getFileSystemManager().readFile({filePath,encoding:'base64',success:result=>resolve(result.data),fail:()=>reject(new Error('VISION_IMAGE_READ_FAILED'))})
  })
}
function cleanJson(content){
  const text=String(content||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
  try{return JSON.parse(text)}catch(error){throw new Error('VISION_INVALID_RESPONSE')}
}
function responseText(response){return response&&response.choices&&response.choices[0]&&response.choices[0].message&&response.choices[0].message.content||response&&response.text||''}
function knowledgeChoices(){return attractions.concat(foods).map(item=>({id:item.id,name:item.name&&item.name['zh-CN']||item.id,category:item.category||'food',tags:item.tags||[item.taste].filter(Boolean)}))}
async function recognizeImage(filePath,locale='zh-CN'){
  if(!config.featureVisionEnabled)throw new Error('VISION_FEATURE_DISABLED')
  if(!wx.cloud||!wx.cloud.extend||!wx.cloud.extend.AI)throw new Error('VISION_MODEL_UNAVAILABLE')
  const base64=await readBase64(filePath)
  if(!base64||base64.length>8*1024*1024)throw new Error('VISION_IMAGE_TOO_LARGE')
  const imageId=`vision-${Date.now()}-${Math.floor(Math.random()*10000)}`
  const choices=knowledgeChoices(),allowed=new Set(choices.map(item=>item.id))
  const model=wx.cloud.extend.AI.createModel(config.cloudAiProvider)
  const system='你是宁夏旅行图片识别器。只做候选匹配，不讲故事。只能从给定知识库 ID 中选择；没有明确视觉证据、只是普通风景、主体不清晰或无法区分时必须返回 UNKNOWN。只输出 JSON，不要 Markdown：{"knowledgeId":"ID或UNKNOWN","entityName":"名称或未知","category":"attraction|food|culture|unknown","confidence":0到1,"description":"一句可见特征说明"}。不得根据文件名、用户身份或拍摄位置猜测。'
  const messages=[{role:'system',content:system},{role:'user',content:[{type:'text',text:`语言：${locale}\n允许候选：${JSON.stringify(choices)}\n判断图片是否能可靠对应其中一个候选。`},{type:'image_url',image_url:{url:`data:image/jpeg;base64,${base64}`}}]}]
  console.log('[VISION_AI_TRACE]',`imageId=${imageId} model=${config.visionModel} candidates=${choices.length} status=requesting`)
  const response=await timeoutPromise(model.generateText({model:config.visionModel,messages}),20000)
  const value=cleanJson(responseText(response)),confidence=Math.max(0,Math.min(1,Number(value.confidence)||0)),knowledgeId=String(value.knowledgeId||'UNKNOWN')
  if(knowledgeId==='UNKNOWN'||!allowed.has(knowledgeId)||confidence<config.visionConfidenceThreshold){console.log('[VISION_AI_TRACE]',`imageId=${imageId} model=${config.visionModel} knowledgeId=${knowledgeId} confidence=${confidence} status=UNKNOWN`);throw new Error('UNKNOWN_SCENE')}
  const item=attractions.concat(foods).find(candidate=>candidate.id===knowledgeId)
  console.log('[VISION_AI_TRACE]',`imageId=${imageId} model=${config.visionModel} knowledgeId=${knowledgeId} confidence=${confidence} status=MATCHED`)
  return {knowledgeId,entityName:item&&item.name&&item.name['zh-CN']||String(value.entityName||''),category:String(value.category||item&&item.category||''),confidence,description:String(value.description||'').slice(0,160)}
}
function friendlyError(error){
  const messages={VISION_FEATURE_DISABLED:'AI 识景暂未开放。',VISION_MODEL_UNAVAILABLE:'Cloud AI 图片理解尚未启用，请先在云开发控制台开启视觉模型。',VISION_TIMEOUT:'这次识别等得有点久，请换一张主体更清晰的照片再试。',VISION_IMAGE_TOO_LARGE:'图片太大，请选择压缩后的照片。',VISION_IMAGE_READ_FAILED:'照片读取失败，请重新选择。',UNKNOWN_SCENE:'这张照片还不足以可靠确认景区或美食。可以拍完整建筑、景区标志或更清晰的主体再试。'}
  return messages[error&&error.message]||'AI 识景暂时不可用，请稍后再试。'
}
module.exports={recognizeImage,friendlyError,cleanJson,knowledgeChoices}
