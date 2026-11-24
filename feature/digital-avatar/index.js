const avatar = require('../../services/digital-avatar-service')

Page({
  data: { payload: null, state: 'IDLE', playing: false },
  audioContext: null,
  onLoad(options) {
    const payload = avatar.prepare({ answerText: options && options.text ? decodeURIComponent(options.text) : '欢迎来到贺兰有灵。', character: options && options.character }, '')
    this.setData({ payload })
  },
  speak() {
    const payload = this.data.payload
    console.log('[VOICE] button clicked', { character: payload && payload.character || '' })
    this.setData({ state: 'REQUESTING', playing: true })
    avatar.speak(payload).then(result => {
      this.setData({ payload: result, state: result.ttsAvailable ? 'BUFFERING' : 'HAPPY', playing: Boolean(result.ttsAvailable) })
      const audioUrl = result.audio && typeof result.audio === 'object' ? result.audio.url : result.audio
      if (audioUrl) {
        if (this.audioContext) this.audioContext.destroy()
        const audio = wx.createInnerAudioContext()
        this.audioContext = audio
        audio.src = audioUrl
        audio.volume = 1
        audio.onPlay(() => { console.log('[VOICE] playing'); this.setData({ state: 'SPEAKING', playing: true }) })
        audio.onEnded(() => { console.log('[VOICE] ended'); this.setData({ state: 'IDLE', playing: false }); audio.destroy(); this.audioContext = null })
        audio.onError(error => { console.log('[VOICE] audio error', { errCode: error && error.errCode || '', errMsg: error && error.errMsg || '' }); this.setData({ state: 'IDLE', playing: false }); audio.destroy(); this.audioContext = null })
        audio.play()
      } else wx.showToast({ title: '当前为字幕讲解模式', icon: 'none' })
    }).catch(error => {
      console.log('[VOICE] speak error', { reason: error && error.message ? error.message : 'TTS_ERROR' })
      this.setData({ state: 'IDLE', playing: false })
    })
  },
  stop() {
    if (this.audioContext) { this.audioContext.stop(); this.audioContext.destroy(); this.audioContext = null }
    this.setData({ state: 'IDLE', playing: false })
  },
  onUnload() { this.stop() }
})
