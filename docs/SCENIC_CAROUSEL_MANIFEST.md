# SCENIC_CAROUSEL_MANIFEST

首页轮播现在包含两类不重复卡片：10 个真实景区实体项，以及从用户 DOCX 提取的 13 个联名视觉提案项。真实实体项进入 Knowledge 详情；视觉提案项明确标记为 `concept`，点击只预览图片，不伪装成已审核景区。

每项必须具备：`id`、`image`、`entityType`、`entityId`、`route`。真实实体的 `entityId` 必须能在 `knowledge/index.js` 解析；视觉提案使用唯一 `concept-*` ID 和 `preview` 动作。

静态审计：

```powershell
node scripts/scenic-carousel-check.js
```

静态通过不等于人工运行通过。必须逐张滑动、逐张点击并记录图片显示与详情打开结果。
