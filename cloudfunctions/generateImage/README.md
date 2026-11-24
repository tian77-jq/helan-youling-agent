# generateImage

功能：通过 `@cloudbase/node-sdk >= 3.18.3` 在服务端调用腾讯混元 `hunyuan-image`。

模型：`HY-Image-3.0-Plus-4090-Tob-v1.0`。

只有返回 `provider: hunyuan-node-sdk` 且 `imageUrl` 非空，页面才认定为真实混元图片；本函数不生成本地假图。

若输入 `imageUrls` 或 `images`，自动切换模型 `HY-Image-v3.0-I2I-ToB-v1.0.1` 进行图生图；没有参考图时使用文生图模型。参考图最多 1 张，支持 jpg/jpeg/png，大小限制由调用端保证不超过 10MB。
