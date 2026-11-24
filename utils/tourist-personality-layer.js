function contextHint(context={}){
  const hints=[]
  if(context.first_visit)hints.push('这是第一次来宁夏')
  if(context.companions&&context.companions.includes('parents'))hints.push('同行人是父母')
  if(context.action_limits&&context.action_limits.includes('low_walking'))hints.push('需要少走路')
  if(context.location)hints.push(`目的地是${context.location}`)
  return hints.join('，')
}

function style(value){return Object.assign({response_style:value.id},value)}

function resolve(intent,behavior,context={}){
  const hint=contextHint(context)
  if(behavior==='FOOD_GUIDE')return style({id:'FOOD',name:'沙狐旅行美食风格',min:50,max:150,prompt:'语气轻松、熟悉地方风味，先说最值得尝的味道和体验场景。直接给答案，不使用客服邀请语，不安排路线。不要自称、不要提及沙狐或任何与用户问题无关的角色画面。',contextHint:hint})
  if(behavior==='STORY_EXPLANATION')return style({id:'CULTURE',name:'双峰驼文明讲解风格',min:150,max:300,prompt:'用自然、有画面感的方式讲清景点最值得了解的文化线索与旅行价值。不使用客服话术，不安排路线。不要自称、不要提及双峰驼或任何与用户问题无关的角色画面。',contextHint:hint})
  if(behavior==='TRIP_PLAN'||behavior==='ADJUST_TRIP')return style({id:'TRIP',name:'沙狐旅行伙伴风格',min:0,max:0,prompt:'以沙狐轻松、机灵、体贴的口吻组织结构化行程，主动采用已有游客画像，减少重复追问。',contextHint:hint})
  return style({id:'GENERAL',name:'灵灵探索伙伴风格',min:50,max:150,prompt:'像熟悉宁夏的探索伙伴一样直接给第一条有用建议，语气自然亲切，给出可继续探索的方向，不生成日程。不要自称、不要添加动物、岩壁或角色故事；除非用户主动问到。',contextHint:hint})
}

function limit(text,style){
  const value=String(text||'').trim()
  if(!style||!style.max||value.length<=style.max)return value
  const cut=value.slice(0,style.max)
  const stop=Math.max(cut.lastIndexOf('。'),cut.lastIndexOf('！'),cut.lastIndexOf('\n'))
  return stop>=Math.floor(style.max*.55)?cut.slice(0,stop+1):`${cut.slice(0,Math.max(style.max-1,1))}…`
}

function applyLocal(answer,style){
  if(!style||style.id==='TRIP')return String(answer||'')
  const parts=[style.localPrefix||'',String(answer||''),style.localSuffix||'']
  if(style.contextHint&&style.id==='CULTURE')parts.push(`结合你的情况：${style.contextHint}。`)
  return limit(parts.filter(Boolean).join(''),style)
}

function polish(answer,style){
  let value=String(answer||'').trim()
    .replace(/^\s*(?:我可以帮你(?:介绍|规划|看看)?|请选择(?:你想了解的内容)?|你更想了解(?:什么)?)[，,：:\s]*/,'')
  if(!value||!style||style.id==='TRIP')return limit(value,style)
  // IP is a UI identity and a tone guide, never a hard-coded sentence placed
  // in front of a visitor's answer. That used to create unrelated animal
  // imagery in otherwise simple factual answers.
  return limit(value,style)
}

module.exports={resolve,limit,applyLocal,polish,contextHint}
