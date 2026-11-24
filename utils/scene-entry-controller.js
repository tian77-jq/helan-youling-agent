// One-shot scene entrance choreography shared by core pages.
// The controller owns replay policy; pages only declare their scene identity.
const POLICIES={FIRST_ONLY:'FIRST_ONLY',EVERY_ENTER:'EVERY_ENTER',CONTENT_CHANGE:'CONTENT_CHANGE',OFF:'OFF'}
const counters={}

function activate(page,scene,options={}){
  const policy=options.replayPolicy||POLICIES.EVERY_ENTER
  if(policy===POLICIES.OFF)return {scene,policy,nonce:0,entryMotionClass:''}
  const key=String(scene||'scene')
  counters[key]=(counters[key]||0)+1
  const nonce=counters[key]
  const className=`scene-entry scene-entry-${key.toLowerCase()}-${nonce}`
  const originalMotionToken=page&&page.data&&page.data.motionToken
  if(page&&typeof page.setData==='function'){
    page.setData({entryMotionClass:'',motionToken:`${key}-ENTRY-${nonce}`},()=>page.setData({entryMotionClass:className}))
    setTimeout(()=>{if(page&&typeof page.setData==='function')page.setData({entryMotionClass:'',motionToken:originalMotionToken||key})},1800)
  }
  return {scene,policy,nonce,entryMotionClass:className}
}

function reset(){Object.keys(counters).forEach(key=>delete counters[key])}

module.exports={POLICIES,activate,reset}
