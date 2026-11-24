const service=require('../services/scenicVisionService')

function assert(condition,message){if(!condition)throw new Error(message)}
const lanshan=service.resolveScenicVision({scenicName:'我想晚上去览山公园',userPrompt:'我想晚上去览山公园'})
assert(lanshan.source==='LOCAL_KB','览山公园应命中本地视觉库')
assert(lanshan.image&&lanshan.label===service.LABEL.LOCAL_KB&&lanshan.verified===false,'本地项目素材必须使用示意图标签且不得伪称已核验实景')
assert(lanshan.bestTime==='晚上'&&lanshan.type==='夜景','晚间请求应保留夜景语义')
const unknown=service.resolveScenicVision({scenicName:'星河秘境景区',userPrompt:'适合情侣的小众旅行'})
assert(unknown.source==='FALLBACK_MODE'&&unknown.placeholder,'未知地点在第一阶段应安全降级')
service.generateTravelImage({scene:'宁夏小众沙漠地点',style:'真实摄影风格',description:'适合情侣旅行宣传',cultureTags:['贺兰山','黄河文化']}).then(result=>{
  assert(result.source==='FALLBACK_MODE','LOCAL_ONLY 下不得调用混元')
  assert(result.request&&/宁夏/.test(result.request.prompt),'混元预留请求应生成宁夏约束 Prompt')
  console.log(JSON.stringify({status:'PASS',lanshan,unknown,hunyuanReserved:result.request},null,2))
}).catch(error=>{console.error(error);process.exitCode=1})
