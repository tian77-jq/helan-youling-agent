const router = require('../services/character-router')

const cases = [
  ['贺兰山有哪些珍稀动物？', 'yanYang'],
  ['贺兰山岩画有什么文化价值？', 'yanYang'],
  ['西夏陵为什么重要？', 'luoTuo'],
  ['西夏王朝有什么特点？', 'luoTuo'],
  ['宁夏有什么值得吃的？', 'shaHu'],
  ['手抓羊肉哪里值得吃？', 'shaHu'],
  ['银川晚上去哪里玩？', 'shaHu'],
  ['三天宁夏怎么玩？', 'shaHu'],
  ['沙坡头几点去比较好？', 'shaHu'],
  ['贺兰山岩画为什么值得去？', 'yanYang']
]

const results = cases.map(([question, expected]) => {
  const actual = router.select(question)
  return { question, expected, actual, pass: actual === expected }
})
const passed = results.filter(item => item.pass).length
console.log(JSON.stringify({ CHARACTER_ROUTER_TEST_PASS_RATE: `${passed}/${results.length}`, status: passed === results.length ? 'PASS' : 'FAIL', results }, null, 2))
process.exitCode = passed === results.length ? 0 : 1
