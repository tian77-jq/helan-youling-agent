# wx://not-found / Page 未注册根因记录

## 现象

真机日志出现 `Component is not found in path "wx://not-found"`，随后首页、发现、文创展厅、我的页面均提示 `Page has not been registered yet`。

## 根因

项目没有 `components/` 与有效 `usingComponents`，但 `app.json` 开启了 `lazyCodeLoading: "requiredComponents"`。真机在组件递归注入阶段进入空组件占位路径，导致页面注册链中断；首页业务代码尚未执行，所以不是首页数据或图片逻辑。

## 修复

删除无实际用途的 `lazyCodeLoading` 配置，保留普通页面注册与分包配置。构建标识更新为 `20260823-v2-phase10-no-lazy-injection`。

## 验证

- 本地路由、组件路径、依赖、媒体审计：PASS
- 微信开发者工具 CLI 编译/预览：PASS
- 官方预览包：总包 1,568,242 字节；主包 1,488,796 字节；feature 分包 79,446 字节
- 真机扫码：需使用新二维码验证，不能继续使用旧二维码缓存
