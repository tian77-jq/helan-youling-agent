const tracker=require('../../utils/tracker')
const i18n=require('../../utils/i18n-runtime')
Page({
  data:{locale:'zh-CN',isRtl:false,languageOptions:[]},
  onShow(){i18n.bindPage(this,this.applyLocale);tracker.trackEvent('page_view',{page:'language'})},
  onUnload(){if(this.__localeUnsubscribe)this.__localeUnsubscribe()},
  applyLocale(locale){this.setData({locale,isEnglish:locale==='en-US',isRtl:i18n.isRtl(locale),languageOptions:[{id:'zh-CN',label:i18n.t('settings.zh',locale)},{id:'en-US',label:i18n.t('settings.en',locale)},{id:'ar',label:i18n.t('settings.ar',locale)}],title:i18n.t('settings.title',locale),languageLabel:i18n.t('settings.language',locale)})},
  chooseLanguage(e){const locale=e.currentTarget.dataset.locale;i18n.setCurrentLocale(locale);wx.showToast({title:i18n.t('settings.selected',locale),icon:'none'})}
})
