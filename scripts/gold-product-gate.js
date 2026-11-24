const fs=require('fs')
const stories=require('../knowledge/story-universe').stories
const checks={
  AI:fs.existsSync('utils/ai-orchestrator.js')&&fs.existsSync('utils/response-mode-router.js'),
  TRIP:fs.existsSync('utils/trip-agent.js'),
  KNOWLEDGE:fs.existsSync('knowledge/index.js')&&stories.every(x=>x.knowledgeIds.length),
  STORY:stories.length>=12&&stories.every(x=>x.status==='PRODUCTION'),
  CHARACTER:fs.existsSync('services/character-router.js'),
  CREATE:fs.existsSync('pages/ai-create/index.js'),
  UX:fs.existsSync('pages/index/index.wxml')&&fs.existsSync('feature/ip/detail.wxml'),
  VOICE_FREEZE:fs.readFileSync('scripts/fixtures/voice-release.js','utf8').includes('REAL_TTS_AVAILABLE=false'),
  RELEASE:fs.existsSync('scripts/verify-project.js'),
  COMPETITION_EVIDENCE:fs.existsSync('docs/gold-3-minute-demo.md')&&fs.existsSync('docs/how-helan-yooling-could-lose.md')
}
const pass=Object.values(checks).every(Boolean)
console.log(JSON.stringify({status:pass?'PASS':'FAIL',...checks,VOICE_BLOCKS_RELEASE:'NO',CURRENT_REAL_DATA:'NO_REAL_DATA_YET'},null,2))
if(!pass)process.exitCode=1
