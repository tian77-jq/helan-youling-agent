const assert=(v,m)=>{if(!v)throw new Error(m)}
async function main(){
  global.wx={}
  const orchestrator=require('../utils/ai-orchestrator')
  const results=[]
  for(let i=0;i<10;i++){
    const value=await orchestrator.plan('第一次来宁夏，两天时间，喜欢历史和美食','zh-CN')
    const valid=value.plan&&value.plan.days.length===2&&value.plan.days.every(day=>day.items.every(item=>{
      if(item.type==='attraction'||item.type==='food')return Boolean(item.knowledgeId)
      return item.type==='transit'||item.type==='rest'
    }))
    results.push({run:i+1,source:value.source,valid})
  }
  const success=results.filter(item=>item.valid).length
  assert(success>=9,'TRIP_STABILITY_BELOW_90_PERCENT')
  console.log(JSON.stringify({status:'PASS',success,total:10,results},null,2))
}
main().catch(error=>{console.error(error);process.exit(1)})
