// Compatibility adapter for the existing trip-agent. This module deliberately
// does not create a second planner; it only exposes the contract expected by
// the legacy product test and future service callers.
const tripAgent = require('../utils/trip-agent')

function plan(prompt, options = {}) {
  try {
    const locale = options.locale || 'zh-CN'
    const value = tripAgent.planTrip(String(prompt || ''), { locale })
    return Promise.resolve({ success: true, source: 'local-trip-agent', plan: value })
  } catch (error) {
    return Promise.resolve({ success: false, source: 'local-trip-agent', code: 'TRIP_PLAN_FAILED', message: error.message || '行程规划失败' })
  }
}

function adjust(previousPlan, instruction) {
  try {
    return Promise.resolve({ success: true, source: 'local-trip-agent', plan: tripAgent.adjustTrip(previousPlan, instruction) })
  } catch (error) {
    return Promise.resolve({ success: false, source: 'local-trip-agent', code: 'TRIP_ADJUST_FAILED', message: error.message || '行程调整失败' })
  }
}

module.exports = { plan, adjust }
