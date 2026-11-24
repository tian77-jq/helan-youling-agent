const config=require('../config/cloud')

function safeError(error,stage){
  return {errMsg:error&&error.errMsg||error&&error.message||'UNKNOWN_ERROR',errorCode:error&&error.code||error&&error.errCode||'',apiName:'wx.cloud.extend.AI.generateText',model:config.cloudAiModel,env:config.envId,stage}
}

async function runCloudAiSmokeTest(){
  const stage='smoke_test'
  if(!wx.cloud||!wx.cloud.extend||!wx.cloud.extend.AI)throw Object.assign(new Error('CLOUD_AI_UNAVAILABLE'),{diagnostic:safeError(null,stage)})
  const model=wx.cloud.extend.AI.createModel('cloudbase')
  console.log('[AI][CLOUD] request started')
  console.log('[AI][CLOUD] model = '+config.cloudAiModel)
  try{
    const response=await model.generateText({model:config.cloudAiModel,messages:[{role:'system',content:'只返回 JSON：{"ok":true,"message":"贺兰灵物AI已连接"}'},{role:'user',content:'请执行连接测试'}]})
    console.log('[AI][CLOUD] response received')
    const content=response&&response.choices&&response.choices[0]&&response.choices[0].message&&response.choices[0].message.content
    const safe=String(content||'').slice(0,240)
    console.log('[AI][CLOUD] smoke response = '+safe)
    if(!/"ok"\s*:\s*true/.test(safe))throw new Error('CLOUD_AI_SMOKE_INVALID_RESPONSE')
    console.log('CLOUD_AI_SMOKE_TEST_PASS')
    return {pass:true,model:config.cloudAiModel,response:safe}
  }catch(error){
    const diagnostic=safeError(error,stage)
    console.error('[AI][CLOUD] smoke failed',diagnostic)
    return {pass:false,diagnostic}
  }
}

module.exports={runCloudAiSmokeTest}
