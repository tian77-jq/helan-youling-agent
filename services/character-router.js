const PERSONAS = require('./persona-config')
const CHARACTERS = Object.assign({}, PERSONAS, {
  yanYang: Object.assign({}, PERSONAS.yanYang, { legacyId: 'rock-goat', image: PERSONAS.yanYang.avatar, focus: PERSONAS.yanYang.knowledgeFocus }),
  shaHu: Object.assign({}, PERSONAS.shaHu, { legacyId: 'sand-fox', image: PERSONAS.shaHu.avatar, focus: PERSONAS.shaHu.knowledgeFocus }),
  luoTuo: Object.assign({}, PERSONAS.luoTuo, { legacyId: 'camel', image: PERSONAS.luoTuo.avatar, focus: PERSONAS.luoTuo.knowledgeFocus })
})

function normalize(value) {
  if (CHARACTERS[value]) return value
  const item = Object.values(CHARACTERS).find(character => character.legacyId === value)
  return item ? item.id : 'shaHu'
}

function intent(question) {
  const text = String(question || '')
  if (/岩画/.test(text)) return 'ECOLOGY'
  if (/美食|吃什么|必吃|手抓羊肉|八宝茶|臊子面|羊肉|夜市/.test(text)) return 'FOOD'
  if (/西夏|丝路|丝绸之路|黄河文化|历史|非遗|中阿|博物馆|石窟|岩画|水洞沟|文化价值|文明/.test(text)) return 'CULTURE_HISTORY'
  if (/晚上|夜游|去哪玩|怎么玩|路线|行程|交通|住宿|景点推荐|几天|几点去|景点|景区|公园|适合看|预算/.test(text)) return /晚上|夜游/.test(text) ? 'NIGHT_TRAVEL' : 'TRAVEL_PLAN'
  if (/贺兰山|岩羊|蓝马鸡|金雕|荒漠猫|兔狲|生态|自然保护|动植物|地质|湿地|候鸟|森林|环境/.test(text)) return 'ECOLOGY'
  return 'GENERAL_NINGXIA'
}

function select(question, hint) {
  const routedIntent = intent(question)
  const byIntent = { ECOLOGY: 'yanYang', CULTURE_HISTORY: 'luoTuo', TRAVEL_PLAN: 'shaHu', SCENIC_RECOMMEND: 'shaHu', FOOD: 'shaHu', NIGHT_TRAVEL: 'shaHu', TRANSPORT: 'shaHu', IP_STORY: 'shaHu', GENERAL_NINGXIA: 'shaHu' }
  // Legacy hints are accepted only when there is no topic evidence to contradict them.
  if (routedIntent === 'GENERAL_NINGXIA' && hint) return normalize(hint)
  return byIntent[routedIntent]
}

function get(id) { return CHARACTERS[normalize(id)] }

function toAgent(characterId) {
  const character = get(characterId)
  return { id: character.legacyId || character.id, name: character.name, role: character.role, avatar: character.avatar, character: character.id }
}

module.exports = { CHARACTERS, normalize, select, get, intent, toAgent }
