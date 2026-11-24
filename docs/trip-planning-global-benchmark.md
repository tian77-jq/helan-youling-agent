# AI 灵游旅行规划 Benchmark

研究日期：2026-08-29

本轮只把公开资料中能核验的产品能力写入设计依据；实时天气、客流、票价、商户营业状态等动态信息仍必须接入可靠数据源后才能进入产品。

## 国内案例（15）

| 案例 | 可借鉴能力 | 对灵游的落点 |
| --- | --- | --- |
| 沪小游 | AI 个性化行程、Citywalk、吃住行游购娱 | 游前—行中—行后闭环 |
| 乐游上海资源池 | 多类文旅资源统一调用 | 景区、文化、生活体验统一候选 |
| 上海文旅服务中心 | LBS、导览、厕所、寄存、消费服务 | 实用信息优先，证据不足不编造 |
| 重庆 AI+文旅服务端 | “懂城市、懂游客、懂消费” | 城市画像 + 游客约束 + 消费场景 |
| 重庆数字文旅项目 | 高质量数据集、全程 AI 伴游 | 知识库先行，规划结果可追溯 |
| 重庆夜游/滨江项目 | 夜游、演艺、烟火市集、滨水休闲 | 夜晚成为可选节奏层 |
| 广州 AI 游广州 | 以时间、预算、兴趣组织推荐 | 先收集阻塞槽位，再快速出首版 |
| 乐游北京 | 城市文化资源与公共服务入口 | 文化解释连接到真实行程 |
| 杭州文旅大脑 | 城市级数据与目的地服务协同 | 地理簇与交通约束 |
| 成都文旅 | 美食、街区、夜生活与景区并置 | LOCAL_LIFE_EXPERIENCE |
| 西安文旅 | 历史文化主题线路 | CULTURAL_ANCHOR + WHY_THIS_STOP |
| 洛阳文旅 | 按主题组织古都游线 | CULTURE / CLASSIC 路线风格 |
| 龙门石窟智慧导览 | 按时间与兴趣选择文化、亲子等路线 | TIME + INTEREST → ROUTE |
| 故宫数字导览 | 分层讲解与游览动线 | 文化讲解不脱离点位顺序 |
| 敦煌数字文旅 | 文化遗产叙事与数字体验结合 | Story → Plan → Experience |

## 国际案例（8）

| 案例 | 可借鉴能力 | 对灵游的落点 |
| --- | --- | --- |
| Louvre Visitor Trails | 按时间和兴趣提供路线 | 最小可行规划只需地点范围 + 时长 |
| Google Arts & Culture | 主题化文化探索 | 兴趣标签驱动文化内容 |
| Visit London | 城市分区、主题和公共交通 | LOCATION_CLUSTER，减少折返 |
| VisitScotland | 慢旅行、自然与地方生活 | PACE 与自然体验并重 |
| Singapore Tourism Board | 城市生活、餐饮、夜间体验 | 生活层不是景点附属品 |
| National Trust UK | 路线、可达性、休息与现场提示 | REST / ACCESSIBILITY / SAFETY |
| U.S. National Park Service | 地图、路线、餐饮、厕所、交通、无障碍 | NPS 小服务原则进入卡片 |
| Visit Japan | 地域、季节、文化与交通组合 | 文化体验必须落在可执行节点 |

## 维度提炼

每个案例按 `USER_INTENT / TIME_INPUT / INTEREST_INPUT / ROUTE_STRUCTURE / PACE / LOCAL_LIFE / FOOD / NIGHT / CULTURE / REST / TRANSPORT / MAP / WHY_THIS_STOP / PERSONALIZATION / FOLLOW_UP_EDITING / BEFORE_TRIP / DURING_TRIP / AFTER_TRIP` 检查。共同结论形成以下 15 条产品原则：

1. 明确旅行行动 + 时长即可进入规划，不依赖“规划/路线”关键词。
2. 只追问真正阻塞规划的槽位。
3. 宁夏区域请求在短行程中必须确认出发城市，禁止热门城市静默默认。
4. 默认 `BALANCED`，不把游客按满。
5. 一日只安排 2–3 个核心体验，再加餐饮/生活和可选夜间体验。
6. 每天有主题，但 `UTILITY_FIRST / STORY_SECOND`。
7. 用地理簇减少跨城跳跃与回头路。
8. 上午主体验、午餐、下午主体验、休息、傍晚/夜晚是生活节奏骨架。
9. 食物是行程节点，不是末尾推荐清单。
10. 日落、夜游、慢时刻按兴趣和体力可选加入。
11. 每个停留都解释“为什么是这里”。
12. 交通、厕所、休息、无障碍、预约和安全提示与景点同等重要。
13. 没有实时证据就用安全时间段，不伪造精确开放时间、班次和天气。
14. 快速修改只改变偏好与约束，保留用户已确认的路线语义。
15. 行程结束后把访问主题沉淀为纪念内容，形成 `PLAN → LIVE → CREATE`。

## 一手资料

- [上海市文化和旅游局：沪小游 AI 文旅介绍](https://whlyj.sh.gov.cn/cysc/20250321/0bd1b29fdcbd41fd915d493b2d1b3b99.html)
- [上海市文化和旅游局：沪小游服务中心](https://whlyj.sh.gov.cn/wlyw/20260819/1199d1e5b6f7459b995fb0dfba4db3e0.html)
- [重庆市文化和旅游发展委员会：AI+文旅服务端项目](https://whlyw.cq.gov.cn/zwxx_221/bmdt/tzgg/202605/t20260522_15695820.html)
- [腾讯云：龙门石窟智慧导览](https://developer.cloud.tencent.com/article/1646632)
- [Louvre：Visitor Trails](https://www.louvre.fr/en/explore/visitor-trails)
- [Louvre：Explore](https://www.louvre.fr/en/explore)

