const voiceIds = {
  // Phase 28C first E2E candidate from Tencent's official voice catalogue.
  // Override with TTS_VOICE_YANYANG when the account uses another verified voice.
  yanYang: process.env.TTS_VOICE_YANYANG || '101001',
  shaHu: process.env.TTS_VOICE_SHAHU || '',
  luoTuo: process.env.TTS_VOICE_LUOTUO || ''
}

module.exports = {
  envId: process.env.ENV_ID || process.env.TCB_ENV || '',
  // SCF Runtime Role injects temporary credentials under these names.
  // Dedicated credentials remain an explicit fallback and are never logged.
  secretId: process.env.TENCENTCLOUD_SECRET_ID || process.env.TENCENTCLOUD_SECRETID || process.env.TENCENT_TTS_SECRET_ID || '',
  secretKey: process.env.TENCENTCLOUD_SECRET_KEY || process.env.TENCENTCLOUD_SECRETKEY || process.env.TENCENT_TTS_SECRET_KEY || '',
  token: process.env.TENCENTCLOUD_SESSION_TOKEN || process.env.TENCENTCLOUD_SESSIONTOKEN || process.env.TENCENT_TTS_TOKEN || '',
  region: process.env.TENCENT_TTS_REGION || 'ap-guangzhou',
  voiceIds,
  freeOnly: String(process.env.TTS_FREE_ONLY || 'true').toLowerCase() === 'true',
  enabled: String(process.env.TTS_ENABLED_BY_USER || 'true').toLowerCase() === 'true'
}
