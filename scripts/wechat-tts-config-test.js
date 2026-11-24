const fs=require('fs')
const app=JSON.parse(fs.readFileSync('app.json','utf8'))
const provider=fs.readFileSync('providers/wechat-tts-provider.js','utf8')
const voice=fs.readFileSync('services/voice-service.js','utf8')
const release=fs.readFileSync('scripts/fixtures/voice-release.js','utf8')
const plugin=app.plugins&&app.plugins.WechatSI||{}
const checks={
  releaseSubtitleMode:/\|\|'SUBTITLE'/.test(release),
  providerAppId:/wx069ba97219f66d99/.test(provider),
  versionDocumented:/0\.3\.6/.test(fs.readFileSync('docs/wechat-gold-rc-report.md','utf8')),
  pluginLoad:/requirePlugin\('WechatSI'\)/.test(provider),
  textToSpeech:/plugin\.textToSpeech/.test(provider),
  normalizedResult:/success: true[\s\S]*audio: \{ url: filename \}/.test(provider),
  sharedPlaybackContract:/audio\.url/.test(voice)&&/wechatSynthesize/.test(voice),
  subtitleFallback:/CAPTION_ONLY/.test(voice)
}
const failed=Object.entries(checks).filter(([,pass])=>!pass).map(([name])=>name)
console.log(JSON.stringify({WECHAT_PLUGIN_CONFIG_PASS:failed.length?'FAIL':'PASS',checks,pluginAuthorization:'PENDING_ADMIN_ACTION',releaseVoiceMode:'SUBTITLE'},null,2))
if(failed.length)process.exitCode=1
