const trace=require('../utils/ai-experience-trace')
const item=trace.create({entrySource:'host-demo',tenantId:'synthetic-tenant',scenicId:'shapotou',landmarkId:'shapotou',intent:'TRIP_PLANNING',knowledgeRetrievedCount:3,knowledgeSelectedCount:2,knowledgeIds:['shapotou'],provider:'cloudbase',modelAlias:'hy3',latencyMs:120,resultType:'TRIP_PLAN'})
const forbidden=['rawInput','prompt','conversation','secret','token']
const failures=forbidden.filter(key=>Object.prototype.hasOwnProperty.call(item,key))
if(!item.traceId||!item.timestamp||failures.length||!trace.ERROR_TAXONOMY.MODEL_TIMEOUT.retryable){console.error(JSON.stringify({pass:false,failures},null,2));process.exit(1)}
console.log(JSON.stringify({pass:true,traceIdPresent:true,rawInputLogged:false,errorCodes:Object.keys(trace.ERROR_TAXONOMY).length}))
