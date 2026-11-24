# 模型角色冻结

## 开发模型

`GPT_LUNA` 只用于代码开发、调试、审计、测试和部署辅助，不属于《贺兰有灵》小程序 Runtime Model Provider，不进入生产 Provider Registry。

## 运行时模型

| Provider | Model | Role | Status |
| --- | --- | --- | --- |
| cloudbase | hy3 | USER_RUNTIME_TEXT_MODEL | ACTIVE |
| coding-plan | Deepseek-v4-flash | USER_RUNTIME_TEXT_MODEL | STANDBY |

当前流量为 Hunyuan hy3 100%、DeepSeek 0%。两者都属于用户回答模型；GPT Luna 不适用于运行时流量。

模型切换只允许替换 TextModelPort Provider，不能改变 Ningxia RAG、Evidence Gate、Character Router、Trip Engine、Story Engine、Memory、Scene Resolver 或 Host Adapter。
