let modelOutput={knowledgeId:'helan-rock-painting',entityName:'贺兰山岩画',category:'attraction',confidence:0.91,description:'山体岩面上可见刻画图案'}
require('../config/cloud').featureVisionEnabled=true
global.wx={
  getFileSystemManager:()=>({readFile:options=>options.success({data:'dGVzdC1pbWFnZQ=='})}),
  cloud:{extend:{AI:{createModel:()=>({generateText:async request=>{
    if(request.model!=='glm-5v-turbo')throw new Error('WRONG_VISION_MODEL')
    const content=request.messages[1].content
    if(!Array.isArray(content)||!content.some(block=>block.type==='image_url'))throw new Error('IMAGE_BLOCK_MISSING')
    return {choices:[{message:{content:JSON.stringify(modelOutput)}}]}
  }})}}}
}

const vision=require('../feature/utils/vision-agent')

async function run(output){
  modelOutput=output
  try{return await vision.recognize('mock-image.jpg','zh-CN')}
  catch(error){return {error:error.message,message:vision.friendlyError(error)}}
}

async function main(){
  const matched=await run({knowledgeId:'helan-rock-painting',entityName:'贺兰山岩画',category:'attraction',confidence:0.91,description:'岩面刻画'})
  const low=await run({knowledgeId:'xixia-tombs',entityName:'西夏陵',category:'attraction',confidence:0.51,description:'远处土丘'})
  const invented=await run({knowledgeId:'invented-place',entityName:'虚构景点',category:'attraction',confidence:0.99,description:'无法核验'})
  const rows=[
    {case:'高置信知识库实体',result:matched,pass:matched.status==='MATCHED'&&matched.knowledgeId==='helan-rock-painting'},
    {case:'低置信结果',result:low,pass:low.error==='UNKNOWN_SCENE'},
    {case:'知识库外实体',result:invented,pass:invented.error==='UNKNOWN_SCENE'}
  ]
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',rows},null,2))
  if(failed.length)process.exitCode=1
}

main().catch(error=>{console.error(error.stack||error);process.exitCode=1})
