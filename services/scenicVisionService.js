// 贺兰灵境 · 双层文旅视觉服务
// 第一层只返回已核验的本地景区实景；第二层为后续腾讯混元接口预留。
const cloudConfig=require('../config/cloud')
const {attractions}=require('../knowledge/index')
const imageService=require('./image-service')

const SOURCE={LOCAL_KB:'LOCAL_KB',HUNYUAN_AI:'HUNYUAN_AI',FALLBACK_MODE:'FALLBACK_MODE'}
const LABEL={LOCAL_KB:'项目景观示意 · 非实景照片',HUNYUAN_AI:'AI旅行效果预览',FALLBACK_MODE:'旅行效果图暂不可用'}

function text(value){return String(value||'').trim()}
function itemName(item){return text(item&&item.name&&item.name['zh-CN'])}
function requestedBestTime(prompt,item){
  const value=text(prompt)
  if(/晚上|夜景|傍晚|日落/.test(value))return '晚上'
  if(/下午/.test(value))return '下午'
  if(/早晨|上午/.test(value))return '上午'
  return item&&item.preferredVisit||'白天'
}

function matchScenic(scenicName){
  const value=text(scenicName)
  if(!value)return null
  const byId=attractions.find(item=>item.id===value)
  if(byId)return byId
  return attractions.filter(item=>{
    const name=itemName(item)
    return name&&(value.includes(name)||name.includes(value))
  }).sort((left,right)=>itemName(right).length-itemName(left).length)[0]||null
}

function localVision(item,input){
  return {
    source:SOURCE.LOCAL_KB,
    image:item.image||'',
    label:LABEL.LOCAL_KB,
    name:itemName(item),
    scenicId:item.id,
    bestTime:requestedBestTime(input&&input.userPrompt,item),
    type:/晚上|傍晚/.test(requestedBestTime(input&&input.userPrompt,item))?'夜景':item.category||'景区实景',
    verified:false,
    placeholder:false
  }
}

function fallbackVision(input,reason){
  return {
    source:SOURCE.FALLBACK_MODE,
    image:'',
    label:LABEL.FALLBACK_MODE,
    name:text(input&&input.scenicName)||'旅行目的地',
    bestTime:requestedBestTime(input&&input.userPrompt),
    type:'待补充',
    verified:false,
    placeholder:true,
    reason:reason||'LOCAL_KB_MISS'
  }
}

function resolveScenicVision(input={}){
  try{
    const item=matchScenic(input.scenicId||input.scenicName)
    return item?localVision(item,input):fallbackVision(input,'LOCAL_KB_MISS')
  }catch(error){
    console.error('[SCENIC_VISION][RESOLVE_FAIL]',error)
    return fallbackVision(input,'VISION_RESOLVE_FAILED')
  }
}

function buildTravelImageRequest(input={}){
  const tags=Array.isArray(input.cultureTags)?input.cultureTags.filter(Boolean).slice(0,6):[]
  const scene=text(input.scene)||text(input.scenicName)||'宁夏旅行场景'
  const scopedScene=/^宁夏/.test(scene)?scene:`宁夏${scene}`
  const style=text(input.style)||'真实摄影风格'
  const description=tags.length?tags.join('、'):'宁夏自然地貌与地域文化视觉元素'
  return {scene,style,description,cultureTags:tags,prompt:`生成${scopedScene}的无文字旅游视觉背景，融合贺兰山自然地貌与黄河文化视觉元素，${description}，${style}。优先展现山体、岩层、河流、沙漠或天空，避免街道、店铺、景区门头、海报和标牌。TEXT-FREE IMAGE ONLY. NO TEXT, NO LETTERS, NO WORDS, NO CHINESE CHARACTERS, NO ENGLISH WORDS, NO ARABIC LETTERING, NO TYPOGRAPHY, NO CAPTIONS, NO LOGO TEXT, NO LOGOS, NO SIGNAGE, NO READABLE SIGNS, NO WATERMARK, NO PSEUDO-TEXT.`}
}

function withTimeout(promise,timeoutMs){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('HUNYUAN_IMAGE_TIMEOUT')),timeoutMs)
    Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value)},error=>{clearTimeout(timer);reject(error)})
  })
}

function generateTravelImage(input={}){
  const request=buildTravelImageRequest(input)
  if(cloudConfig.VISION_MODE!==cloudConfig.visionModes.HUNYUAN_ENABLED){
    return Promise.resolve(Object.assign(fallbackVision(input,'HUNYUAN_NOT_ENABLED'),{request}))
  }
  return withTimeout(imageService.generateImage({prompt:request.prompt,size:'1024x768',scene:request.scene,style:request.style,culture:(request.cultureTags||[]).join('、'),pet:'三萌宠联名'}),65000).then(result=>{
    if(!result.success||!result.imageUrl)throw new Error(result.error||result.message||result.code||'HUNYUAN_EMPTY_IMAGE')
    return {source:SOURCE.HUNYUAN_AI,image:result.imageUrl,label:LABEL.HUNYUAN_AI,name:text(input.scenicName)||request.scene,bestTime:requestedBestTime(input.userPrompt),type:'AI旅行效果图',verified:false,placeholder:false,provider:result.provider||cloudConfig.imageProvider,model:result.model||cloudConfig.imageModel,request}
  }).catch(error=>{
    console.error('[SCENIC_VISION][HUNYUAN_FAIL]',error)
    return Object.assign(fallbackVision(input,error&&error.message||'HUNYUAN_IMAGE_FAILED'),{request})
  })
}

module.exports={SOURCE,LABEL,matchScenic,resolveScenicVision,buildTravelImageRequest,generateTravelImage}
