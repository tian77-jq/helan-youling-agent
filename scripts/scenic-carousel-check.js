const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const {scenicCollabs}=require(path.join(root,'utils','data'))
const {attractions}=require(path.join(root,'knowledge'))
const routes=new Set(['feature/attraction/detail'])
const entityIds=new Set(attractions.map(item=>item.id))
const exists=src=>src&&src.startsWith('/')&&fs.existsSync(path.join(root,src.slice(1)))
const items=scenicCollabs.map((item,index)=>{
  const route=String(item.route||'').replace(/^\//,'')
  const isConcept=item.entityType==='concept'
  return {index:index+1,id:item.id,image:item.image,entityId:item.entityId,entityType:item.entityType,imageValid:exists(item.image),entityValid:isConcept||entityIds.has(item.entityId),routeValid:isConcept?route==='preview':routes.has(route),pass:Boolean(item.id&&item.image&&item.entityId&&exists(item.image)&&(isConcept||entityIds.has(item.entityId))&&(isConcept?route==='preview':routes.has(route)))}
})
const duplicateIds=items.map(item=>item.id).filter((id,index,all)=>all.indexOf(id)!==index)
const result={status:items.every(item=>item.pass)&&duplicateIds.length===0?'STATIC_PASS':'FAIL',TOTAL_ITEMS:items.length,IMAGE_VALID:items.filter(item=>item.imageValid).length,ENTITY_VALID:items.filter(item=>item.entityValid).length,ROUTE_VALID:items.filter(item=>item.routeValid).length,DUPLICATE_IDS:duplicateIds,BROKEN_ITEMS:items.filter(item=>!item.pass),items}
console.log(JSON.stringify(result,null,2))
if(result.status!=='STATIC_PASS')process.exit(1)
