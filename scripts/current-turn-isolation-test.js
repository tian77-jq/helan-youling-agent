const manager=require('../utils/conversation-manager')
const {responseModeRouter}=require('../utils/response-mode-router')
const character=require('../services/character-router')

const session=manager.startNewSession()
manager.append('第一次来宁夏','已记录旅行意向',session.sessionId)
manager.append('人生如梦下一句是什么？','域外问题',session.sessionId)
const modelContext=manager.contextForModel(session.sessionId,3)
const latest=modelContext.recent.filter(item=>item.role==='user').slice(-1)[0]
const planFollow=responseModeRouter('两天吧',true)
const meta=responseModeRouter('腾讯混元模型厉不厉害？',true)
const rows=[
  {case:'latestUserUtterance 独立',pass:latest&&latest.content==='人生如梦下一句是什么？'&&!/用户补充偏好|第一次来宁夏/.test(latest.content)},
  {case:'trip refinement',pass:planFollow.intent==='ADJUST_TRIP'},
  {case:'plan UI 不吞 META',pass:meta.intent==='META_SYSTEM'},
  {case:'角色基于当前轮切换',pass:character.select('贺兰山有什么动物？')==='yanYang'&&character.select('宁夏有什么美食？')==='shaHu'&&character.select('西夏陵为什么重要？')==='luoTuo'}
]
const failed=rows.filter(row=>!row.pass)
console.log(JSON.stringify({CURRENT_TURN_ISOLATION:failed.length?'FAIL':'PASS',FOLLOW_UP_CLASSIFIER:planFollow.intent==='ADJUST_TRIP'?'PASS':'FAIL',rows},null,2))
if(failed.length)process.exitCode=1
