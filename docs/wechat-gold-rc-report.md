# 贺兰有灵 · 微信 Gold RC 报告

## 产品定位

贺兰有灵以宁夏知识资产、原创三萌宠人格和微信小程序交互为核心，提供问答、行程规划与 AI 共创能力。

## 本地 RC 证据

- Current Turn Isolation：PASS。
- Intent Router：40/40 PASS。
- Character Router：10/10 PASS。
- Answer Relevance：30/30 PASS。
- Conversation Stress：50/50 PASS。
- Trip Time Slot：5/5 PASS。
- 主包：1.224 MiB；分包：88,989 bytes。
- 本地代码质量扫描：PASS；页面注册审计：PASS。

## 微信官方语音能力

| 字段 | 已核验信息 |
|---|---|
| OFFICIAL_CAPABILITY_NAME | 历史资料中的微信同声传译插件（WechatSI）；当前后台未核验 |
| PROVIDER_APPID | `UNVERIFIED_HISTORICAL_REFERENCE`，不得写入生产配置 |
| PLUGIN_VERSION | `UNVERIFIED_HISTORICAL_REFERENCE`，不得写入生产配置 |
| TEXT_TO_SPEECH_API | 仅为历史 Provider 兼容接口，当前未作为生产能力确认 |
| INPUT_FIELDS | `UNVERIFIED_HISTORICAL_REFERENCE` |
| OUTPUT_FIELDS | `UNVERIFIED_HISTORICAL_REFERENCE` |
| LANGUAGE_SUPPORT | `zh_CN`、`en_US` |
| AUDIO_RETURN_TYPE | 插件返回的可播放文件路径 |
| PLUGIN_AUTH_REQUIRED | 需先在公众平台「设置 → 第三方服务 → 插件管理」核验当前插件状态；本机无后台访问证据 |
| FREE_OR_PAID / REVIEW_REQUIREMENT | 当前官方公开材料未提供可用于本项目的确定结论；不作免费、计费或审核承诺 |

工程已采用统一 Provider 返回协议，并复用既有 `InnerAudioContext` 播放层。腾讯云 TTS 保持 `PERMISSION_BLOCKED` 熔断；当前 release candidate 固定字幕模式，插件完成管理员授权后才在下一构建中恢复声明。

官方参考：腾讯维护的 [Face2FaceTranslator README](https://github.com/Tencent/Face2FaceTranslator) 说明插件添加方式、`textToSpeech` 能力和中文/英文支持；腾讯维护的 [TDesign MiniProgram 示例](https://github.com/Tencent/tdesign-miniprogram/blob/develop/packages/tdesign-miniprogram/example/app.json) 使用 `0.3.6` 与相同 Provider。

## 真实设备与 Golden Path

本报告不将本地脚本视为真机结果。以下仍待 Android 真机实际验收：

1. AI 问答：岩羊回答贺兰山动物问题。
2. AI 灵游：三天文化旅行。
3. 行程连续修改：改两天并把览山安排到傍晚。
4. AI 灵境：用户实际看到混元生成图。
5. 数字人格：手机实际听到语音。

## 当前结论

本地 RC 为通过状态；微信 Gold RC 仍为 `CONDITIONAL`。WechatSI 当前只能记录为 `NO_ACCESS / NOT_CONFIGURED`：没有公众平台实时插件状态，不能把它写成“只差管理员授权”；腾讯云 TTS 另有 CAM 权限问题。未取得插件或服务端 Provider 的真实音频与真机证据前，语音真实通过不能写为 PASS。
