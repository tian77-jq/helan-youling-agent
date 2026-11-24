const orchestrator=require('./ai-orchestrator')
const {parseTouristEntities}=require('./tourist-entity-parser')
const digitalAvatar=require('../services/digital-avatar-service')
const characterRouter=require('../services/character-router')
const i18n=require('./i18n-runtime')
const multilingualSemantic=require('./multilingual-semantic')

/**
 * 唯一文本对话入口。
 * 快捷问题、手动输入、首页自然语言和页面自动提交都必须经过这里。
 */
async function handle(input,options={}){
  options=Object.assign({},options,{hostContext:require('./host-runtime').validate(options.hostContext)})
  options.responseLocale=options.responseLocale||options.locale||i18n.getCurrentLocale()
  const text=String(input===undefined||input===null?'':input).trim()
  if(!text)throw new Error('EMPTY_CONVERSATION_INPUT')
  const semantic=multilingualSemantic.canonicalizeQuestion(text)
  const entities=parseTouristEntities(semantic.text)
  const entryMode=options.entryMode==='guide'?'guide':options.entryMode==='plan'?'plan':'auto'
  console.log('[CONVERSATION_GATEWAY]',JSON.stringify({inputLength:text.length,source:options.source||'unknown',entryMode,entities:{destinations:entities.destinationIds||[],cities:entities.cities||[],days:entities.days||null,originCity:entities.originCity||null}}))
  const routed=await orchestrator.respond(semantic.text,options.responseLocale,options.existingPlan||null,options.conversationState||null,entryMode,{hostContext:options.hostContext||null,responseLocale:options.responseLocale,originalQuestion:text,landmarkIds:semantic.landmarkIds})
  const answer=routed&&routed.result&&typeof routed.result.answer==='string'?routed.result.answer:''
  if(routed && routed.result){
    // The orchestrator resolves the character before prompting the model.
    // The gateway is a renderer boundary, not a second classifier.
    const resolvedCharacter=routed.resolvedCharacter||routed.result.character||characterRouter.select(text,routed.result.agent&&routed.result.agent.id)
    routed.result=digitalAvatar.prepare(Object.assign({},routed.result,{resolvedCharacter,character:resolvedCharacter,agent:characterRouter.toAgent(resolvedCharacter)}),text)
    routed.resolvedCharacter=resolvedCharacter
    routed.answerCharacter=resolvedCharacter
    routed.voiceCharacter=resolvedCharacter
    routed.uiCharacter=resolvedCharacter
  }
  return Object.assign(routed,{input:text,semanticInput:semantic.text,entities,responseBehavior:routed.response_behavior||routed.behavior&&routed.behavior.response_behavior||'',answer: routed.result && routed.result.answerText || answer, answerText:routed.result && routed.result.answerText || answer, digitalAvatar:routed.result && routed.result.characterProfile || null})
}

module.exports={handle}
