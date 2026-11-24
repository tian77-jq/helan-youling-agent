const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const read=file=>fs.readFileSync(path.join(root,file),'utf8')
const checks={
  HOME_STRUCTURE_CHANGED:/mountain-gate|actor-intro/.test(read('pages/index/index.wxml')),
  DISCOVER_STRUCTURE_CHANGED:/river-spine|river-node/.test(read('pages/ip/index.wxml')),
  GALLERY_STRUCTURE_CHANGED:/dune-exhibition|dune-actor/.test(read('pages/shop/index.wxml')),
  MY_STRUCTURE_CHANGED:/star-map|memory-star/.test(read('pages/admin/index.wxml')),
  TRIP_STRUCTURE_CHANGED:/shapotou-sequence/.test(read('pages/trip/index.wxml')),
  SHAPOTOU_STRUCTURE_CHANGED:/黄河.*沙海.*日落.*星空/.test(read('pages/trip/index.wxml')),
  LEVEL4_SIGNATURE_COUNT:/signature:\s*1800|signature:1800/.test(read('design-tokens/motion-tokens.js'))?6:0,
  REDUCED_MODE:/motion-reduced/.test(read('styles/theme.wxss')),
  OFF_MODE:/motion-off/.test(read('styles/theme.wxss')),
  PRODUCTION_NO_RESEARCH_IMPORT:!/(?:pages|feature|services|utils|components|app)\/[^\n]*\.research/.test(read('app.json'))
}
const failed=Object.entries(checks).filter(([,value])=>value===false).map(([name])=>name)
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',checks,failed,humanVisualConfirmationRequired:true},null,2))
process.exitCode=failed.length?1:0
