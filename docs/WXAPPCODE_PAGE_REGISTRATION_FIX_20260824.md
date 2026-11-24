# wx://not-found / Page 未注册修复

## 证据

真机日志同时出现：

- `Component is not found in path "wx://not-found"`
- `Page "pages/index/index" has not been registered yet`
- `Page "pages/ip/index" has not been registered yet`
- `Page "pages/shop/index" has not been registered yet`
- `Page "pages/admin/index" has not been registered yet`

项目全量页面文件存在，且没有任何自定义 `usingComponents` 声明。页面 JS 语法和本地依赖审计均通过。

## 根因处理

关闭 `app.json` 中不必要的 `lazyCodeLoading: "requiredComponents"`。当前项目无自定义组件，不需要启动组件递归注入；该注入链出现 `wx://not-found` 后会连锁导致页面注册失败。

## 验证

- 页面、路由和依赖检查：PASS
- 缺失依赖：0
- 页面文件缺失：0
- 自定义组件声明：0

必须清除开发者工具编译缓存、重新编译并重新生成二维码后再判断真机结果；旧二维码仍可能加载旧产物。
