const controller=require('../utils/scene-entry-controller')
const pages=['HOME','DISCOVER','GALLERY','MY','TRIP','SHAPOTOU']
const results=[]
controller.reset()
pages.forEach(scene=>{
  const page={data:{motionToken:scene},setData(payload,done){this.data=Object.assign({},this.data,payload);if(done)done()}}
  const entries=[1,2,3].map(()=>controller.activate(page,scene))
  results.push({scene,entries:entries.map(item=>item.nonce),played:entries.every(item=>item.nonce>0),secondEntryNoop:entries[1].nonce===entries[0].nonce})
})
const failed=results.filter(item=>!item.played||item.secondEntryNoop)
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',secondEntryNoopCount:failed.filter(item=>item.secondEntryNoop).length,results},null,2))
if(failed.length)process.exitCode=1
