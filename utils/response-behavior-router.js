function responseBehaviorRouter(routing,context={}){
  if(!routing)return {response_behavior:'CLARIFICATION',behavior:'clarification',need_clarification:true,reason:'missing_routing'}
  if(routing.intent==='TRIP_PLANNING_NEEDS_DURATION')return {response_behavior:'ASK_DURATION',behavior:'ask_duration',need_clarification:true,reason:'missing_trip_duration'}
  if(routing.intent==='TRIP_NEEDS_BASE_CITY')return {response_behavior:'ASK_BASE_CITY',behavior:'ask_base_city',need_clarification:true,reason:'missing_trip_base_city'}
  if(routing.intent==='TRIP_DISCOVERY')return {response_behavior:'GUIDED_TRIP_DISCOVERY',behavior:'guided_trip_discovery',need_clarification:false,reason:'trip_discovery_next_step'}
  if(routing.intent==='TRIP_PLANNING')return {response_behavior:'TRIP_PLAN',behavior:'trip_plan',need_clarification:false,reason:'explicit_planning_intent'}
  if(routing.intent==='ADJUST_TRIP'||routing.intent==='TRIP_REFINEMENT')return {response_behavior:'ADJUST_TRIP',behavior:'adjust_trip',need_clarification:false,reason:'modify_existing_plan'}
  if(routing.intent==='ATTRACTION_QA'||routing.intent==='CULTURE_QA')return {response_behavior:'STORY_EXPLANATION',behavior:'story_explanation',need_clarification:false,reason:'specific_cultural_question'}
  if(routing.intent==='FOOD_RECOMMENDATION'||routing.intent==='FOOD_QA')return {response_behavior:'FOOD_GUIDE',behavior:'direct_answer',need_clarification:false,reason:'specific_food_question'}
  if(routing.intent==='NIGHT_TRAVEL')return {response_behavior:'NIGHT_GUIDE',behavior:'night_recommendation',need_clarification:false,reason:'night_travel_question'}
  if(routing.intent==='GENERAL_DISCOVERY'&&routing.confidence>=0.7)return {response_behavior:'DIRECT_ANSWER',behavior:'direct_answer',need_clarification:false,reason:'clear_discovery_question'}
  const hasUsefulMemory=(context.first_visit||(context.companions&&context.companions.length)||(context.time)||(context.location)||(context.budget)||(context.preferences&&context.preferences.length)||(context.action_limits&&context.action_limits.length))
  if(routing.intent==='GENERAL_DISCOVERY'||hasUsefulMemory)return {response_behavior:'DIRECT_ANSWER',behavior:'direct_answer',need_clarification:false,reason:'context_supported'}
  return {response_behavior:'CLARIFICATION',behavior:'clarification',need_clarification:true,reason:'severely_insufficient_context'}
}
module.exports={responseBehaviorRouter}
