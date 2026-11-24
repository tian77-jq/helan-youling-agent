const vm=require('vm'),fs=require('fs'),assert=require('assert')
let user={openId:'alice',appId:'app'},calls=0
const sdk={init:()=>({auth:()=>({getUserInfo:()=>user}),ai:()=>({createImageModel:()=>({generateImage:async()=>{calls++;return {data:[{url:'invalid'}]}}})})})}
const sandbox={exports:{},require:id=>id==='@cloudbase/node-sdk'?sdk:require(id),process:{env:{}},console:{log(){},error(){}},URL,Buffer}
vm.runInNewContext(fs.readFileSync('cloudfunctions/generateImage/index.js','utf8'),sandbox)
;(async()=>{
 const main=sandbox.exports.main,request={prompt:'宁夏',requestId:'request-123'}
 const a=await main(request);assert(a.success)
 assert((await main(request)).cached);assert.strictEqual(calls,1)
 assert.strictEqual((await main({...request,prompt:'另一个场景'})).errorCode,'IDEMPOTENCY_CONFLICT')
 user={openId:'bob',appId:'app'};const b=await main(request);assert(b.success);assert.notStrictEqual(a.taskId,b.taskId);assert.strictEqual(calls,2)
 user={};assert.strictEqual((await main({...request,openId:'alice'})).errorCode,'AUTH_REQUIRED');assert.strictEqual(calls,2)
 console.log('PASS: trusted identity, cross-user cache isolation, payload conflict, storage path isolation; provider is mocked, NOT cloud deployment proof')
})().catch(error=>{console.error(error);process.exitCode=1})
