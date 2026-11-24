const vision=require('../vision-agent/prompt-builder')
function buildPrompt(input){return vision.build(input)}
module.exports={buildPrompt}
