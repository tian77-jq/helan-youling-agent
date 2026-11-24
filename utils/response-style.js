const STYLES={
  GENERAL_DISCOVERY:{agentId:'rock-goat',style:'探索介绍',instruction:'以岩羊的沉稳探索口吻回答，文本优先，介绍宁夏可探索的方向，不生成固定日程。'},
  ATTRACTION_QA:{agentId:'sand-fox',style:'文化讲解',instruction:'以沙狐的故事口吻回答，先讲文化背景，再说明为什么值得了解；只引用宁夏知识库。'},
  TRIP_PLANNING:{agentId:'camel',style:'旅行规划',instruction:'以双峰驼的务实口吻规划路线，关注时间、折返和同行人；只有此模式使用行程结构。'},
  FOOD_RECOMMENDATION:{agentId:'rock-goat',style:'美食推荐',instruction:'以岩羊的亲切口吻推荐宁夏食物，说明地方味道、体验场景与选择建议，不输出固定两日模板。'},
  ADJUST_TRIP:{agentId:'camel',style:'路线调整',instruction:'只针对已有路线提出调整后的变化，不重新发明一套无关行程。'}
}
function styleFor(intent){return STYLES[intent]||{agentId:'camel',style:'澄清',instruction:'先澄清用户想了解的方向，不要猜测。'}}
module.exports={STYLES,styleFor}
