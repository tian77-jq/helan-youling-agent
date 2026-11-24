const tracker = require('../../utils/tracker')
const navigation = require('../../utils/navigation')
const { optionLists } = require('../../utils/data')

const questions = [
  { key: 'userType', label: '用户身份', options: optionLists.surveyUserTypes },
  { key: 'knowledge', label: '是否了解贺兰山文化', options: optionLists.knowledge },
  { key: 'ip', label: '最喜欢哪个IP', options: ['岩羊', '沙狐', '双峰驼'] },
  { key: 'designRange', label: '偏好的设计范围', options: ['轻巧便携', '日常陪伴', '文化纪念', '不限范围'] },
  { key: 'designType', label: '最喜欢的设计类型', options: optionLists.productTypes },
  { key: 'scanStory', label: '愿意扫码了解IP故事吗', options: optionLists.yesNo },
  { key: 'useAI', label: '愿意使用AI推荐吗', options: optionLists.yesNo },
  { key: 'saveDesign', label: '愿意收藏原创设计吗', options: optionLists.yesNo }
]

Page({
  data: { questions, form: {}, fromType: '' },
  onLoad(options) { this.setData({ fromType: options.userType || '' }) },
  choose(e) {
    const key = e.currentTarget.dataset.key
    const value = e.currentTarget.dataset.value
    this.setData({ ['form.' + key]: value })
  },
  inputAdvice(e) { this.setData({ 'form.advice': e.detail.value }) },
  submit() {
    const form = { ...this.data.form, userType: this.data.form.userType || this.data.fromType }
    const required = ['userType', 'knowledge', 'ip', 'designRange', 'designType', 'scanStory', 'useAI', 'saveDesign']
    if (required.some(key => !form[key])) return wx.showToast({ title: '请完成问卷选择', icon: 'none' })
    tracker.saveSurvey(form)
    tracker.trackEvent('submit_survey', { ...form, page: 'survey' })
    wx.showModal({
      title: '感谢反馈',
      content: '你的建议将用于贺兰山生态IP文旅转化平台的产品迭代。',
      confirmText: '继续使用',
      success: result => { if (result.confirm) navigation.switchTab('/pages/admin/index') }
    })
  }
})
