# 混元生产接入准备

`image-service` → `provider` → `hunyuan`。

- `LOCAL_DEMO_MODE`：比赛稳定模式，固定/本地 Prompt 结果。
- `HUNYUAN_MODE`：生产模式，调用已部署并验收的 `generateImage` 云函数。
- 成功返回 `success:true,imageUrl,message`。
- 失败返回 `success:false,code,message`，自动回退本地结果，不影响首页或路线。

切换前必须完成云函数部署、超时设置、真机成功/失败回归和成本限额。
