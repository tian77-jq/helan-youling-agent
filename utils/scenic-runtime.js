// WeChat mini-program module resolution requires an explicit file path here;
// directory resolution works in Node but fails in the app-service runtime.
const shapotou=require('../adapters/shapotou/index')
const {planExperience}=require('../core/experience-orchestrator')
function getActiveScenicRuntime(scenicId){
  if(scenicId==='shapotou') return {scenicId:'shapotou',adapter:shapotou,plan:(request)=>planExperience(shapotou,request)}
  return {scenicId:'ningxia',adapter:null,plan:null}
}
module.exports={getActiveScenicRuntime}
