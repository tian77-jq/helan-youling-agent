const modes=require('../config/build-modes')
const required=['PUBLIC_GENERATIVE_AI','AI_QA','AI_TRIP_GENERATION','AI_IMAGE','HOST_DEMO','DEV_DIAGNOSTICS','SYNTHETIC_BUYER_DATA','ANALYTICS']
const failures=[]
for(const [name,profile] of Object.entries(modes)){
 for(const key of required)if(typeof profile[key]!=='boolean')failures.push(`${name}.${key}`)
 if(['review','production'].includes(name)&&(['PUBLIC_GENERATIVE_AI','AI_QA','AI_TRIP_GENERATION','AI_IMAGE','HOST_DEMO','DEV_DIAGNOSTICS','SYNTHETIC_BUYER_DATA'].some(key=>profile[key])))failures.push(`${name}.unsafe-enabled-feature`)
}
console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',modes,failures},null,2));if(failures.length)process.exitCode=1
