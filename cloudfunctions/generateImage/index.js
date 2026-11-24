const cloudbase=require('@cloudbase/node-sdk')
const https=require('https')
const crypto=require('crypto')

const ENV_ID=process.env.ENV_ID||process.env.TCB_ENV||'cloudbase-d6g1u2dzk45c62fc1'
const MODEL='HY-Image-3.0-Plus-4090-Tob-v1.0'
const I2I_MODEL='HY-Image-v3.0-I2I-ToB-v1.0.1'
// Use the sizes explicitly documented by the current Hunyuan Image 3.0 API.
const ALLOWED_SIZES=new Set(['720x1280','1024x1024','1280x720','1280x1280'])
const MAX_IMAGE_BYTES=15*1024*1024
const MAX_REDIRECTS=3
const MAX_CONCURRENT_GENERATIONS=2
const RESULT_CACHE_TTL_MS=5*60*1000
const app=cloudbase.init({env:ENV_ID})
const ai=app.ai()
const inFlight=new Map()
const recentResults=new Map()
let activeGenerations=0

function safePrompt(value){const prompt=String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim();if(!prompt)throw new Error('EMPTY_PROMPT');if(prompt.length>500)throw new Error('PROMPT_TOO_LONG');return prompt}
function safeRequestId(value){const id=String(value||'').trim();return /^[a-zA-Z0-9_-]{8,80}$/.test(id)?id:`server-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`}
function safeReferences(value){if(!Array.isArray(value))return [];const refs=value.filter(Boolean).slice(0,1).map(item=>String(item));if(refs.some(item=>item.length>2*1024*1024))throw new Error('REFERENCE_TOO_LARGE');return refs}

function downloadImage(url,redirects=0){
  return new Promise((resolve,reject)=>{
    let target
    try{target=new URL(url)}catch(error){return reject(new Error('INVALID_IMAGE_URL'))}
    if(target.protocol!=='https:')return reject(new Error('UNSAFE_IMAGE_URL'))
    const request=https.get(url,response=>{
      if(response.statusCode>=300&&response.statusCode<400&&response.headers.location){
        response.resume()
        if(redirects>=MAX_REDIRECTS)return reject(new Error('IMAGE_REDIRECT_LIMIT'))
        const redirected=new URL(response.headers.location,target).toString()
        return downloadImage(redirected,redirects+1).then(resolve,reject)
      }
      if(response.statusCode!==200){response.resume();return reject(new Error('IMAGE_DOWNLOAD_HTTP_'+response.statusCode))}
      const contentType=String(response.headers['content-type']||'').toLowerCase()
      if(contentType&&!contentType.startsWith('image/')){response.resume();return reject(new Error('INVALID_IMAGE_CONTENT_TYPE'))}
      const declaredBytes=Number(response.headers['content-length']||0)
      if(declaredBytes>MAX_IMAGE_BYTES){response.resume();return reject(new Error('IMAGE_TOO_LARGE'))}
      const chunks=[]
      let received=0
      response.on('data',chunk=>{received+=chunk.length;if(received>MAX_IMAGE_BYTES){response.destroy(new Error('IMAGE_TOO_LARGE'));return}chunks.push(chunk)})
      response.on('end',()=>resolve(Buffer.concat(chunks)))
      response.on('error',reject)
    })
    request.setTimeout(30000,()=>request.destroy(new Error('IMAGE_DOWNLOAD_TIMEOUT')))
    request.on('error',reject)
  })
}

async function persistImage(url,requestId){
  const fileContent=await downloadImage(url)
  const safeId=String(requestId||Date.now()).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)||String(Date.now())
  const uploaded=await app.uploadFile({cloudPath:`ai-creations/${safeId}.jpg`,fileContent})
  return uploaded.fileID
}

function errorPayload(error,stage){
  const code=String(error&&((error.code||error.errCode))||error&&error.message||'IMAGE_GENERATION_FAILED').replace(/[^a-zA-Z0-9_.-]/g,'_').slice(0,80)
  return {success:false,stage,errorCode:code,message:`AI生图失败（${stage} / ${code}），请稍后重试。`}
}

async function generate(event){
  let stage='validate'
  try{
    const prompt=safePrompt(event&&event.prompt)
    const size=ALLOWED_SIZES.has(event&&event.size)?event.size:'1024x1024'
    const imageUrls=safeReferences(event&&event.imageUrls)
    const images=safeReferences(event&&event.images)
    const hasReference=imageUrls.length>0||images.length>0
    const selectedModel=hasReference?I2I_MODEL:MODEL
    stage='generate'
    const imageModel=ai.createImageModel('hunyuan-image')
    // Official prompt revision improves composition and visual quality. The
    // prompt builder already contains hard scene/culture/IP constraints, so
    // revision can be enabled without allowing a destination swap.
    // In the current Node16 CloudBase runtime the SDK request itself times
    // out at ~15s when revise=true. Keep the stable official model call and
    // enforce quality through the grounded prompt instead.
    const request={model:selectedModel,prompt,size,revise:{value:false},enable_thinking:{value:false},footnote:'贺兰有灵'}
    if(imageUrls.length)request.image_urls=imageUrls
    if(images.length)request.images=images
    console.log('[HY_IMAGE_PROVIDER_CALL]',{provider:'hunyuan-node-sdk',sdk:'@cloudbase/node-sdk>=3.18.3',model:selectedModel,mode:hasReference?'I2I':'T2I',referenceCount:hasReference?1:0,size,promptLength:prompt.length})
    const response=await imageModel.generateImage(request)
    const image=response&&response.data&&response.data[0]
    if(!image||!image.url)throw new Error('EMPTY_IMAGE_RESULT')
    const requestId=safeRequestId(event&&event.requestId||response.id)
    let fileID=''
    try{
      stage='persist'
      fileID=await persistImage(image.url,requestId)
    }catch(persistError){
      // The provider URL remains usable for 24 hours. Persistence failure must
      // not discard an otherwise successful generation.
      console.error('[HY_IMAGE_PERSIST_ERROR]',persistError)
    }
    // `imageUrl` is intentionally the signed HTTPS URL returned by Hunyuan so
    // the mini-program <image> component can render it immediately. Keep the
    // permanent CloudBase file ID separately for later asset management.
    return {success:true,provider:'hunyuan-node-sdk',source:'HUNYUAN_MODE',mode:hasReference?'I2I':'T2I',imageUrl:image.url,url:image.url,providerUrl:image.url,fileID,revisedPrompt:image.revised_prompt||image.revisedPrompt||'',model:selectedModel,sdk:'@cloudbase/node-sdk',taskId:requestId,persisted:Boolean(fileID)}
  }catch(error){
    console.error('[HY_IMAGE_ERROR]',{stage,code:error&&((error.code||error.errCode)),message:error&&error.message,stack:error&&error.stack})
    return Object.assign({provider:'hunyuan'},errorPayload(error,stage))
  }
}

exports.main=async event=>{
  let identity
  try{identity=app.auth().getUserInfo()}catch(error){return {success:false,errorCode:'AUTH_REQUIRED'}}
  if(!identity||!identity.openId||!identity.appId)return {success:false,stage:'admission',errorCode:'AUTH_REQUIRED',message:'请从微信小程序重新进入创作。'}
  const requestId=safeRequestId(event&&event.requestId)
  const owner=crypto.createHash('sha256').update(JSON.stringify([identity.appId,identity.openId])).digest('hex')
  const cacheKey=owner+':'+requestId
  const fingerprint=crypto.createHash('sha256').update(JSON.stringify([event&&event.prompt,event&&event.size,event&&event.imageUrls,event&&event.images])).digest('hex')
  const prior=recentResults.get(cacheKey)||inFlight.get(cacheKey)
  if(prior&&prior.fingerprint!==fingerprint)return {success:false,errorCode:'IDEMPOTENCY_CONFLICT',message:'创作参数已变化，请重新提交。'}
  const cached=recentResults.get(cacheKey)
  if(cached&&Date.now()-cached.at<RESULT_CACHE_TTL_MS)return Object.assign({},cached.value,{cached:true})
  if(inFlight.has(cacheKey))return inFlight.get(cacheKey).task
  if(activeGenerations>=MAX_CONCURRENT_GENERATIONS)return {success:false,stage:'admission',errorCode:'SERVER_BUSY',message:'当前创作人数较多，请稍后重试。',retryAfterSeconds:10}
  activeGenerations+=1
  const storageId=crypto.createHash('sha256').update(cacheKey).digest('hex')
  const task=generate(Object.assign({},event,{requestId:storageId})).then(value=>{if(value.success)recentResults.set(cacheKey,{at:Date.now(),value,fingerprint});return value}).finally(()=>{activeGenerations=Math.max(0,activeGenerations-1);inFlight.delete(cacheKey);const now=Date.now();for(const [key,item] of recentResults){if(now-item.at>=RESULT_CACHE_TTL_MS)recentResults.delete(key)}})
  inFlight.set(cacheKey,{task,fingerprint})
  return task
}
