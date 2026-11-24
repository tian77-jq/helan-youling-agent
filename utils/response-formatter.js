const {styleFor}=require('./response-style')
function clarification(){return '我还缺一个关键信息：你想了解景点、美食，还是需要安排具体的出行时间？'}
const MECHANICAL=[/请选择\s*[:：]?\s*[123一二三][\s\S]*?(?=\n|$)/g,/你更想了解[^。！？\n]*[。！？]?/g,/我可以(?:帮你)?介绍[^。！？\n]*[。！？]?/g,/我可以(?:帮你)?规划[^。！？\n]*[。！？]?/g,/请输入需求[^。！？\n]*[。！？]?/g]
const TRIP_TEMPLATE=/(第\s*[一二三四五六七八九十\d]+\s*(天|日|站)|day\s*[123]|行程卡片|时间轴|景点推荐|景区推荐|推荐景点|推荐图片|图片推荐|景区图片|旅游路线|旅行路线|(?:上午|下午|晚上)\s*[:：])/i
function cleanAnswer(answer){let value=String(answer||'');MECHANICAL.forEach(pattern=>{value=value.replace(pattern,'')});return value.replace(/\n{3,}/g,'\n\n').trim()}
function hasTripTemplate(answer){return TRIP_TEMPLATE.test(String(answer||''))}
function presentation(routing,behavior,result){
  const responseBehavior=behavior&&behavior.response_behavior
  if(responseBehavior==='TRIP_PLAN'||responseBehavior==='ADJUST_TRIP')return {output_type:'TRIP_OUTPUT',formatter:'timeline_route_card',image_renderer:'trip_route_images'}
  if(responseBehavior==='FOOD_GUIDE')return {output_type:'FOOD_OUTPUT',formatter:'food_knowledge_text',image_renderer:'food_knowledge_image'}
  if(responseBehavior==='NIGHT_GUIDE')return {output_type:'NIGHT_OUTPUT',formatter:'night_recommendation_text',image_renderer:'none'}
  if(responseBehavior==='STORY_EXPLANATION')return {output_type:'CULTURE_OUTPUT',formatter:'culture_knowledge_text',image_renderer:'culture_knowledge_image'}
  if(responseBehavior==='DIRECT_ANSWER')return {output_type:'GENERAL_OUTPUT',formatter:'discovery_text',image_renderer:'none'}
  return {output_type:'CLARIFICATION_OUTPUT',formatter:'clarification_text',image_renderer:'none'}
}
function format(routing,result,behavior){
  const view=presentation(routing,behavior,result)
  if((behavior&&behavior.need_clarification)||routing.need_clarification)return Object.assign(view,{format:'clarification',text:clarification(),style:styleFor(routing.intent)})
  if(routing.response_mode==='itinerary_card')return Object.assign(view,{format:'timeline_route_card',text:null,style:styleFor(routing.intent)})
  if(routing.response_mode==='cultural_explanation')return Object.assign(view,{format:'culture_story_reason',text:cleanAnswer(result&&result.answer),style:styleFor(routing.intent)})
  if(routing.response_mode==='food_recommendation')return Object.assign(view,{format:'food_list_experience',text:cleanAnswer(result&&result.answer),style:styleFor(routing.intent)})
  return Object.assign(view,{format:'text_first',text:cleanAnswer(result&&result.answer),style:styleFor(routing.intent)})
}
module.exports={format,clarification,cleanAnswer,hasTripTemplate,presentation}
