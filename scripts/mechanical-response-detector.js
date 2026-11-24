const BLOCKED_PHRASES=['请选择','你更想了解','我可以帮你介绍','我可以帮你规划']
function detect(text=''){
  const value=String(text||'')
  const hits=BLOCKED_PHRASES.filter(phrase=>value.includes(phrase))
  return {pass:hits.length===0,hits,checked:value}
}
module.exports={BLOCKED_PHRASES,detect}
