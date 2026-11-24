const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
const routes=new Set([...(app.pages||[]),...((app.subPackages||[]).flatMap(sp=>sp.pages.map(page=>`${sp.root}/${page}`)))])
const read=file=>fs.readFileSync(path.join(root,file),'utf8')
const checks=[
  ['APP_HOME_REGISTERED',routes.has('pages/index/index')],
  ['APP_TRIP_REGISTERED',routes.has('pages/trip/index')],
  // The home shell now uses one real entry dispatcher instead of the removed
  // legacy runtime handlers. Validate the current navigation contract.
  ['HOME_ENTRY_HANDLER',/openEntry\s*\(/.test(read('pages/index/index.js'))],
  ['HOME_TRIP_ENTRY',/\/pages\/trip\/index/.test(read('pages/index/index.js'))&&/bindtap="openEntry"/.test(read('pages/index/index.wxml'))],
  ['TRIP_PAGE_EXISTS',fs.existsSync(path.join(root,'pages/trip/index.wxml'))],
  ['ASK_PET_ROUTE',/mode=guide/.test(read('pages/index/index.js'))&&/\/pages\/trip\/index/.test(read('pages/index/index.js'))],
  ['DISCOVER_REGISTERED',routes.has('pages/ip/index')],
  ['SCENIC_DETAIL_REGISTERED',routes.has('feature/attraction/detail')],
  ['FOOD_DETAIL_REGISTERED',routes.has('feature/food/detail')],
  ['SHOP_REGISTERED',routes.has('pages/shop/index')],
  ['MY_REGISTERED',routes.has('pages/admin/index')],
  ['CULTURAL_REGISTERED',routes.has('feature/cultural/index')],
  ['HOME_PLAN_ROUTE_DECISION',/openTripPlanner/.test(read('utils/navigation.js'))&&/navigate\('\/pages\/trip\/index'\)/.test(read('utils/navigation.js'))],
  ['PENDING_REQUEST_HANDOFF',/pendingTripRequest/.test(read('utils/navigation.js'))&&/consumePendingTripRequest/.test(read('pages/trip/index.js'))],
  ['TRIP_AUTOSTART',/TRIP_FLOW\]\[AUTOSTART/.test(read('pages/trip/index.js'))],
  // The trip page now routes both planning and guide questions through the
  // unified conversation gateway. Keep the regression gate aligned with the
  // runtime architecture instead of requiring the old direct orchestrator
  // calls that were removed during the gateway migration.
  ['TRIP_PLAN_RENDER',/conversationGateway\.handle\(/.test(read('pages/trip/index.js'))&&/setData\(\{loading:false,plan,hasPlan:true\}/.test(read('pages/trip/index.js'))],
  ['ASK_PET_AI_ENTRY',/entryMode:\s*['"]guide['"]/.test(read('pages/trip/index.js'))&&/conversationGateway\.handle\(/.test(read('pages/trip/index.js'))],
  ['VISION_SAFE_GATE',/visionConfidenceThreshold/.test(read('feature/utils/cloud-vision.js'))&&/allowed\.has\(knowledgeId\)/.test(read('feature/utils/cloud-vision.js'))&&/UNKNOWN_SCENE/.test(read('feature/utils/cloud-vision.js'))&&/featureVisionEnabled:false/.test(read('config/cloud.js'))],
  ['MEMORY_PAGE_EXISTS',fs.existsSync(path.join(root,'feature/memory/index.js'))],
  ['RELEASE_GATE_SCRIPT',fs.existsSync(path.join(root,'scripts/gold-release-gate.js'))]
]
const failed=checks.filter(([,pass])=>!pass).map(([name])=>name)
console.log(JSON.stringify({status:failed.length?'FAIL':'STATIC_PASS',manifest:'CORE_NON_REGRESSION_MANIFEST',checks:Object.fromEntries(checks),failed},null,2))
if(failed.length)process.exit(1)
