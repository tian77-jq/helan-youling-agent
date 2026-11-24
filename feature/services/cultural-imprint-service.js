const KEY='hly_cultural_imprints'
const CATALOG={mountain:{name:'贺兰山印记',character:'yanYang'},civilization:{name:'西夏印记',character:'luoTuo'},river:{name:'黄河印记',character:'yanYang'},route:{name:'丝路印记',character:'luoTuo'},desert:{name:'沙漠印记',character:'shaHu'},food:{name:'味道印记',character:'shaHu'},night:{name:'夜游印记',character:'shaHu'},craft:{name:'手艺印记',character:'luoTuo'}}
function read(){try{return wx.getStorageSync(KEY)||[]}catch(error){return[]}}
function earn(storyId,source){const item=CATALOG[storyId];if(!item)return null;const current=read();if(current.some(x=>x.storyId===storyId))return current.find(x=>x.storyId===storyId);const imprint={storyId,name:item.name,character:item.character,source:source||'story',earnedAt:new Date().toISOString(),status:'DIGITAL_EXPLORATION'};try{wx.setStorageSync(KEY,current.concat(imprint))}catch(error){}return imprint}
function list(){return read()}
module.exports={CATALOG,earn,list}
