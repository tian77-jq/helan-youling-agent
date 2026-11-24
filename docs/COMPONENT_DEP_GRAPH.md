# 组件依赖图（编译产物审计，2026-08-23）

## 扫描结果

项目全量 JSON 扫描结果：`usingComponents` 声明 0 个；`Component({})` 实例 0 个；自定义组件目录 0 个。

因此当前项目不存在“页面 → 自定义组件 → 失效文件”的依赖链，也不存在大小写错误或已删除组件路径。WXML 仅使用微信内置基础组件（`view`、`text`、`image`、`button`、`input`、`scroll-view` 等），无需组件注入文件。

## 页面与分包

正式主包页面：

`pages/index/index` → 无自定义组件

`pages/trip/index` → 无自定义组件

`pages/ip/index` → 无自定义组件

`pages/recommend/index` → 无自定义组件

`pages/language/index` → 无自定义组件

`pages/shop/index` → 无自定义组件

`pages/admin/index` → 无自定义组件

`feature/*` 分包页面 → 无自定义组件

## 结论

`recurseUsingComponents` 不是由项目自定义组件声明触发的；项目侧没有可修复的 `usingComponents` 目标。若真机仍出现 `Can't find variable: __wxAppCode__`，下一步必须用最小正式包区分开发者工具/手机运行时问题与项目打包链问题。

## 最小正式包实测

已临时编译仅包含 `pages/runtime-final/index`（`<view>HELLO</view>`）的正式包，保持压缩开启、未关闭按需注入；开发者工具预览成功，生成二维码：`runtime-final-25-preview.png`。随后已恢复正式 `app.json`，并删除临时页面文件。由于该最小包仍由开发者工具生成且不含任何自定义组件，若手机扫描此二维码仍出现同一 `__wxAppCode__` 栈，故障边界就在微信客户端/基础库或预览缓存，不在业务页面和组件依赖。
