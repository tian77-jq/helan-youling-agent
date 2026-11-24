# 贺兰有灵 V2.0 工程化架构重构报告

## 当前目录边界

```text
pages/index       纯展示首页与四个入口
pages/ai-trip     AI 灵游入口（独立规划服务）
pages/ai-create   AI 灵境入口（独立混元生图服务）
pages/ip          IP 故事馆（保留业务资产）
pages/shop        文创商城（保留业务资产）
pages/admin       用户与设置
services/         scenic / trip / image / knowledge / cloud 边界
data/             scenic.json / food.json / culture.json
cloudfunctions/   generateImage 等云函数保持独立
```

## 本次修改

- 首页改为静态 Logo、三萌宠和四个入口，不再加载景区、美食、非遗大列表。
- 首页不调用 AI，不调用云函数，不初始化云开发；`app.js` 改为静态启动，云开发由功能服务懒初始化。
- 新增 `pages/ai-trip`、`pages/ai-create`。
- 新增 `services/scenic-service.js`、`trip-service.js`、`image-service.js`、`knowledge-service.js`、`cloud-service.js`。
- 新增 `data/scenic.json`、`food.json`、`culture.json`。
- 新增 `scripts/project-health-check.js`，生成根目录 `PROJECT_HEALTH_REPORT.md`。
- 删除临时运行检查脚本 `scripts/runtime-home-inspect.js`、`scripts/runtime-tab-registration-audit.js`。
- 旧 `pages/trip`、`feature/create`、商城和 IP 业务暂时保留为兼容层，避免一次性重写造成资产丢失；新入口已切换到 V2 页面。

## 当前验证

- 开发者工具正式编译：通过
- V2 Phase 1 包：总包 1,557,593 字节，主包 1,478,147 字节，feature 分包 79,446 字节
- 工程健康检查：PASS
- 页面：9；注册路由：21；组件依赖错误：0
- 图片/音频超过 200 KB：0
- 官方自动化首页截图：无异常，已生成 `v2-phase1-home.png`

## 真机验收

本地自动化不能替代手机微信验收。请用最新二维码在手机执行：

1. 扫描 `v2-phase1-preview.png`，确认首页显示 Logo、三萌宠和四入口。
2. 点击 AI 灵游，输入“两天宁夏历史美食”，确认规划失败时仍显示降级提示。
3. 点击 AI 灵境，输入“西夏文化与双峰驼联名”，确认成功显示图片或失败提示“当前生成繁忙，请稍后再试”。

手机真实打开首页是本阶段最终验收条件；在此之前不宣称真机已通过。
