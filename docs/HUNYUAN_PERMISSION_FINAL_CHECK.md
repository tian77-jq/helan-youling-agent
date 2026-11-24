# HUNYUAN Permission Final Check

## STATUS: BLOCKED

CloudBase 环境和云函数部署可访问；但本地/CLI 无法证明腾讯混元图片模型已开通、账户额度充足或 CAM 权限完整。需要在腾讯云控制台核对模型服务、额度、AI 权限和云函数服务角色。

补充：当前真机已返回 `-504003 / FUNCTIONS_TIME_LIMIT_EXCEEDED`，因此在权限验证前必须先把 `generateImage` 超时从 3 秒提高；否则请求会在模型返回前被终止，无法据此判断权限是否成功。
