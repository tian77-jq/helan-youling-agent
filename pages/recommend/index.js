const tracker = require('../../utils/tracker');

const OPTION_CONFIG = [
  {
    key: 'userType',
    title: '1. 用户身份',
    options: ['学生', '游客', '留学生', '老师 / 家长', '企业客户']
  },
  {
    key: 'budget',
    title: '2. 设计偏好范围',
    options: ['轻巧便携', '日常陪伴', '文化纪念', '组合展示', '不限范围']
  },
  {
    key: 'purpose',
    title: '3. 使用用途',
    options: ['自用陪伴', '生日礼物', '旅游纪念', '校园文创', '跨文化礼物', '企业定制']
  },
  {
    key: 'recipient',
    title: '4. 送礼对象',
    options: ['自己', '同学 / 朋友', '老师', '家人', '留学生朋友', '客户 / 合作方']
  },
  {
    key: 'style',
    title: '5. 风格偏好',
    options: ['可爱治愈', '高级简约', '民族风', '实用型', '文化纪念型']
  },
  {
    key: 'need',
    title: '6. 需求倾向',
    options: ['想了解宁夏文化', '想收藏原创设计', '想看组合展示', '想要双语祝福卡', '想看风格推荐']
  }
];

Page({
  data: {
    form: {
      userType: '学生',
      budget: '日常陪伴',
      purpose: '生日礼物',
      recipient: '同学 / 朋友',
      style: '可爱治愈',
      need: '想要双语祝福卡',
      preferredIp: ''
    },
    groups: []
  },

  onLoad(options) {
    const preferredIp = options && options.ipId ? options.ipId : '';

    const form = this.data.form;
    form.preferredIp = preferredIp;

    this.setData({
      form: form,
      groups: this.buildGroups(form)
    });

    if (tracker && tracker.trackEvent) {
      tracker.trackEvent('page_view', {
        page: 'recommend/index',
        module: 'AI文创设计推荐助手',
        preferredIp: preferredIp
      });
    }
  },

  buildGroups(form) {
    return OPTION_CONFIG.map(function (group) {
      return {
        key: group.key,
        title: group.title,
        options: group.options.map(function (label) {
          const isActive = form[group.key] === label;

          return {
            label: label,
            className: isActive ? 'option active' : 'option'
          };
        })
      };
    });
  },

  selectOption(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.currentTarget.dataset.value;

    if (!key || !value) {
      return;
    }

    const form = this.data.form;
    form[key] = value;

    this.setData({
      form: form,
      groups: this.buildGroups(form)
    });
  },

  submitRecommend() {
    const form = this.data.form;

    if (!form.userType || !form.budget || !form.purpose || !form.recipient || !form.style || !form.need) {
      wx.showToast({
        title: '请完善所有选项',
        icon: 'none'
      });
      return;
    }

    wx.setStorageSync('hly_latest_recommendation_form', form);

    if (tracker && tracker.trackEvent) {
      tracker.trackEvent('submit_recommendation', {
        page: 'recommend/index',
        userType: form.userType,
        budget: form.budget,
        purpose: form.purpose,
        recipient: form.recipient,
        style: form.style,
        need: form.need,
        preferredIp: form.preferredIp
      });
    }

    wx.navigateTo({
      url: '/feature/recommend/result'
    });
  },

  goBackHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  onShareAppMessage() {
    if (tracker && tracker.trackEvent) {
      tracker.trackEvent('share', {
        page: 'recommend/index'
      });
    }

    return {
      title: '贺兰有灵 AI原创设计推荐助手',
      path: '/pages/recommend/index'
    };
  }
});
