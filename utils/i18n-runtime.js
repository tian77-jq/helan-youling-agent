const catalogs = { 'zh-CN': require('../locales/zh-CN'), 'en-US': require('../locales/en-US'), ar: require('../locales/ar') }
const visualCopy = require('../locales/visual-correction')
Object.keys(visualCopy).forEach(locale => Object.keys(visualCopy[locale]).forEach(section => Object.assign(catalogs[locale][section], visualCopy[locale][section])))
const STORAGE_KEY = 'APP_LOCALE_V1'
const LEGACY_KEY = 'hly_locale'
const SUPPORTED = Object.keys(catalogs)
const listeners = []
let cachedLocale = 'zh-CN'
function normalize(value) { return SUPPORTED.indexOf(value) >= 0 ? value : 'zh-CN' }
function appInstance() { try { return typeof getApp === 'function' ? getApp() : null } catch (error) { return null } }
function storageGet(key) { try { return wx.getStorageSync(key) } catch (error) { return undefined } }
function storageSet(key, value) { try { wx.setStorageSync(key, value); return true } catch (error) { return false } }
function initialize(app) {
  const stored = storageGet(STORAGE_KEY)
  const legacy = stored === undefined || stored === null || stored === '' ? storageGet(LEGACY_KEY) : null
  cachedLocale = normalize(stored || legacy || 'zh-CN')
  if (stored !== cachedLocale) storageSet(STORAGE_KEY, cachedLocale)
  if (legacy !== null && legacy !== undefined) { try { wx.removeStorageSync(LEGACY_KEY) } catch (error) { /* New key has already been migrated. */ } }
  const target = app || appInstance()
  if (target && target.globalData) target.globalData.currentLocale = cachedLocale
  return cachedLocale
}
function getCurrentLocale() {
  const app = appInstance(); const appLocale = app && app.globalData && app.globalData.currentLocale
  if (appLocale && SUPPORTED.indexOf(appLocale) >= 0) return appLocale
  const stored = storageGet(STORAGE_KEY)
  if (stored !== undefined && stored !== null && stored !== '') return (cachedLocale = normalize(stored))
  return cachedLocale
}
function getPath(object, path) { return String(path || '').split('.').reduce((value, part) => value && value[part], object) }
function t(key, locale) {
  const current = normalize(locale || getCurrentLocale())
  const chain = current === 'ar' ? ['ar', 'en-US', 'zh-CN'] : current === 'en-US' ? ['en-US', 'zh-CN'] : ['zh-CN']
  for (let i = 0; i < chain.length; i += 1) { const value = getPath(catalogs[chain[i]], key); if (typeof value === 'string') return value }
  if (typeof console !== 'undefined' && console.warn) console.warn('[I18N][MISSING_KEY]', { key, locale: current })
  return String(key || '')
}
function updateTabBar(locale) {
  if (typeof wx === 'undefined' || typeof wx.setTabBarItem !== 'function') return false
  const labels = ['home', 'discover', 'gallery', 'mine'].map(key => t(`nav.${key}`, locale))
  labels.forEach((text, index) => {
    try {
      wx.setTabBarItem({ index, text, success: () => console.log('[I18N][TABBAR_ITEM_SYNCED]', { index, text, locale: normalize(locale) }), fail: error => console.warn('[I18N][TABBAR_UPDATE_FAILED]', { index, text, locale: normalize(locale), message: error && (error.errMsg || error.message) }) })
    } catch (error) {
      console.warn('[I18N][TABBAR_UPDATE_FAILED]', { index, text, locale: normalize(locale), message: error && error.message })
    }
  })
  return true
}
function syncTabBar(locale) { return updateTabBar(locale || getCurrentLocale()) }
function setCurrentLocale(locale) {
  const next = normalize(locale); const previous = getCurrentLocale(); cachedLocale = next
  storageSet(STORAGE_KEY, next)
  const app = appInstance(); if (app && app.globalData) app.globalData.currentLocale = next
  updateTabBar(next)
  if (previous !== next) listeners.slice().forEach(listener => { try { listener(next, previous) } catch (error) { console.error('[I18N][LISTENER_FAILED]', error) } })
  return next
}
function subscribe(listener) { if (typeof listener !== 'function') return () => {}; listeners.push(listener); return () => { const index = listeners.indexOf(listener); if (index >= 0) listeners.splice(index, 1) } }
function bindPage(page, applyLocale) {
  if (page.__localeUnsubscribe) page.__localeUnsubscribe()
  page.__localeApply = applyLocale
  page.__localeUnsubscribe = subscribe(next => { if (page.__localeApply) page.__localeApply.call(page, next) })
  const current = getCurrentLocale()
  applyLocale.call(page, current)
  // Native tabBar updates must run after it has been rendered; onShow callers
  // reach this point on initial tab entry, switchTab, and navigateBack.
  if (typeof wx !== 'undefined' && typeof wx.nextTick === 'function') wx.nextTick(() => syncTabBar(current))
  else setTimeout(() => syncTabBar(current), 0)
  return page.__localeUnsubscribe
}
function isRtl(locale) { return normalize(locale || getCurrentLocale()) === 'ar' }
function formatTime(value) { const parts = String(value || '').match(/^(\d{1,2}):(\d{2})$/); return parts ? `${parts[1].padStart(2, '0')}:${parts[2]}` : String(value || '') }
function formatNumber(value, locale) { const number = Number(value); if (!Number.isFinite(number)) return String(value == null ? '' : value); try { if (typeof Intl !== 'undefined' && Intl.NumberFormat) return new Intl.NumberFormat(normalize(locale || getCurrentLocale()), { useGrouping: false }).format(number) } catch (error) { /* ASCII digits remain a safe fallback. */ } return String(number) }
function formatDate(date, locale) {
  const value = date instanceof Date ? date : new Date(date || Date.now()); if (!Number.isFinite(value.getTime())) return ''
  const current = normalize(locale || getCurrentLocale()); if (current === 'zh-CN') return `${value.getFullYear()}年${value.getMonth() + 1}月${value.getDate()}日`
  const month = String(value.getMonth() + 1).padStart(2, '0'); const day = String(value.getDate()).padStart(2, '0')
  return current === 'ar' ? `${day}/${month}/${value.getFullYear()}` : `${month}/${day}/${value.getFullYear()}`
}
function formatDuration(minutes, locale) {
  const value = Math.max(0, Number(minutes) || 0); const current = normalize(locale || getCurrentLocale())
  const days = Math.floor(value / 1440); const hours = Math.floor((value % 1440) / 60); const mins = value % 60
  if (current === 'zh-CN') return days ? `${days}天` : hours && mins ? `${hours}小时${mins}分钟` : hours ? `${hours}小时` : `${mins}分钟`
  if (current === 'en-US') {
    const unit=(number,key)=>`${number} ${t(`formatter.${key}`,current).replace(/s$/,'')}${number===1?'':'s'}`
    return days ? unit(days,'day') : hours&&mins ? `${unit(hours,'hour')} ${unit(mins,'minute')}` : hours ? unit(hours,'hour') : unit(mins,'minute')
  }
  const arUnit=(number,key)=>{
    const n=Number(number)
    const forms={day:n===1?'يوم':n===2?'يومان':n>=3&&n<=10?'أيام':'يوماً',hour:n===1?'ساعة':n===2?'ساعتان':n>=3&&n<=10?'ساعات':'ساعة',minute:n===1?'دقيقة':n===2?'دقيقتان':n>=3&&n<=10?'دقائق':'دقيقة'}
    return `${formatNumber(n,current)} ${forms[key]}`
  }
  if(days)return arUnit(days,'day')
  if(hours&&mins)return `${arUnit(hours,'hour')} و${arUnit(mins,'minute')}`
  if(hours)return arUnit(hours,'hour')
  return arUnit(mins,'minute')
}
module.exports = { STORAGE_KEY, SUPPORTED, initialize, getCurrentLocale, setCurrentLocale, subscribe, bindPage, syncTabBar, t, isRtl, formatTime, formatDate, formatNumber, formatDuration }
