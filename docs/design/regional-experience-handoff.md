# Regional Experience Handoff

视觉层通过 `design-tokens/theme-contract.js` 与景区 adapter 提供的 scene semantics 组合。更换颜色、motion mode、hero asset 或关闭 mascot，不应修改 domain、Trip Core 或 Provider。

沙坡头主题使用 `SHAPOTOU`：`FLOW_REVEAL_GLOW`。其真实运行入口仍是 `/pages/trip/index?scenic=shapotou`，链路为 Trip → Refinement → Story → Memory；实时开放、价格、场次与素材授权不在本地假定。

交接验收：替换主题 token、切换 `MOTION_MODE=REDUCED`、替换资产登记项、关闭 mascot、增加 mock scenic theme，核心业务测试结果应保持不变。
