const crypto = require('crypto')
const tts = require('tencentcloud-sdk-nodejs-tts')
const cloudbase = require('@cloudbase/node-sdk')
const config = require('./config')

const TtsClient = tts.tts.v20190823.Client
const cache = new Map()
const DIAGNOSTIC_BUILD_ID = '20260828-phase28j-tts-diag'

function makeDiagnosticId(character, text) {
  return crypto.createHash('sha256').update(`${Date.now()}|${character}|${text}`).digest('hex').slice(0, 16)
}

function safeMessage(error) {
  return String(error && error.message || error || '腾讯云语音合成失败')
    .replace(/(SecretId|SecretKey|Token|Credential)\s*[:=]\s*[^\s,;]+/ig, '$1=[REDACTED]')
    .slice(0, 300)
}

function fail(code, message, extra = {}) {
  return Object.assign({ success: false, buildId: DIAGNOSTIC_BUILD_ID, stage: extra.stage || 'TENCENT_TTS_REQUEST', provider: 'tencent-tts', character: extra.character || '', requestId: extra.requestId || '', audioFileId: '', audioBytes: extra.audioBytes || 0, errorCode: code, errorMessage: message, message, diagnosticId: extra.diagnosticId || '', fallback: true }, extra)
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 600)
}

function getVoiceId(character) {
  return String(config.voiceIds[character] || '').trim()
}

function makeKey(character, text, voiceType, speed, emotion) {
  return crypto.createHash('sha256').update(JSON.stringify({ character, text, voiceType, speed, emotion })).digest('hex')
}

async function getCachedFile(fileID) {
  if (!fileID || !config.envId) return null
  try {
    const app = cloudbase.init({ env: config.envId })
    const result = await app.getTempFileURL({ fileList: [fileID] })
    const item = result && result.fileList && result.fileList[0]
    return item && item.tempFileURL ? item.tempFileURL : null
  } catch (error) {
    return null
  }
}

exports.main = async event => {
  const character = ['yanYang', 'shaHu', 'luoTuo'].includes(event && event.character) ? event.character : 'shaHu'
  const text = cleanText(event && event.text)
  const diagnosticId = makeDiagnosticId(character, text)
  if (event && event.action === 'diagnostic') return { success: true, buildId: DIAGNOSTIC_BUILD_ID, ttsEnabled: config.enabled, credentialPresent: Boolean(config.secretId && config.secretKey), freeOnly: config.freeOnly }
  console.log('TTS_REQUEST_START', { character, textLength: text.length, voiceType: getVoiceId(character) || '', hasRuntimeCredential: Boolean(config.secretId && config.secretKey) })
  if (!text) return fail('EMPTY_TEXT', '口播文本为空', { stage: 'VALIDATION', character, diagnosticId })
  if (!config.enabled) return fail('TTS_DISABLED_BY_USER', '语音服务尚未由项目方启用', { stage: 'VALIDATION', character, diagnosticId })
  if (config.freeOnly && (!config.secretId || !config.secretKey)) {
    console.log('TTS_REQUEST_ERROR', { errorCode: 'NO_CREDENTIAL', audioBytes: 0, uploadSuccess: false })
    return fail('NO_CREDENTIAL', '语音服务未配置安全授权', { stage: 'RUNTIME_CREDENTIAL', character, diagnosticId })
  }

  const voiceType = getVoiceId(character)
  if (!voiceType) return fail('INVALID_VOICE', `角色 ${character} 尚未配置已验证音色`, { stage: 'VALIDATION', character, diagnosticId })
  const profile = { speed: Number(event && event.speed), emotion: String(event && event.emotion || '').trim() }
  const speed = Number.isFinite(profile.speed) ? Math.max(-2, Math.min(6, profile.speed)) : 0
  // The first yanYang acceptance call must not force an emotion that may not
  // be supported by the selected voice. Add it only when explicitly supplied.
  const emotion = profile.emotion
  const key = makeKey(character, text, voiceType, speed, emotion)
  if (cache.has(key)) {
    const cached = cache.get(key)
    return Object.assign({}, cached, { cached: true, imageKey: key, diagnosticId })
  }

  const client = new TtsClient({ credential: { secretId: config.secretId, secretKey: config.secretKey, token: config.token || undefined }, region: config.region, profile: { httpProfile: { endpoint: 'tts.tencentcloudapi.com' } } })
  const requestPayload = { Text: text, VoiceType: Number(voiceType), PrimaryLanguage: 1, SampleRate: 16000, Codec: 'mp3', Speed: speed, Volume: 0, EnableSubtitle: true, SessionId: key.slice(0, 32) }
  if (emotion) {
    requestPayload.EmotionCategory = emotion
    requestPayload.EmotionIntensity = 100
  }

  let response
  try {
    // SDK 4.x exposes request types as TypeScript interfaces; the runtime
    // accepts the plain request object directly.
    response = await client.TextToVoice(requestPayload)
  } catch (error) {
    const rawCode = String(error && (error.code || error.name) || 'TTS_API_ERROR')
    const code = /quota|limit|resource/i.test(rawCode) ? 'FREE_RESOURCE_UNAVAILABLE' : rawCode
    const message = String(error && error.message || '腾讯云语音合成失败')
    console.log('TTS_REQUEST_ERROR', { errorCode: code, requestId: error && error.requestId ? String(error.requestId) : '', audioBytes: 0, uploadSuccess: false })
    return fail(code, message, { stage: 'TENCENT_TTS_REQUEST', character, diagnosticId, requestId: error && error.requestId ? String(error.requestId) : '' })
  }
  const payload = response && response.Response
  const audioBytes = payload && payload.Audio ? Buffer.from(payload.Audio, 'base64').length : 0
  if (!payload || !payload.Audio || !payload.RequestId) {
    console.log('TTS_REQUEST_ERROR', { errorCode: 'EMPTY_AUDIO_RESULT', requestId: payload && payload.RequestId ? payload.RequestId : '', audioBytes, uploadSuccess: false })
    return fail('EMPTY_AUDIO_RESULT', '腾讯云未返回可播放音频', { stage: 'TENCENT_TTS_RESPONSE', character, diagnosticId, requestId: payload && payload.RequestId ? payload.RequestId : '', audioBytes })
  }

  const app = cloudbase.init({ env: config.envId })
  const fileID = await app.uploadFile({ cloudPath: `tts/${character}/${key}.mp3`, fileContent: Buffer.from(payload.Audio, 'base64') }).then(result => result.fileID).catch(() => '')
  if (!fileID) {
    console.log('TTS_REQUEST_RESULT', { requestId: payload.RequestId, audioBytes, uploadSuccess: false })
    return fail('UPLOAD_FAILED', '语音已生成但云存储上传失败', { stage: 'CLOUD_STORAGE_UPLOAD', character, diagnosticId, requestId: payload.RequestId, audioBytes })
  }
  console.log('TTS_REQUEST_RESULT', { requestId: payload.RequestId, audioBytes, uploadSuccess: true })
  const result = { success: true, buildId: DIAGNOSTIC_BUILD_ID, stage: 'DONE', provider: 'tencent-tts', character, voiceType: Number(voiceType), audioFileId: fileID, requestId: payload.RequestId, audioBytes, errorCode: '', errorMessage: '', subtitles: payload.Subtitles || [], cached: false, imageKey: key, diagnosticId, fallback: false }
  cache.set(key, result)
  return result
}
