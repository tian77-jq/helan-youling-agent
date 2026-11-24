# AI Conversation Test Set

执行脚本：`node scripts/conversation-intelligence-eval.js`

本测试集共 30 条，覆盖明确问题、复杂问题、模糊问题和三轮上下文引用。每条记录包含输入、预测 intent、实际 intent、response_mode 和结果；脚本输出为机器可读 JSON。

| # | 输入 | 预测 intent | 预期 response_mode |
|---:|---|---|---|
| 1 | 宁夏有什么好玩的？ | GENERAL_DISCOVERY | text_exploration |
| 2 | 推荐几个地方 | GENERAL_DISCOVERY | text_exploration |
| 3 | 适合摄影的景点 | GENERAL_DISCOVERY | text_exploration |
| 4 | 宁夏有哪些自然体验 | GENERAL_DISCOVERY | text_exploration |
| 5 | 两天怎么玩？ | TRIP_PLANNING | itinerary_card |
| 6 | 第一次来宁夏，两天时间怎么安排？ | TRIP_PLANNING | itinerary_card |
| 7 | 第一次来宁夏，不喜欢爬山怎么玩？ | TRIP_PLANNING | itinerary_card |
| 8 | 带老人去宁夏怎么安排？ | TRIP_PLANNING | itinerary_card |
| 9 | 情侣三天怎么玩？ | TRIP_PLANNING | itinerary_card |
| 10 | 预算300元怎么规划？ | TRIP_PLANNING | itinerary_card |
| 11 | 西夏陵值得去吗？ | ATTRACTION_QA | cultural_explanation |
| 12 | 贺兰山岩画讲什么？ | ATTRACTION_QA | cultural_explanation |
| 13 | 西夏陵适合老人吗？ | ATTRACTION_QA | cultural_explanation |
| 14 | 镇北堡有什么文化故事？ | ATTRACTION_QA | cultural_explanation |
| 15 | 水洞沟是什么地方？ | ATTRACTION_QA | cultural_explanation |
| 16 | 宁夏有什么美食？ | FOOD_RECOMMENDATION | food_recommendation |
| 17 | 第一次来宁夏吃什么？ | FOOD_RECOMMENDATION | food_recommendation |
| 18 | 八宝茶怎么体验？ | FOOD_RECOMMENDATION | food_recommendation |
| 19 | 手抓羊肉适合多人吗？ | FOOD_RECOMMENDATION | food_recommendation |
| 20 | 宁夏美食怎么选？ | FOOD_RECOMMENDATION | food_recommendation |
| 21 | 宁夏怎么玩？ | CLARIFICATION_REQUIRED | clarification |
| 22 | 宁夏怎么样？ | CLARIFICATION_REQUIRED | clarification |
| 23 | 银川值得去吗？ | CLARIFICATION_REQUIRED | clarification |
| 24 | 怎么去宁夏？ | CLARIFICATION_REQUIRED | clarification |
| 25 | 少走一点 | ADJUST_TRIP | adjust_existing_trip |
| 26 | 增加一点美食 | ADJUST_TRIP | adjust_existing_trip |
| 27 | 换一个景点 | ADJUST_TRIP | adjust_existing_trip |
| 28 | 第一轮：推荐几个地方 | GENERAL_DISCOVERY | text_exploration |
| 29 | 第二轮：第二个详细说说 | ATTRACTION_QA | cultural_explanation |
| 30 | 第三轮：怎么安排一天 | TRIP_PLANNING | itinerary_card |

多轮验收重点：第 29 条会将“第二个”解析为上一轮实体列表中的第二个，而不是重新生成默认行程。
