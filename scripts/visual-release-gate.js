const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..')
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const checks={
  VISUAL_DNA:fs.existsSync(path.join(root,'docs/ningxia-visual-dna.md')),
  VISUAL_BENCHMARK:fs.existsSync(path.join(root,'docs/global-scenic-mini-program-visual-benchmark.md')),
  RETENTION_DOC:fs.existsSync(path.join(root,'docs/user-retention-loop.md')),
  HOME_SCENE_ASSET:/ningxia-hero-v1.jpg/.test(read('pages/index/index.wxml'))&&fs.existsSync(path.join(root,'assets/thumbs/banners/ningxia-hero-v1.jpg'))&&/山河意象 · AI原创/.test(read('pages/index/index.wxml')),
  HOME_RETURN_STATE:/currentTrip/.test(read('pages/index/index.js'))&&/wx:if="\{\{hasTrip\}\}"/.test(read('pages/index/index.wxml'))&&/bindtap="resumeTrip"/.test(read('pages/index/index.wxml')),
  TAB_SCENE_LABELS:/首页·山/.test(read('app.json'))&&/文化探索·河/.test(read('app.json'))&&/周边文创·沙/.test(read('app.json'))&&/个人中心·星/.test(read('app.json')),
  VOICE_UNTOUCHED:/voice-coming-soon/.test(read('pages/trip/index.js')),
  TRIP_CRITICAL:/trip-core-critical-regression/.test(read('scripts/trip-core-critical-regression.js'))||fs.existsSync(path.join(root,'scripts/trip-core-critical-regression.js'))
}
const failed=Object.keys(checks).filter(key=>!checks[key])
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',checks,failed},null,2))
if(failed.length)process.exitCode=1
