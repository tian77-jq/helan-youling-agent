const avatar=require('../services/digital-avatar-service')
let calls=0
global.wx={cloud:{callFunction:()=>{calls++;return Promise.resolve({result:{success:false,errorCode:'AuthFailure.UnauthorizedOperation',errorMessage:'blocked'}})},getTempFileURL:()=>Promise.resolve({fileList:[]})},setStorageSync:()=>{}}
async function run(){
  const payload=avatar.prepare({answer:'银川晚上可以去鼓楼、览山公园和怀远夜市。'},'银川晚上去哪玩？')
  const results=await Promise.all(Array.from({length:10},()=>avatar.speak(payload)))
  const pass=calls<=1&&results.length===10&&results.every(x=>x.voiceCharacter===payload.character)
  console.log(JSON.stringify({status:pass?'PASS':'FAIL',VOICE_ENTRY_REGRESSION:pass?'PASS':'FAIL',REAL_TTS_REQUESTS_ON_10_RAPID_TAPS:calls,character:payload.character},null,2))
  process.exitCode=pass?0:1
}
run().catch(error=>{console.error(error);process.exitCode=1})
