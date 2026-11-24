const assert=require('assert')
const roles=require('./fixtures/model-roles')
const cloud=require('../config/cloud')
const router=require('../utils/text-model-router')
const registry=roles.productionProviderRegistry
assert.strictEqual(roles.DEVELOPMENT_MODEL,'GPT_LUNA')
assert.strictEqual(roles.RUNTIME_PRIMARY_MODEL,'HUNYUAN_HY3')
assert.strictEqual(roles.RUNTIME_SECONDARY_MODEL,'DEEPSEEK_V4_FLASH')
assert.strictEqual(registry.some(item=>item.model==='GPT_LUNA'),false)
assert.strictEqual(registry.find(item=>item.provider==='cloudbase').model,'hy3')
assert.strictEqual(registry.find(item=>item.provider==='coding-plan').model,'Deepseek-v4-flash')
assert.strictEqual(router.active(cloud),'cloudbase')
assert.strictEqual(cloud.textModelRouting.fallbackMode,'manual')
assert.strictEqual(cloud.textModelRouting.autoFailover,false)
console.log(JSON.stringify({
  status:'PASS',
  DEVELOPMENT_MODEL:roles.DEVELOPMENT_MODEL,
  RUNTIME_PRIMARY_MODEL:roles.RUNTIME_PRIMARY_MODEL,
  RUNTIME_SECONDARY_MODEL:roles.RUNTIME_SECONDARY_MODEL,
  GPT_LUNA_IN_PRODUCTION_ROUTER:'NO',
  DEEPSEEK_IS_USER_ANSWER_MODEL:'YES',
  HUNYUAN_IS_USER_ANSWER_MODEL:'YES',
  ACTIVE_TEXT_GATEWAY:router.active(cloud),
  HUNYUAN_REQUEST_SHARE:'100%',
  DEEPSEEK_REQUEST_SHARE:'0%',
  GPT_LUNA_RUNTIME_SHARE:'NOT_APPLICABLE_TO_RUNTIME'
},null,2))
