# 微信正式发布平台审计（2026-08-29）

审计边界：本机代码、开发者工具 CLI 登录与 Preview；没有取得微信公众平台后台会话或 CloudBase 管理台数据。`NO_ACCESS` 表示未读取到平台证据，绝不等同于“待处理”或“已通过”。

| 项目 | 状态 | 证据 / 必须核验事项 |
| --- | --- | --- |
| 开发者工具会话 | `VERIFIED` | CLI `islogin` 返回 `login: true` |
| 当前小程序名称 | `NO_ACCESS` | 在公众平台基本设置核对为“贺兰有灵” |
| 主体与认证 | `NO_ACCESS` | 管理员在公众平台确认主体、认证状态和有效期 |
| 小程序备案 | `NO_ACCESS` | 管理员在公众平台备案入口核对状态、主体信息与备案号 |
| 服务类目 | `NO_ACCESS` | 选择与“宁夏文旅信息展示 / 原创文创展示 / AI 创作”实际服务一致且平台允许的类目；不要猜测类目或资质 |
| 隐私保护指引 | `NO_ACCESS` | 按 `privacy-api-map.md` 填写，并以平台检测、真机授权和审核反馈为准 |
| 云函数线上状态 | `NO_ACCESS` | 见 `cloud-function-release-matrix.md`，逐个确认部署、权限与真实调用 |
| AI 内容标识 | `LOCAL_VERIFIED` | 创作结果页有 AI/合成内容标识；线上仍须检查真实页面 |
| 代码包 | `LOCAL_VERIFIED` | 本地门禁通过，docs/scripts/cloudfunctions 不进入小程序包 |
| 真机 RC | `PENDING_DEVICE_EVIDENCE` | 使用 `device-test-card.md` 取得真实结果 |
| 代码上传 | `LOCAL_AND_PLATFORM_UPLOAD_VERIFIED` | DevTools CLI 上传 `2.0.0` 成功，包体 1,266,485 B；体验版状态仍需公众平台确认 |

## 发布判断

`READY_FOR_DEVICE_RC_TEST`：代码侧可冻结；但不具备上传、提交审核或正式发布的声称条件。唯一下一步是最新 Preview 的真机测试。真机通过后，再由主体管理员处理上传版本、体验版、平台字段、审核和正式发布。

## 规则依据

- 涉及处理个人信息的功能，需要在小程序隐私保护指引中声明对应信息后才可调用相关隐私接口；平台自动检测可能有遗漏，应以实际实现和审核反馈补齐。[腾讯云对微信规则的说明](https://cloud.tencent.cn/document/product/1301/97930)
- AI 生成内容须按腾讯云相关规范做好显式及隐式标识，并对内容安全负责。[腾讯云 AI 相关功能特别约定](https://cloud.tencent.com/document/product/301/128365)
- 备案状态与所需材料只可由账号后台实际记录确认；不得根据代码或本机登录推断。[腾讯云备案小程序操作 FAQ](https://cloud.tencent.com/document/faq/243/55796)
