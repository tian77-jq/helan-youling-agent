const {ipRoles,products}=require('../../utils/data')

function generateRecommendation(form={}){
  let id=form.preferredIp||'sand-fox'
  if(form.style==='可爱治愈'||form.purpose==='自用陪伴')id='rock-goat'
  if(form.userType==='学生'||form.recipient==='同学 / 朋友')id='sand-fox'
  if(form.style==='民族风'||form.purpose==='旅游纪念'||form.recipient==='客户 / 合作方')id='camel'
  const role=ipRoles.find(item=>item.id===id)||ipRoles[1]
  let list=products.filter(item=>item.ipId===id)
  if(form.budget==='30元以内')list=list.filter(item=>/钥匙扣|明信片|冰箱贴/.test(item.name))
  if(form.budget==='150-300元'||form.need==='想要礼盒组合')list=products.filter(item=>item.category==='文旅礼盒')
  if(!list.length)list=products.filter(item=>item.ipId===id).slice(0,2)
  const names=list.slice(0,3).map(item=>item.name)
  const bilingual=form.userType==='留学生'||form.need==='想要双语祝福卡'
  return {
    id:'rec-'+Date.now(),ipId:role.id,ipName:role.name,products:names,
    giftCombo:form.need==='想要礼盒组合'?'文旅礼盒组合':names.slice(0,2).join(' + '),
    reasonZh:`你选择的是${form.userType||'年轻用户'}身份、${form.budget||'适中预算'}、${form.recipient||'送给重要的人'}，并偏好${form.style||'有故事的设计'}，因此推荐${role.name}IP组合。`,
    cultureZh:`${role.name}来自贺兰山生态IP体系，${role.culturalMeaning}。`,
    blessingZh:`愿这份来自贺兰山的${role.name}，陪你在新的旅程里保持好奇、勇敢和温柔。`,
    blessingEn:'May this Helan Mountain companion bring you curiosity, courage, and warmth on every journey.',
    tags:[...role.tags,...(bilingual?['中英双语']:[])]
  }
}

module.exports={generateRecommendation}
