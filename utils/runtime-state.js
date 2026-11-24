const volatileState=Object.create(null)
function app(){try{return typeof getApp==='function'?getApp():null}catch(error){return null}}
function set(key,value){
  const a=app(); if(a&&a.globalData)a.globalData[key]=value
  volatileState[key]=value
  try{wx.setStorageSync('hly_'+key,value)}catch(error){/* Keep this session usable when storage is full. */}
  return value
}
function get(key,fallback){
  const a=app(); const value=a&&a.globalData&&a.globalData[key]
  if(value!==undefined&&value!==null)return value
  if(Object.prototype.hasOwnProperty.call(volatileState,key))return volatileState[key]
  try{const stored=wx.getStorageSync('hly_'+key);return stored===undefined||stored===null||stored===''?fallback:stored}catch(error){return fallback}
}
function addTripItem(item){
  const current=get('currentTrip',null)||{id:'trip-runtime',days:[],addedItems:[]}
  const added=current.addedItems||[]
  if(!added.some(x=>x.id===item.id&&x.type===item.type))added.push(Object.assign({addedAt:Date.now()},item))
  current.addedItems=added
  set('currentTrip',current)
  return current
}
function setPendingTripRequest(request){
  const value=Object.assign({query:'',autoStart:true,source:'unknown',createdAt:Date.now()},request||{})
  value.query=String(value.query||'')
  value.prompt=value.query
  return set('pendingTripRequest',value)
}
function consumePendingTripRequest(){
  const value=get('pendingTripRequest',null)
  if(value)clear('pendingTripRequest')
  return value
}
function clear(key){
  const a=app(); if(a&&a.globalData)delete a.globalData[key]
  volatileState[key]=null
  try{wx.removeStorageSync('hly_'+key)}catch(error){/* Tombstone prevents consuming an old request twice. */}
}
module.exports={set,get,clear,addTripItem,setPendingTripRequest,consumePendingTripRequest}
