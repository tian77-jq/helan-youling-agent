# 宁夏美食 × 贺兰萌宠素材处理记录

## 输入与输出

- 输入 ZIP：`D:\宁夏美食_贺兰萌宠联名图片包.zip`（原文件未修改）
- ZIP 内图片：9 张，全部为 RGB PNG，无透明通道。
- 原始尺寸：4 张约 3:2（1535/1536 × 1024），5 张 1228 × 892（约 1.38:1）。
- 输出目录：`assets/images/food-collab/`
- 输出格式：手机端兼容 JPG；首页 7 张为 1280 × 853，未上首页的 2 张保留为 320 × 213 轻量版。所有图片等比 contain，仅补窄侧边，不裁切、不变形。
- 处理：Lanczos 等比缩放 + 轻度对比/色彩优化 + 加强但克制的 UnsharpMask；未使用 AI 重绘或过度锐化。
- 体积：资源目录约 1.17 MB；两张未上首页的轻量图保留在目录但从预览包排除，预计预览包约 1.91MiB，低于微信 2MiB 限制。

## 首页轮播选择与顺序

1. `overview_ip_showcase.webp`：三大原创生态 IP × 宁夏美食
2. `yinchuan.webp`：银川市
3. `overview_food_map.webp`：五市风味总览
4. `wuzhong.webp`：吴忠市
5. `overview_products.webp`：联名产品全景
6. `zhongwei.webp`：中卫市
7. `guyuan.webp`：固原市

`shizuishan.webp` 与 `overview_full.webp` 已处理并保留在同一资源目录，供后续专题页或内容扩展使用。

## 页面接入

- 保留原有“贺兰萌宠 × 宁夏景区”轮播及其交互。
- 在景区轮播之后新增“贺兰萌宠 × 宁夏美食”独立专区。
- 新专区使用原生 `swiper`：自动播放、循环、左右滑动、4500ms 间隔、600ms 动画、当前页指示。
- 点击图片调用 `wx.previewImage()` 查看完整大图，并记录 `view_food_collab` 事件。
- 图片使用 3:2 统一展示比例，避免裁掉萌宠、食物与原图文字。

## 校验记录

- Node.js 语法检查：`pages/index/index.js`、`utils/data.js` 通过。
- `app.json`、`project.config.json` JSON 解析通过。
- 首页引用的 7 个 WebP 资源逐一存在，全部可由 Pillow 解码。
- 微信开发者工具 CLI 已定位，但本机 CLI 服务端口关闭；`open` 命令停在“开启工具服务”确认提示，因此未能取得开发者工具 GUI 的最终编译回执。未执行可能上传项目的 `preview` 命令。
