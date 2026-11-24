const assert=require('assert')
const orchestrator=require('../utils/ai-orchestrator')

;(async()=>{
  const first=await orchestrator.respond('来宁夏玩一天，我自己','zh-CN',null,null,'plan')
  assert.strictEqual(first.intent,'TRIP_NEEDS_BASE_CITY')
  assert.strictEqual(first.conversationState.activePendingSlot,'BASE_CITY')
  assert.match(first.result.answer,/1天/)

  const origin=await orchestrator.respond('湖北襄阳','zh-CN',null,first.conversationState,'plan')
  assert.strictEqual(origin.intent,'TRIP_NEEDS_BASE_CITY')
  assert.strictEqual(origin.conversationState.pendingTripRequest.tripSlots.originCity,'湖北襄阳')

  const resumed=await orchestrator.respond('银川','zh-CN',null,origin.conversationState,'plan')
  assert.strictEqual(resumed.intent,'TRIP_PLANNING')
  assert.strictEqual(resumed.kind,'plan')
  assert.strictEqual(resumed.result.plan.constraints.days,1)
  assert.strictEqual(resumed.result.plan.constraints.city,'银川')
  console.log(JSON.stringify({status:'PASS',pendingSlot:'BASE_CITY',originCity:'湖北襄阳',baseCity:'银川',days:1},null,2))
})().catch(error=>{console.error(error.stack||error);process.exitCode=1})
