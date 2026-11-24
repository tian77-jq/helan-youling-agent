// WechatSI is an official WeChat plugin. Loading is guarded so an
// un-authorized mini program safely falls back to captions.
let plugin = null
const WECHAT_SI_PROVIDER_APPID='wx069ba97219f66d99'
try {
  if (typeof requirePlugin === 'function') plugin = requirePlugin('WechatSI')
} catch (error) {
  plugin = null
}

function isAvailable() { return Boolean(plugin && typeof plugin.textToSpeech === 'function') }

function requestOf(request, legacyOptions = {}) {
  return typeof request === 'object' && request !== null
    ? request
    : Object.assign({}, legacyOptions, { text: request })
}

function synthesize(request, legacyOptions = {}) {
  const options = requestOf(request, legacyOptions)
  if (!isAvailable()) return Promise.resolve({ success: false, provider: 'wechat-official-tts', audio: null, errorCode: 'WECHAT_TTS_NOT_CONFIGURED', errorMessage: 'WechatSI plugin is unavailable or not authorized.' })
  const lang = options.lang || (options.locale === 'en-US' ? 'en_US' : 'zh_CN')
  return new Promise((resolve, reject) => {
    plugin.textToSpeech({
      lang,
      tts: true,
      content: String(options.text || ''),
      success: result => {
        const filename = result && (result.filename || result.tempFilePath || result.audioUrl)
        if (!filename) return reject(Object.assign(new Error('WECHAT_TTS_EMPTY_AUDIO'), { code: 'WECHAT_TTS_EMPTY_AUDIO' }))
        resolve({ success: true, provider: 'wechat-official-tts', audio: { url: filename }, errorCode: '', errorMessage: '' })
      },
      fail: error => reject(Object.assign(new Error(error && (error.errMsg || error.msg) || 'WECHAT_TTS_FAILED'), { code: error && error.errCode || 'WECHAT_TTS_FAILED' }))
    })
  })
}

module.exports = { id: 'WECHAT_TTS', WECHAT_SI_PROVIDER_APPID, isAvailable, synthesize }
