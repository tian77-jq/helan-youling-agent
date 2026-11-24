// Release candidates must not depend on an un-authorized plugin. Switch to
// WECHAT_TTS only after the mini-program administrator has authorized it and
// the plugin declaration has been restored in app.json for a new build.
const VOICE_PROVIDER_RELEASE_MODE='SUBTITLE'
const REAL_TTS_AVAILABLE=false
const VOICE_FEATURE_STATUS='FROZEN_FOR_V1'
const VOICE_RELEASE_MODE='TEXT_COMPANION_WITH_FUTURE_VOICE'

module.exports={VOICE_PROVIDER_RELEASE_MODE,REAL_TTS_AVAILABLE,VOICE_FEATURE_STATUS,VOICE_RELEASE_MODE}
