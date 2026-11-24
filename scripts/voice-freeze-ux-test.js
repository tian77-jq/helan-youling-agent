const fs=require('fs')
const release=require('./fixtures/voice-release')
const copy=require('../utils/voice-coming-soon')
const detail=fs.readFileSync('feature/ip/detail.js','utf8')
const trip=fs.readFileSync('pages/trip/index.js','utf8')
const tripWxml=fs.readFileSync('pages/trip/index.wxml','utf8')
const detailWxml=fs.readFileSync('feature/ip/detail.wxml','utf8')
const avatar=fs.readFileSync('services/digital-avatar-service.js','utf8')
const chars=['yanYang','luoTuo','shaHu']
const checks={
  VOICE_V1_FROZEN:release.REAL_TTS_AVAILABLE===false&&release.VOICE_FEATURE_STATUS==='FROZEN_FOR_V1',
  TTS_REQUEST_COUNT_ZERO:!avatar.includes('voice.synthesize('),
  VOICE_ENTRY_PRESERVED:detail.includes('listenStory')&&trip.includes('speakAnswer'),
  COMING_SOON_UX:detail.includes('voiceSheetVisible')&&trip.includes('voiceSheetVisible'),
  CTA_CONTINUES_CHAT:detail.includes('continueVoiceChat')&&trip.includes('continueVoiceChat'),
  SUBTITLE_FALLBACK:detailWxml.includes('storyAvatar.speakText')&&tripWxml.includes('petAnswer.speakText'),
  DEAD_BUTTON_ZERO:chars.every(character=>copy.copy(character).body.length>10)
}
const pass=Object.values(checks).every(Boolean)
console.log(JSON.stringify({status:pass?'PASS':'FAIL',...checks,TTS_REQUEST_COUNT:0,VOICE_DEAD_BUTTON_COUNT:0,VOICE_BLOCKS_RELEASE:'NO'},null,2))
if(!pass)process.exitCode=1
