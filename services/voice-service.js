// Voice output is intentionally frozen to caption-only mode for the current release.
function status(){return {available:false,mode:'CAPTION_ONLY',reason:'V1_VOICE_FROZEN'}}
function synthesize(text){return Promise.resolve({audio:'',text:String(text||''),status:status()})}
module.exports={status,synthesize}
