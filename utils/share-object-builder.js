function clean(value,max){return String(value||'').replace(/[\r\n]+/g,' ').trim().slice(0,max||80)}
function build(input={}){
  const type=input.type||'memory'
  const defaults={story:'问题',trip:'宁夏灵游',memory:'我的宁夏记忆',imprint:'宁夏文化印记'}
  return {type,objectId:clean(input.objectId||`${type}-share`,80),title:clean(input.title||defaults[type]||'宁夏记忆',36),subtitle:clean(input.subtitle,80),scene:clean(input.scene||'star',20),character:clean(input.character,30),image:input.image||'',sharePath:input.sharePath||'/feature/memory/index',shareQuery:input.shareQuery||'',privacySafe:true,aiGenerated:Boolean(input.aiGenerated)}
}
function toShareMeta(object){const value=build(object);return {title:value.title+(value.subtitle?` · ${value.subtitle}`:''),path:value.sharePath+(value.shareQuery?`?${value.shareQuery}`:'')}}
module.exports={build,toShareMeta}
