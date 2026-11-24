# 腾讯混元生产接入路线

`image-service` → `provider` → `hunyuan`。

- `LOCAL_MODE`：比赛演示，Prompt/固定作品，不依赖网络。
- `HUNYUAN_MODE`：部署并验收 `generateImage` 云函数后启用。
- 成功：返回 `success:true,imageUrl,message`。
- 失败：返回 `success:false,code,message`，页面显示降级提示，不影响首页和其他流程。

接入顺序：云函数部署 → 超时与错误协议验证 → 小流量真机测试 → 失败回归 → 再开放入口。
