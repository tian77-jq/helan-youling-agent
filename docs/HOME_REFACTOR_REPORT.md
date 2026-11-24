# 首页重构报告

日期：2026-08-23

## 修改前

- 首页直接依赖 `utils/data.js`，一次加载 IP、产品、景区、美食等完整数据。
- 首页存在阶段性异步 hydration、多个业务入口分支、行程/问答路由判断和图片错误降级逻辑。
- 首页静态依赖：4 个业务模块引用（以 Git 基线 `pages/index/index.js` 的 `require()` 统计）。
- 首页虽然没有直接 `wx.cloud.callFunction()`，但依赖业务路由和大数据模块，云端/AI 变化可能间接影响首屏。

## 修改后

- 首页仅保留 Logo、三萌宠静态数组、四个核心入口。
- 首页业务依赖：0 个 `require()`。
- 首页没有 `wx.cloud`、`callFunction`、AI 请求、知识库加载、Promise 初始化或批量 `setData`。
- 三张萌宠图片使用本地已压缩资源；云函数、AI 和网络不可用时首页仍可渲染。
- 入口分别指向 `pages/ai-trip/index`、`pages/ai-create/index`、`pages/ip/index`、`pages/shop/index`。

## 验证

- 首页官方自动化截图已正常显示。
- V2 编译主包：1,478,540 字节。
- 真实手机扫码仍需人工确认，本报告不把开发者工具截图当作真机通过。
