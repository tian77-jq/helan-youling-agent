const PANELS=['qa','trip','create']
const TASK_FIELDS=['prompt','petAnswer','responseRouting','conversationState','showFullAnswer','durationOptions','baseCityOptions','tripDiscoveryOptions','regionalOptions','clarificationDays','error']
function capture(data){const result={};TASK_FIELDS.forEach(key=>{if(data[key]!==undefined)result[key]=data[key]});return result}
function restore(state,panel){return Object.assign({prompt:'',petAnswer:null,responseRouting:null,showFullAnswer:false,durationOptions:[],baseCityOptions:[],tripDiscoveryOptions:[],regionalOptions:[],clarificationDays:'',error:''},state[panel+'State']&&state[panel+'State'].view||{})}

function createState(overrides){
  const input=overrides||{}
  return {
    activePanel:PANELS.includes(input.activePanel)?input.activePanel:'trip',
    entrySource:input.entrySource||'unknown',
    qaState:Object.assign({status:'idle',requestCount:0},input.qaState||{}),
    tripState:Object.assign({status:'idle',requestCount:0},input.tripState||{}),
    createState:Object.assign({status:'idle',requestCount:0},input.createState||{})
  }
}

function switchPanel(state,panel){
  const next=createState(state)
  if(PANELS.includes(panel))next.activePanel=panel
  return next
}

function panelLabel(panel){return {qa:'问答',trip:'路线',create:'作品'}[panel]||'路线'}

module.exports={PANELS,createState,switchPanel,panelLabel,capture,restore}
