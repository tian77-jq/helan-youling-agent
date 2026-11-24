# HUNYUAN Timeout Fix

## 当前事实

- 修改前线上函数超时：3 秒。
- 本地代码无法通过 CLI 修改 CloudBase 超时；部署命令没有 timeout 参数。
- 已将混元请求 `revise` 关闭，减少额外生成耗时，并保留客户端 65 秒超时。
- 已重新部署函数代码；线上平台超时仍需在 CloudBase 控制台调整到至少 60 秒，建议按官方生图建议配置更长时间。
- 新增 `cloudbaserc.json`，为声明式 CloudBase CLI 部署固定 `generateImage`：`timeout: 60`、`memorySize: 1024`、`installDependency: true`。

## 部署结果

代码部署成功；函数 Active。微信开发者工具 CLI 不支持更新超时，线上函数仍需通过 CloudBase 控制台或 `tcb config update fn generateImage --timeout 60 --memory 1024 -e cloudbase-d6g1u2dzk45c62fc1 --yes` 应用 `cloudbaserc.json`；在此动作完成前不标记真实生成成功。

## 2026-08-24 真机证据

真机截图明确返回：`errCode: -504003`、`FUNCTIONS_TIME_LIMIT_EXCEEDED`、`Invoking task timed out after 3 seconds`。
这证明请求已经到达 `generateImage`，但在腾讯混元返回前被 CloudBase 运行时终止；不是页面参数或 Prompt 错误。

前端已改为将该错误显示为“云函数超时：当前 generateImage 超时配置为 3 秒，请在 CloudBase 控制台提高到至少 60 秒后重试”，完整 `code/detail/rawError` 仍写入调试日志，避免把根因伪装成“服务繁忙”。

## 2026-08-24 12:42 真机复核

AI 灵境页面已经正常打开，说明页面注册、WXML 和前端调用链已恢复。页面显示的唯一阻塞仍为：`generateImage` 线上超时配置 3 秒。`cloudbaserc.json` 只是本地声明配置，尚未自动改变线上函数；必须通过 CloudBase 控制台或 TCB CLI 应用后再测。
