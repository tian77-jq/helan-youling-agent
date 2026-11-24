# Shapotou B2B Technical Snapshot

**What** — 《贺兰有灵 Scenic AI Engine》中的沙坡头场景 Reference Implementation，定位为 Experience Intelligence Layer，不替代客户已有票务、酒店、会员或 CMS。

**How it fits** — 微信是 First-Class Demo Client；页面进入 Application Service，再进入 `Shapotou Adapter`。宁夏默认链路保持 legacy-compatible。

**Current modules** — Profile、Experience Catalog、Trip Orchestration、evidence-gated Story、Memory/Share template、external hook configuration。

**Deployment** — 当前为本地/微信 Preview 与 CloudBase-compatible demo，未做正式企业发布。客户可替换 LLM、图片、知识、存储和票务适配器，但需要重新做权利与安全审计。

**Limits** — 实时票价、开放时间、活动、房态和库存没有接入时只输出 SAFE UNKNOWN；沙坡头当前是 `INDEPENDENT_POC`，无官方授权或合作背书。

**Next buyer validation** — 验证哪一段游客生命周期、哪一个运营指标和哪一种集成方式值得采购。`BUYER_NEED_VALIDATED = NO`。
