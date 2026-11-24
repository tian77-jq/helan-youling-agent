const adapter=require('../adapters/buyer-data/canonical-schema')
const cities=['银川','石嘴山','吴忠','中卫','固原']
const records=[]
for(let i=0;i<240;i++){const type=adapter.SCHEMA_TYPES[i%adapter.SCHEMA_TYPES.length];records.push({type,id:`SYNTHETIC_TEST_DATA-${type}-${i}`,poiName:`Synthetic Ningxia ${i}`,city:cities[i%cities.length],url:type==='MediaAsset'?`https://synthetic.invalid/assets/${i}.jpg`:undefined,updatedAt:i%17===0?'2020-01-01':'2026-08-01',sourceId:'SYNTHETIC_TEST_DATA'})}
records.push({type:'ScenicSpot',id:'bad-region',name:'Outside',city:'西安',sourceId:'SYNTHETIC_TEST_DATA'})
records.push({type:'ScenicSpot',id:'missing-name',city:'银川',sourceId:'SYNTHETIC_TEST_DATA'})
records.push({type:'MediaAsset',id:'bad-media',name:'Bad media',city:'银川',url:'javascript:bad',sourceId:'SYNTHETIC_TEST_DATA'})
records.push(records[0],records[1])
const result=adapter.importRecords(records,{sourceType:'BUYER_DATA',tenantId:'synthetic-tenant'})
const failures=[]
if(result.accepted.length<230)failures.push('bulk accepted count too low')
if(result.metrics.regionalScopeReject<1)failures.push('wrong region not rejected')
if(result.metrics.duplicateHandling<2)failures.push('duplicates not rejected')
if(result.metrics.staleDataMarked<1)failures.push('stale records not marked')
if(result.rejected.filter(item=>item.reason==='MISSING_REQUIRED').length<1)failures.push('missing field not rejected')
if(failures.length){console.error(JSON.stringify({pass:false,failures,metrics:result.metrics},null,2));process.exit(1)}
console.log(JSON.stringify({pass:true,syntheticInput:records.length,accepted:result.accepted.length,rejected:result.rejected.length,metrics:result.metrics}))
