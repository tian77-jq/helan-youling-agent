const cloud=require('./cloud-service')
const provider=require('../vision-agent/image-provider')
const promptBuilder=require('./prompt-builder')
const governance=require('../ai-governance/index.js')

function buildPrompt(input){
  const value=input||{}
  const built=promptBuilder.buildPrompt(value)
  return Object.assign({},built,{output:'1024x1024',requestId:String(value.requestId||''),imageUrls:Array.isArray(value.imageUrls)?value.imageUrls:[],images:Array.isArray(value.images)?value.images:[]})
}

// Keep the page-facing image contract stable while dispatching through the
// replaceable provider adapter. The demo build can call the Hunyuan CloudBase
// function; failures remain explicit and never masquerade as generated art.
function generateImage(prompt){
  return provider.generateImage(buildPrompt(prompt)).then(result=>governance.mark(result,(result.source==='HUNYUAN'||result.source==='HUNYUAN_MODE')?'AI_ENHANCED':'AI_CREATIVE',result.source))
}
function generate(input){return generateImage(input)}

module.exports={buildPrompt,generateImage,generate,ensureCloud:cloud.ensureCloud}
