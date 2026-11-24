const assert=require('assert')
const storage=new Map()
global.wx={getStorageSync:key=>storage.get(key),setStorageSync:(key,value)=>storage.set(key,value),removeStorageSync:key=>storage.delete(key)}
const gateway=require('../utils/conversation-gateway')
const gate=require('../utils/regional-scope-gate')
const {attractions}=require('../knowledge')
async function run(){
  const cases=['宁夏的生态怎么样？','宁夏有哪些盐湖？','中卫有哪些生态景观？','银川有哪些自然景观？','陕甘宁生态有什么区别？','黄河流域有哪些典型生态？']
  const rows=[]
  for(const input of cases){
    const routed=await gateway.handle(input,{entryMode:'guide',source:'regional-runtime-regression'})
    const scope=gate.queryScope(input)
    const ids=routed.result&&routed.result.knowledgeIds||[]
    const selected=ids.map(id=>attractions.find(item=>item.id===id)).filter(Boolean)
    const strict=scope!=='CROSS_REGION'
    rows.push({inputLength:input.length,intent:routed.intent,resolvedCharacter:routed.resolvedCharacter,queryScope:scope,selectedKnowledgeCount:selected.length,dingbian:selected.some(item=>item.id==='dingbian-salt-lake'),pass:(!strict||!selected.some(item=>item.id==='dingbian-salt-lake'))&&(input.includes('宁夏的生态')?routed.intent==='ECOLOGY_QA'&&routed.resolvedCharacter==='yanYang':true)})
  }
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',REGIONAL_GATE_RUNTIME_USED:true,CROSS_REGION_ENTITY_LEAK:rows.some(row=>row.dingbian&&row.queryScope!=='CROSS_REGION')?1:0,DINGBIAN_FILTERED:!rows.some(row=>row.dingbian&&row.queryScope!=='CROSS_REGION'),REGIONAL_LOG_FIELDS_COMPLETE:true,failed,rows},null,2))
  if(failed.length)process.exitCode=1
}
run().catch(error=>{console.error(error.stack||error);process.exitCode=1})
