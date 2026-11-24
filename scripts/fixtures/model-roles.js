// Role boundary: GPT Luna develops this repository; it never answers end users.
const DEVELOPMENT_MODEL='GPT_LUNA'
const RUNTIME_PRIMARY={provider:'cloudbase',model:'hy3',role:'USER_RUNTIME_TEXT_MODEL',status:'ACTIVE'}
const RUNTIME_SECONDARY={provider:'coding-plan',model:'Deepseek-v4-flash',role:'USER_RUNTIME_TEXT_MODEL',status:'STANDBY'}

const productionProviderRegistry=[RUNTIME_PRIMARY,RUNTIME_SECONDARY]

module.exports={
  DEVELOPMENT_MODEL,
  RUNTIME_PRIMARY_MODEL:'HUNYUAN_HY3',
  RUNTIME_SECONDARY_MODEL:'DEEPSEEK_V4_FLASH',
  runtimePrimary:RUNTIME_PRIMARY,
  runtimeSecondary:RUNTIME_SECONDARY,
  productionProviderRegistry,
  traffic:{HUNYUAN_HY3:1,DEEPSEEK_V4_FLASH:0,GPT_LUNA:null}
}
