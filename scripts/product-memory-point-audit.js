const fs=require('fs')
const checks={
  STORY_IMPRINT_SERVICE:fs.existsSync('feature/services/cultural-imprint-service.js'),
  STORY_DETAIL_IMPRINT:fs.readFileSync('feature/ip/detail.js','utf8').includes('earnImprint'),
  NO_GPS_CLAIM:!fs.readFileSync('feature/services/cultural-imprint-service.js','utf8').includes('到访认证'),
  MY_NINGXIA_STORAGE:fs.readFileSync('feature/services/cultural-imprint-service.js','utf8').includes('hly_cultural_imprints')
}
const pass=Object.values(checks).every(Boolean)
console.log(JSON.stringify({status:pass?'PASS':'FAIL',...checks,CLAIM_STATUS:'DIGITAL_EXPLORATION_ONLY'},null,2))
if(!pass)process.exitCode=1
