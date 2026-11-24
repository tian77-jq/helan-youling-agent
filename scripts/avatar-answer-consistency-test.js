const speech=require('../services/speech-text-builder')
const router=require('../services/character-router')

const answer='贺兰山有岩羊、蓝马鸡和金雕等有代表性的野生动物。观察时应保持距离，不干扰野生动物。'
const character=router.get('yanYang')
const speakText=speech.build(answer,character)
const pass=/岩羊/.test(speakText)&&/蓝马鸡|金雕/.test(speakText)&&!/西夏陵|时间线|旅游路线/.test(speakText)
console.log(JSON.stringify({ANSWER_SPEECH_CONSISTENCY:pass?'PASS':'FAIL',character:character.id,answer,speakText},null,2))
if(!pass)process.exitCode=1
