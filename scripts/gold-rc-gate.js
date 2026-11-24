const {spawnSync}=require('child_process')
const path=require('path')

const root=path.resolve(__dirname,'..')
const checks=[
  ['CURRENT_TURN_ISOLATION','scripts/current-turn-isolation-test.js'],
  ['INTENT_ROUTER','scripts/intent-router-regression.js'],
  ['CHARACTER_ROUTER','scripts/character-router-test.js'],
  ['ANSWER_RELEVANCE','scripts/answer-relevance-regression.js'],
  ['CONVERSATION_STRESS','scripts/conversation-context-stress-test.js'],
  ['TIME_SLOT_REASONING','scripts/trip-time-slot-test.js'],
  ['ANSWER_SPEECH_CONSISTENCY','scripts/avatar-answer-consistency-test.js'],
  ['TRIP_STABILITY','scripts/trip-stability.js'],
  ['CODE_QUALITY','scripts/audit-code-quality.js'],
  ['PACKAGE','scripts/verify-project.js'],
  ['PRODUCT','scripts/product-test.js'],
  ['WECHAT_PLUGIN_CONFIG','scripts/wechat-tts-config-test.js'],
  ['TENCENT_CIRCUIT_BREAKER','scripts/tts-circuit-breaker-test.js']
  ,['PRODUCTION_RELEASE','scripts/wechat-production-release-gate.js']
]
const results=checks.map(([name,file])=>{
  const run=spawnSync(process.execPath,[path.join(root,file)],{cwd:root,encoding:'utf8'})
  return {name,status:run.status===0?'PASS':'FAIL'}
})
const failed=results.filter(item=>item.status!=='PASS')
console.log(JSON.stringify({
  CURRENT_STATUS:failed.length?'RC_LOCAL_GATE_FAILED':'RC_LOCAL_GATE_PASS',
  localChecks:results,
  TENCENT_PROVIDER:'PERMISSION_BLOCKED',
  WECHAT_OFFICIAL_PROVIDER:'NO_ACCESS_NOT_CONFIGURED',
  VOICE_REAL_PASS:'NO',
  HUNYUAN_PROVIDER_CALL:'USER_PROVIDED_REAL_SUCCESS_EVIDENCE',
  DEVICE_VALIDATION:'NOT_RUN_IN_THIS_GATE',
  WECHAT_GOLD_RC_READY:failed.length?'NO':'CONDITIONAL',
  CURRENT_BLOCKER:'VOICE_EXTERNAL_PERMISSION_ONLY'
},null,2))
if(failed.length)process.exitCode=1
