function planExperience(adapter, request) {
  const input = request || {}
  const profile = adapter.getProfile()
  const days = Number.isInteger(input.days) && input.days > 0 ? input.days : 1
  const pace = input.pace || (input.family ? 'relaxed' : 'balanced')
  const overnight = Boolean(input.stayOvernight || input.hotelGuest || days > 1)
  const catalog = adapter.getExperienceCatalog()
  const fit = item => {
    if (pace === 'relaxed' && item.intensity === 'active') return false
    if (input.family && item.familyFit === false) return false
    return true
  }
  const day = catalog.find(item => item.experienceId === 'desert-river-day' && fit(item)) || catalog[0]
  const sunset = catalog.find(item => item.experienceId === 'sunset-river-desert' && fit(item))
  const night = overnight && input.includeNight !== false ? catalog.find(item => item.experienceId === 'star-night' && fit(item)) : null
  const slots = [
    {slot:'morning', label:'上午 · 先看黄河与沙海', experienceId:day && day.experienceId},
    {slot:'midday', label: pace === 'relaxed' ? '中午 · 留出休息与补水' : '中午 · 体验与休息交替', experienceId:day && day.experienceId},
    {slot:'sunset', label:'傍晚 · 看一段沙河交界的光线', experienceId:sunset && sunset.experienceId}
  ].filter(item => item.experienceId)
  if (night) slots.push({slot:'night', label:'夜间 · 视实时开放情况选择观星', experienceId:night.experienceId, realtimeRequired:true})
  return {scenicId:profile.scenicId, duration:days === 1 ? 'one-day' : 'two-day-context', pace, source:'core+scenic-adapter', slots, realtimeUnknown:profile.realtimeCapabilities.length === 0}
}
module.exports={planExperience}
