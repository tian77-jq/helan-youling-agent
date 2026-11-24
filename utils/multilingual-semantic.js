const {landmarks}=require('../design-tokens/landmark-registry')

const terms=[
  [/تاريخ|history|historical/gi,'历史'],[/ثقافة|culture|heritage/gi,'文化'],
  [/طبيعة|بيئة|ecology|nature/gi,'自然生态'],[/طعام|أطعمة|مأكولات|food|cuisine/gi,'美食'],
  [/مطعم|أكل|eat|restaurant/gi,'吃饭'],[/ميزانية|budget/gi,'预算'],
  [/مسار|خط سير|itinerary|route/gi,'路线行程'],[/رحلة|trip|travel/gi,'旅行'],
  [/أطفال|طفل|children|child|kids/gi,'孩子'],[/كبار السن|والدي|parents|elderly/gi,'父母'],
  [/مشي أقل|قليل المشي|less walking/gi,'少走一点'],[/غروب|sunset/gi,'日落'],
  [/مساء|ليلاً|night|evening/gi,'晚上']
]
const cities=[
  [/Yinchuan|ينشوان/gi,'银川'],[/Zhongwei|تشونغوي/gi,'中卫'],[/Wuzhong|ووتشونغ/gi,'吴忠'],
  [/Shizuishan/gi,'石嘴山'],[/Guyuan|قويوان/gi,'固原'],[/Lingwu|لينغوو/gi,'灵武'],
  [/Ningxia|نينغشيا/gi,'宁夏']
]
const placeAliases={
  'helan-mountain':['جبل هيلان'],
  'helan-rock-painting':['الفنون الصخرية في جبل هيلان','رسوم جبل هيلان الصخرية'],
  'lanshan-park':['حديقة لانشان'],
  'xixia-tombs':['أضرحة شيا الغربية'],
  'yellow-river':['النهر الأصفر'],
  shahu:['بحيرة شاحو','بحيرة الرمال'],
  shapotou:['منطقة شابوتو السياحية','شابوتو'],
  'route-66':['الطريق السريع 66'],
  'liupan-mountain':['جبل ليوبان'],
  'zhongwei-star-sky':['سماء صحراء تشونغوي ليلاً']
}
function replaceAlias(value,alias,canonical){
  if(!alias||alias===canonical)return value
  const escaped=String(alias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
  return value.replace(new RegExp(escaped,'gi'),canonical)
}
function canonicalizeQuestion(question){
  let value=String(question||'').replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  const aliases=[]
  landmarks.forEach(item=>{
    const names=[item.displayNameEn,item.displayNameAr].concat(placeAliases[item.landmarkId]||[]).filter(Boolean)
    names.forEach(name=>{if(value.toLowerCase().includes(name.toLowerCase())){value=replaceAlias(value,name,item.officialNameZh||item.officialName);aliases.push(item.landmarkId)}})
  })
  cities.forEach(([pattern,name])=>{value=value.replace(pattern,name)})
  terms.forEach(([pattern,canonical])=>{value=value.replace(pattern,canonical)})
  return {text:value,landmarkIds:[...new Set(aliases)]}
}

module.exports={canonicalizeQuestion}
