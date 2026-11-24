# Visual Lab Pattern Index

日期：2026-08-30

本轮只做模式提取，不复制源码、Logo、专有插画或第三方素材。Production 不 import `.research`。

## 可核验基准

| benchmark | evidence | license | extracted use |
| --- | --- | --- | --- |
| wechat-miniprogram/miniprogram-demo | official component/API/cloud examples | MIT | native interaction and loading states |
| wechat-miniprogram/awesome-skyline | official Skyline examples | MIT | card transition, immersive browsing, sticky navigation |
| wechat-miniprogram/lottie-miniprogram | official mini-program adapter | MIT | optional signature canvas animation; not installed this round |
| Tencent/tdesign-miniprogram | Tencent component system | MIT | mature controls only; not installed this round |

## Pattern extraction

1. Immersive hero：首屏以场景建立记忆；宁夏适配：山门。
2. Scroll reveal：内容随进入视口揭示；宁夏适配：沙丘退开。
3. Card transition：卡片承担状态变化；宁夏适配：Trip 路线节点。
4. Sticky story nav：故事线保持方向感；宁夏适配：河脊。
5. Mask reveal：用遮罩表达场景变化；宁夏适配：沙揭幕。
6. Character entrance：角色进入有叙事位置；宁夏适配：岩羊登山脊。
7. Depth layer：前中后景形成空间；宁夏适配：贺兰山三层。
8. Timeline flow：时间轴表达行程；宁夏适配：黄河→沙海→日落→星空。
9. Page morph：页面状态连续变化；宁夏适配：Trip refine。
10. Canvas character：角色可作为视觉锚点；本轮保留静态降级，不引入依赖。
11. Layer parallax：层间位移制造纵深；本轮以 transform-only WXSS 实现。
12. Scene change：颜色和层次共同变场景；宁夏适配：河到沙。
13. Loading choreography：等待状态也属于产品叙事；本轮保留现有可点击 loading。
14. Star memory map：保存结果转为可见空间；宁夏适配：我的宁夏星图。
15. Culture-first exhibition：先讲文化，再展示商品；宁夏适配：文创沙丘展陈。

## Selection rule

优先选择原生 WXML/WXSS 可实现、仅使用 transform/opacity 的模式；Lottie/Skyline 需另行真机 spike，当前未复制代码、未安装依赖、未进入 Production。
