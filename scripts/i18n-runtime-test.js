const assert=require('assert')
const catalogs={'zh-CN':require('../locales/zh-CN'),'en-US':require('../locales/en-US'),ar:require('../locales/ar')}
const appConfig=require('../app.json')
const storage={}
const tabItems=[]
global.wx={getStorageSync:key=>storage[key],setStorageSync:(key,value)=>{storage[key]=value},removeStorageSync:key=>{delete storage[key]},nextTick:callback=>callback(),setTabBarItem:value=>{assert.strictEqual(value.pagePath,undefined,'native setTabBarItem only receives supported index/text fields');tabItems[value.index]=value;if(value.success)value.success()}}
let currentApp={globalData:{}}
global.getApp=()=>currentApp
const i18n=require('../utils/i18n-runtime')
function flattenKeys(value,prefix='',result=[]){Object.keys(value).sort().forEach(key=>{const path=prefix?`${prefix}.${key}`:key;if(value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key]))flattenKeys(value[key],path,result);else result.push(path)});return result}
const reference=flattenKeys(catalogs['zh-CN'])
for(const locale of i18n.SUPPORTED)assert.deepStrictEqual(flattenKeys(catalogs[locale]),reference,`${locale} translation keys must match zh-CN`)
assert.deepStrictEqual(i18n.SUPPORTED,['zh-CN','en-US','ar'])
assert.deepStrictEqual(appConfig.tabBar.list.map(item=>item.text),['山·首页','河·发现','沙·文创','星·我的'],'native tabBar starts with the canonical Chinese labels')
storage.hly_locale='en-US'
assert.strictEqual(i18n.initialize(currentApp),'en-US','legacy locale migrates during app launch')
assert.strictEqual(storage.APP_LOCALE_V1,'en-US')
assert.strictEqual(storage.hly_locale,undefined)
assert.deepStrictEqual(tabItems,[],'tabBar is deferred until a page is shown')
let pageLocale=''
const page={data:{},setData(value){this.data=Object.assign({},this.data,value)}}
i18n.bindPage(page,locale=>{pageLocale=locale;page.setData({locale,isRtl:i18n.isRtl(locale)})})
assert.strictEqual(pageLocale,'en-US')
assert.deepStrictEqual(tabItems.map(item=>item.text),['Home','Discover','Create','My Ningxia'],'EN labels sync from the canonical locale after page show')
i18n.setCurrentLocale('ar')
assert.strictEqual(pageLocale,'ar','open page receives locale event immediately')
assert.strictEqual(page.data.isRtl,true)
assert.strictEqual(storage.APP_LOCALE_V1,'ar')
assert.deepStrictEqual(tabItems.map(item=>item.text),['الرئيسية','اكتشف','إبداع','نينغشيا'])
assert.strictEqual(i18n.t('shop.title','ar'),'معرض الإبداع')
currentApp={globalData:{}}
assert.strictEqual(i18n.initialize(currentApp),'ar','saved locale survives a fresh app instance')
assert.strictEqual(currentApp.globalData.currentLocale,'ar')
i18n.setCurrentLocale('zh-CN')
assert.strictEqual(storage.APP_LOCALE_V1,'zh-CN','AR to ZH persists')
assert.deepStrictEqual(tabItems.map(item=>item.text),['山·首页','河·发现','沙·文创','星·我的'],'AR to ZH restores all four Chinese tab labels')
assert.strictEqual(i18n.isRtl('zh-CN'),false)
assert.strictEqual(i18n.formatTime('9:30'),'09:30')
assert.strictEqual(i18n.formatTime('13:30'),'13:30')
assert.strictEqual(i18n.formatTime('09:30'),'09:30')
assert.strictEqual(i18n.formatDate(new Date(2026,8,27),'en-US'),'09/27/2026')
assert.strictEqual(i18n.formatDate(new Date(2026,8,27),'ar'),'27/09/2026')
assert.strictEqual(i18n.formatDuration(90,'en-US'),'1 hour 30 minutes')
assert.strictEqual(i18n.formatDuration(90,'ar'),'1 ساعة و30 دقيقة')
page.__localeUnsubscribe()
console.log('I18N_RUNTIME_TEST PASS: key sets complete; ZH→EN→AR→ZH; legacy and relaunch persistence; live notification; tabBar; RTL/time formatting')
