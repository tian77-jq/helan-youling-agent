function mark(result,mode,source,confidence){return Object.assign({},result,{mode:mode||result.mode||'AI_CREATIVE',source:source||result.source||'LOCAL_DEMO_MODE',confidence:confidence||result.confidence||'medium'})}
module.exports={mark}
