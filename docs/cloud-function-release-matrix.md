# 云函数发布矩阵（RC）

本地存在不等于线上已部署。以下函数的线上版本、环境变量、权限和调用日志均需要主体管理员在 CloudBase 控制台验证，因此一律记为 `ONLINE_UNVERIFIED`。

| 云函数 | 本地目录 | 客户端用途 | 本地状态 | 线上状态 | 上线前验证 |
| --- | --- | --- | --- | --- | --- |
| `generateImage` | `cloudfunctions/generateImage` | AI 灵境生成 | `LOCAL_PRESENT` | `ONLINE_UNVERIFIED` | 真实生成一次，检查结果、失败提示和内容安全 |
| `knowledgeSearch` | `cloudfunctions/knowledgeSearch` | 知识检索 | `LOCAL_PRESENT` | `ONLINE_UNVERIFIED` | 用文化、生态问题各验证一次 |
| `tripPlanner` | `cloudfunctions/tripPlanner` | AI 灵游 | `LOCAL_PRESENT` | `ONLINE_UNVERIFIED` | 验证 3 天生成、2 天改写、添加景点 |
| `ttsSpeak` | `cloudfunctions/ttsSpeak` | 语音讲解 | `LOCAL_PRESENT` | `ONLINE_UNVERIFIED` | 当前 RC 为字幕模式；不作为发布阻断项 |
| `visionRecognize` | `cloudfunctions/visionRecognize` | 拍照识景 | `LOCAL_PRESENT` | `ONLINE_UNVERIFIED` | 用户主动选图后检查授权、结果和失败提示 |

目标环境：`cloudbase-d6g1u2dzk45c62fc1`。生产代码当前图片路径配置为 `HUNYUAN_MODE`；若云函数不可用，必须显示明确失败提示，不得降级为伪造成功作品。
