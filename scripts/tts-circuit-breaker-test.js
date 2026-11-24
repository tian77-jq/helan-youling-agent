const calls=[]
global.wx={
  cloud:{callFunction:async()=>{calls.push('tencent');return {result:{success:false,errorCode:'AuthFailure.UnauthorizedOperation',errorMessage:'denied'}}}},
  setStorageSync:()=>{}
}
const voice=require('../services/voice-service')

async function main(){
  const first=await voice.speak('测试岩羊语音',{character:'yanYang'})
  const second=await voice.speak('测试岩羊语音',{character:'yanYang'})
  const health=voice.getProviderHealth()
  const pass=calls.length===0&&health.releaseMode==='SUBTITLE'&&first.mode==='CAPTION_ONLY'&&second.mode==='CAPTION_ONLY'&&first.reason==='RELEASE_SUBTITLE_MODE'&&second.reason==='RELEASE_SUBTITLE_MODE'
  console.log(JSON.stringify({status:pass?'PASS':'FAIL',tencentCalls:calls.length,health,first:first.reason,second:second.reason},null,2))
  if(!pass)process.exitCode=1
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
