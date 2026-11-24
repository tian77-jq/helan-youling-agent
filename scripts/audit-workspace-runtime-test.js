const assert=require('assert')
const store=new Map(),app={globalData:{}}
global.getApp=()=>app
global.wx={getStorageSync:key=>store.get(key),setStorageSync:(key,value)=>store.set(key,value),removeStorageSync:key=>store.delete(key),showToast(){}}
let definition;global.Page=value=>{definition=value}
require('../pages/trip/index')
const page=Object.assign({},definition,{data:JSON.parse(JSON.stringify(definition.data)),setData(patch,callback){for(const [key,value] of Object.entries(patch)){const parts=key.split('.');let object=this.data;while(parts.length>1){const part=parts.shift();object=object[part]||(object[part]={})}object[parts[0]]=value}if(callback)callback()}})
let calls=0;page.generate=()=>{calls++}
const switchTo=panel=>page.switchWorkspacePanel({currentTarget:{dataset:{panel}}})
page.data.plan={days:[{items:[]}],summary:'银川轻松一天'};page.data.hasPlan=true;page.data.prompt='路线草稿'
switchTo('qa');page.data.prompt='为什么有岩画';page.data.petAnswer={answer:'岩画知识'};page.data.hasPlan=false
switchTo('trip');assert.strictEqual(page.data.prompt,'路线草稿');assert.strictEqual(page.data.hasPlan,true)
switchTo('qa');assert.strictEqual(page.data.prompt,'为什么有岩画');assert.strictEqual(page.data.petAnswer.answer,'岩画知识')
switchTo('create');page.selectMemorySource({currentTarget:{dataset:{source:'qa'}}});page.composeMemory();assert.strictEqual(page.data.workspace.createState.card.copy,'岩画知识')
switchTo('trip');switchTo('create');assert.strictEqual(page.data.workspace.createState.source,'qa');assert(page.data.workspace.createState.card)
page.saveWorkspaceMemory();assert.strictEqual(store.get('hly_trip_memories').length,1)
assert.strictEqual(calls,0)
page.data.loading=true;switchTo('qa');assert.strictEqual(page.data.workspace.activePanel,'create')
console.log('PASS: actual Page handler preserves QA, Trip, Create; panel-switch AI calls=0; save succeeds; active request protected. Node wx stub, NOT device proof.')
