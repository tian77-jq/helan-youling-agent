const fs=require('fs')
const path=require('path')

const checks=[
  'R1_HOME_PLAN_RUNTIME',
  'R2_AI_TRIP_RUNTIME',
  'R3_ASK_PET_RUNTIME',
  'R4_SCENIC_IMAGES_10_OF_10',
  'R5_SCENIC_CLICKS_10_OF_10',
  'R6_SCENIC_DETAIL_RUNTIME',
  'R7_FOOD_DETAIL_RUNTIME',
  'R8_CULTURAL_GAME_RUNTIME',
  'R9_SHOP_WISHLIST_RUNTIME',
  'R10_MY_RUNTIME',
  'R11_MEMORY_RUNTIME'
]
const appSource=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8')
const buildIdMatch=appSource.match(/buildId:\s*['"]([^'"]+)['"]/)
const result={
  status:'RUNTIME_PENDING_HUMAN',
  buildId:buildIdMatch?buildIdMatch[1]:'UNKNOWN_BUILD',
  homeRenderVerification:{
    status:'DEVICE_REQUIRED',
    route:'pages/index/index',
    screenshotArtifact:'home-after-static-render-20s.png',
    exceptionCount:null,
    stabilityWindowMs:null,
    nativeSwiperCount:null,
    renderedCounts:null
  },
  checks:checks.map(name=>({name,status:'PENDING_HUMAN'})),
  note:'This script does not execute the simulator. Historical screenshot names are not current evidence. See docs/audit-20260905 for dated captures; physical-device validation remains required.'
}
console.log(JSON.stringify(result,null,2))
