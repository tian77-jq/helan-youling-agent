const KEY='helan_analytics_events'
function track(event,payload){try{const list=wx.getStorageSync(KEY)||[];list.push({event,payload:payload||{},at:Date.now()});wx.setStorageSync(KEY,list.slice(-200))}catch(error){console.warn('[ANALYTICS][LOCAL_FAIL]',error)}}
function snapshot(){try{const events=wx.getStorageSync(KEY)||[];return {eventCount:events.length,generatedWorks:events.filter(x=>x.event==='work_generated').length,topScenes:[]}}catch(error){return {eventCount:0,generatedWorks:0,topScenes:[]}}}
module.exports={track,snapshot}
