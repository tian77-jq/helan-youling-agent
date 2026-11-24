# 贺兰灵境 · AI文旅共创空间

## 已落地链路

首页入口 → 场景选择 → 文化子主题 → 旅行伙伴 → 风格与输出 → 旅行故事 → Prompt Builder → 生成结果 → 预览/保存/分享/再次生成。

页面位于 `feature/create` 分包：

- `index`：五大场景入口与产品差异化说明
- `config`：主题、IP、风格、输出类型和故事配置
- `result`：结果预览、文化说明、保存、分享、再次生成

## 服务模式

小程序端默认使用 Mock 模式，保证比赛演示链路可运行；服务层通过 `API_BASE` 预留 `/api/image/generate`，设置真实地址后即可切换。

FastAPI 适配层位于 `scripts/ai_image_api.py`，包含 Scene Config、Prompt Builder、Safety Filter、Quota Service 和 Image Service。启动示例：

```bash
IMAGE_PROVIDER=mock uvicorn scripts.ai_image_api:app --host 0.0.0.0 --port 8080
```

腾讯生图接入只需要在服务端 `ImageService._generate_tencent` 实现官方接口签名；密钥不会进入小程序前端。

## 额度与安全

默认每个本地用户每天 1 次，重新生成同样消耗额度；敏感内容会在 Prompt Builder 前拦截；生成提示明确禁止虚构票价、开放时间和实时交通。
