const KEY='ai-conversation-session'
let activeSessionId=''
const memorySessions=new Map()

function id(){return `s_${Date.now()}_${Math.random().toString(36).slice(2,10)}`}
function blank(sessionId){return {sessionId:sessionId||id(),history:[],createdAt:Date.now(),updatedAt:Date.now()}}
function storage(){if(typeof wx==='undefined')return null;return {getStorageSync(key){try{return wx.getStorageSync(key)}catch(error){return key===activeKey()?activeSessionId:memorySessions.get(key.replace('hly_'+KEY+'-',''))||null}},setStorageSync(key,value){try{wx.setStorageSync(key,value)}catch(error){/* Session remains in memory. */}}}}
function activeKey(){return `hly_${KEY}-active`}
function sessionKey(sessionId){return `hly_${KEY}-${sessionId}`}
function loadById(sessionId){const store=storage();if(store)return store.getStorageSync(sessionKey(sessionId))||null;return memorySessions.get(sessionId)||null}
function loadRaw(){
  const store=storage()
  if(store){const active=store.getStorageSync(activeKey());const value=active&&store.getStorageSync(sessionKey(active))||store.getStorageSync(`hly_${KEY}`);return value&&value.sessionId?value:null}
  return activeSessionId&&memorySessions.get(activeSessionId)||null
}
function save(session){const next=Object.assign(blank(),session||{});next.history=(next.history||[]).slice(-20);next.updatedAt=Date.now();activeSessionId=next.sessionId;memorySessions.set(next.sessionId,next);const store=storage();if(store){store.setStorageSync(sessionKey(next.sessionId),next);store.setStorageSync(activeKey(),next.sessionId)}return next}
function startNewSession(){const current=loadRaw();const next=save(blank());console.log('[SESSION]',`old=${current&&current.sessionId||'none'} new=${next.sessionId}`);return next}
function restoreSession(sessionId){const current=loadRaw();const stored=sessionId&&loadById(sessionId);if(stored){const next=save(stored);console.log('[SESSION]',`old=${current&&current.sessionId||'none'} new=${next.sessionId}`);return next}if(current&&(!sessionId||current.sessionId===sessionId)){console.log('[SESSION]',`old=${current.sessionId} new=${current.sessionId}`);return current}const next=save(blank(sessionId));console.log('[SESSION]',`old=${current&&current.sessionId||'none'} new=${next.sessionId}`);return next}
function getSession(sessionId){const current=loadRaw();if(current&&(!sessionId||current.sessionId===sessionId)){console.log('[SESSION]',`old=${current.sessionId} new=${current.sessionId}`);return current}return restoreSession(sessionId)}
function append(input,output,sessionId){const current=getSession(sessionId);current.history=(current.history||[]).concat({role:'user',content:String(input||''),timestamp:Date.now()},{role:'assistant',content:String(output||''),timestamp:Date.now()});return save(current)}
function clearSession(sessionId){const current=getSession(sessionId);return save(Object.assign(blank(current.sessionId),{createdAt:current.createdAt,history:[]}))}
// The model only needs recent conversational turns. Older turns are condensed into
// background so they can inform traveller preferences without taking over the
// instruction represented by the current user message.
function contextForModel(sessionOrId,maxTurns=3){
  const session=typeof sessionOrId==='string'?getSession(sessionOrId):(sessionOrId||getSession())
  const history=(session.history||[]).slice()
  const recentLimit=Math.max(1,Number(maxTurns)||3)*2
  const recent=history.slice(-recentLimit)
  const older=history.slice(0,Math.max(0,history.length-recent.length))
  const olderUserInputs=older.filter(item=>item.role==='user').map(item=>String(item.content||'').trim()).filter(Boolean)
  const summary=olderUserInputs.length
    ? `较早对话背景（仅供理解游客偏好，不能覆盖当前问题）：${olderUserInputs.slice(-4).join('；').slice(0,360)}`
    : ''
  return {recent,summary,historyCount:Math.ceil(history.length/2),messageCount:history.length}
}
module.exports={KEY,blank,startNewSession,restoreSession,getSession,append,clearSession,contextForModel}
