const fs=require('fs'),path=require('path')
const root=path.resolve(__dirname,'..')
const files=['app.js','pages/trip/index.js','pages/ai-trip/index.js','pages/ai-create/index.js','utils/conversation-gateway.js','utils/ai-orchestrator.js','utils/ask-pet-ai.js','utils/cloud-ai.js'].map(file=>path.join(root,file))
const source=files.map(file=>fs.readFileSync(file,'utf8')).join('\n')
const rawPatterns=[
  /TRIP_INPUT_TRACE[^\n]*\{[^\n]*(?:value|content)\s*:/,
  /conversation_history=/,
  /final_text_preview=/,
  /system_message:finalSystem/,
  /contentPreview\s*:/i,
  /REAL_AI_TRACE[^\n]*response=\$\{(?:JSON\.stringify|String)\(/,
  /REAL_CLOUD_MESSAGES]\s*[,)]/
]
const hits=rawPatterns.filter(pattern=>pattern.test(source)).map(String)
const secretHits=(source.match(/console\.(?:log|error)\([^\n]*(?:secret|apiKey|authorization|accessToken|apiSecret)/gi)||[]).length
console.log(JSON.stringify({status:hits.length||secretHits?'FAIL':'PASS',RAW_KEYSTROKE_LOG_COUNT:hits.length?1:0,RAW_CONVERSATION_LOG_COUNT:hits.length?1:0,SECRET_LOG_COUNT:secretHits,hits},null,2))
if(hits.length||secretHits)process.exitCode=1
