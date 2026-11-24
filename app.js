let cloudConfig={
  envId:'',
  AI_MODE:'local',
  featureVisionEnabled:false,
  cloudAiProvider:'unavailable',
  cloudAiModel:'unavailable'
}
const i18nRuntime=require('./utils/i18n-runtime')
try {
  cloudConfig=Object.assign(cloudConfig,require('./config/cloud'))
} catch (error) {
  // Configuration failure must not prevent App() registration or page render.
  console.error('[BOOT][CONFIG_FAIL]',error&&error.message)
}

function safeStorage(key,fallback){
  try{return wx.getStorageSync(key)||fallback}catch(error){console.error('[BOOT][STORAGE_FAIL]',{key,message:error&&error.message});return fallback}
}

App({
  globalData: {
    projectName: '贺兰有灵',
    version: '2026 冲奖版',
    currentLocale: i18nRuntime.getCurrentLocale(),
    // 生产环境请由安全后端提供 AI 能力；客户端不得保存模型密钥。
    aiServiceBaseUrl: '',
    AI_MODE:cloudConfig.AI_MODE,
    featureVisionEnabled:cloudConfig.featureVisionEnabled,
    tripIsTabBar:false,
    currentTrip: safeStorage('hly_currentTrip',null),
    currentQuery: safeStorage('hly_currentQuery',''),
    userPreferences: safeStorage('hly_userPreferences',{}),
    buildId: '20260830-regional-experience-v13-device'
  },
  onLaunch() {
    this.globalData.currentLocale=i18nRuntime.initialize(this)
    const launchAt=Date.now()
    this.globalData.startupTimeline={APP_LAUNCH:launchAt}
    console.log('[BUILD] '+this.globalData.buildId)
    console.log('[DEVICE_REVIEW_CANDIDATE]',false)
    console.log('[VERSION] '+this.globalData.version)
    console.log('[BOOT][COMPONENT_MODE]',{lazyCodeLoading:'disabled',customComponentCount:0})
    try{if(!wx.getStorageSync('hly_started_at'))wx.setStorageSync('hly_started_at',launchAt)}catch(error){console.error('[BOOT][START_MARK_FAIL]',error)}
    // Cloud is initialized lazily by feature services. The home page must remain
    // a static shell and never depend on cloud startup or AI availability.
    console.log('[BOOT] static home mode; cloud services are lazy')
    console.log('[BOOT][CLOUD_INIT_DEFERRED]',{reason:'feature-service-lazy-init'})
  },
  onShow() {
    const locale = i18nRuntime.getCurrentLocale()
    if (typeof wx !== 'undefined' && typeof wx.nextTick === 'function') wx.nextTick(() => i18nRuntime.syncTabBar(locale))
    else setTimeout(() => i18nRuntime.syncTabBar(locale), 0)
  },
  onError(error) {
    const message = String(error || 'UNKNOWN_APP_ERROR')
    console.error('[APP_RUNTIME_ERROR]', message)
    try { wx.setStorageSync('hly_last_runtime_error', {message, at: Date.now()}) } catch (ignore) {}
  },
  onPageNotFound(res) {
    console.error('[PAGE_NOT_FOUND]',res)
    const pathParts = res && res.path ? String(res.path).split('/') : []
    if (pathParts[1] === 'feature' && pathParts[2] === 'create') {
      wx.redirectTo({url:'/feature/create/index'})
    }
  }
})
