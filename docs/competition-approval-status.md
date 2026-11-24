# 《贺兰灵物》Competition Approval Status

审批日期：2026-08-16

## 已批准并冻结

```text
PHASE9B_PACKAGING_APPROVED
PHASE9C_HYBRID_ARCHITECTURE_APPROVED
PHASE9D_LOCAL_GOLDEN_TESTS_APPROVED
PACKAGE_OPTIMIZATION_APPROVED
HYBRID_AI_ARCHITECTURE_APPROVED
LOCAL_AGENT_FALLBACK_APPROVED
VISION_SAFE_GATE_APPROVED
```

## 当前总状态

```text
CURRENT_OVERALL_STATUS=CONDITIONALLY_APPROVED
COMPETITION_BUILD_READY=NOT_YET
```

## 冻结的核心架构

```text
CloudBase AI
→ 结构化意图/调整参数
→ Schema Validation
→ 本地宁夏 Knowledge
→ utils/trip-agent.js
→ 结构化路线
→ 事实约束与表达
```

`utils/trip-agent.js` 和 `knowledge/index.js` 是可靠规划、知识 grounding、fallback 与事实校验层，不得删除或改造成通用模型自由生成。

## Vision 状态

```text
VISION=DISABLED_SAFE
featureVisionEnabled=false
```

在云函数部署、Vision Provider 配置、真机上传、Knowledge ID 核验和临时文件清理全部完成前，不得改为 `true`，也不得展示模拟识别结果。

## 尚未批准为 DONE

```text
CloudBase Live Model: NOT_VERIFIED
visionRecognize: NOT_DEPLOYED
Vision Provider: NOT_CONFIGURED
WeChat Simulator: NOT_VERIFIED
WeChat Real Device: NOT_VERIFIED
Production Privacy: HUMAN_REVIEW_REQUIRED
Mini Program Submission: NOT_STARTED
Production Release: NOT_STARTED
Competition Submission: NOT_STARTED
```

## PHASE 10 范围

下一阶段仅处理 CloudBase live verification 与微信真实设备验证：环境/AppID 关联、Cloud AI 实际调用、Vision 云函数与临时图片链路、开发者工具编译、模拟器/真机核心流程、隐私权限和 Golden Demo 复测。

禁止新增大规模功能、重构已批准的本地 Agent、迁移 Knowledge、修改 Campus Growth、购买服务器/域名、正式发布或提审。

## PHASE 10 验收门槛

只有以下条件同时满足，才可申请 `COMPETITION_BUILD_READY`：

```text
CLOUDBASE_ENV_VERIFIED
CLOUD_AI_LIVE_CALL_PASS
LOCAL_FALLBACK_PASS
WECHAT_DEVTOOLS_BUILD_PASS
REAL_DEVICE_CORE_FLOW_PASS
VISION_PASS 或 VISION_DISABLED_SAFE
CLIENT_SECRET_SCAN_PASS
PRIVACY_FLOW_VALIDATED
MAIN_PACKAGE_PASS
```

