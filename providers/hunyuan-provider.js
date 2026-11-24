const config=require('../config/cloud')
const capability=require('./hunyuan/index.js')
function localResult(prompt){return {success:true,imageUrl:'',source:'LOCAL_DEMO_MODE',message:'已切换本地体验模式，未调用远程模型',prompt}}
function generateImage(prompt){
  if(!require('../config/build-mode').AI_IMAGE)return Promise.resolve({success:false,source:'DISABLED',code:'AI_IMAGE_DISABLED',message:'当前版本未开放图片生成'})
  if(config.imageMode!=='HUNYUAN_MODE')return Promise.resolve(localResult(prompt))
  try{
    if(typeof wx==='undefined'||!wx.cloud||typeof wx.cloud.callFunction!=='function')return Promise.resolve({success:false,source:'HUNYUAN',code:'CLOUD_UNAVAILABLE',message:'混元云函数不可用，未生成图片',prompt})
    wx.cloud.init({env:config.envId,traceUser:true})
    const suppliedId=String(prompt.requestId||'')
    const requestId=/^[a-zA-Z0-9_-]{8,80}$/.test(suppliedId)?suppliedId:'hly-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);const started=Date.now()
    const data={prompt:prompt.prompt||'',size:prompt.size||'1024x1024',requestId}
    if(Array.isArray(prompt.imageUrls)&&prompt.imageUrls.length)data.imageUrls=prompt.imageUrls.slice(0,1)
    if(Array.isArray(prompt.images)&&prompt.images.length)data.images=prompt.images.slice(0,1)
    const call=wx.cloud.callFunction({name:config.imageFunctionName||'generateImage',data})
    // The repository's CloudBase function is configured for 60s. Keep a small
    // client-side margin so the mini-program can receive the server timeout
    // result without leaving the user waiting for the former 125s ceiling.
    let timeoutId
    const timeout=new Promise((_,reject)=>{timeoutId=setTimeout(()=>reject(new Error('HUNYUAN_CLIENT_TIMEOUT')),65000)})
    console.log('[HUNYUAN_REQUEST]',{provider:'hunyuan',mode:config.imageMode,requestId,promptLength:(prompt.prompt||'').length})
    return Promise.race([call,timeout]).then(res=>{
      const rawResult=res&&res.result
      const result=typeof rawResult==='string'?(function(){try{return JSON.parse(rawResult)}catch(e){return {success:false,errorCode:'INVALID_FUNCTION_RESULT',error:rawResult}}})():(rawResult||{})
      if(!result.success){const failure=new Error(result.errorCode||result.code||'HUNYUAN_GENERATION_FAILED');failure.result=result;throw failure}
      const output=Object.assign({success:true,provider:'hunyuan',source:'HUNYUAN',requestId,elapsedMs:Date.now()-started},result,{prompt});console.log('[HUNYUAN_RESULT]',{provider:'hunyuan',mode:config.imageMode,requestId,status:'success',elapsedMs:output.elapsedMs,hasImageUrl:Boolean(output.imageUrl)});return output
    }).catch(error=>{const remote=error&&error.result||{};const code=remote.errorCode||remote.code||error&&error.message||'HUNYUAN_FAILED';const output={success:false,provider:'hunyuan',source:'HUNYUAN',code,detail:remote.error||remote.detail||error&&error.stack||'',rawError:remote,errorMessage:remote.message||'',message:remote.message||`混元生图失败（${code}），未生成图片`,prompt,requestId,elapsedMs:Date.now()-started};console.error('[HUNYUAN_RESULT]',output);return output})
      .finally(()=>clearTimeout(timeoutId))
  }catch(error){const code=error&&error.message||'HUNYUAN_FAILED';const output={success:false,provider:'hunyuan',source:'HUNYUAN',code,detail:error&&error.stack||'',rawError:error&&String(error),message:`混元生图失败（${code}），未生成图片`,prompt};console.error('[HUNYUAN_RESULT]',output);return Promise.resolve(output)}
}
module.exports={generateImage,capabilityStatus:capability.status}
