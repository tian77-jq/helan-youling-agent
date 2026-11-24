# 媒体资源审计 · Phase 31E

扫描时间：2026-08-29；扫描范围：正式代码目录，排除 `docs/`、`scripts/`、`cloudfunctions/`、`.git/`、`backup_before_*/` 与 `node_modules/`。媒体类型：jpg/jpeg/png/webp/gif/svg/mp3/wav/aac/m4a/mp4。

| 指标 | 结果 |
| --- | --- |
| 正式范围媒体文件 | 83 |
| 超过 200K 的媒体 | **0** |
| 媒体总大小 | 1,213,603 B（约 1.157 MiB） |
| 最大文件 | `assets/thumbs/scenic-collab/ningxia_museum.jpg`，109,147 B（106.59 KB） |
| 本地音频 / 视频 | 0 |
| 静态扫描发现的未直接引用媒体 | 21 个，均位于 `assets/thumbs/intangible/` |

## 结论

当前正式上传范围内没有任何超过 200K 的图片、音频或视频。`assets/thumbs/intangible/` 已由 `project.config.json` 的 `packOptions.ignore` 排除，不进入上传包；因此不删除用户资产，也不影响运行时。

开发者工具中“资源大小不应超过 200K”的既有红项，不能由当前文件复现。请在保持本 RC 配置的前提下执行“清缓存并重新扫描代码质量”；如果仍红，导出该项的具体文件名后再针对处理。不要在未定位文件前盲目压缩核心 IP 视觉。

## 最大的十个正式媒体

| 文件 | 大小 |
| --- | ---: |
| `assets/thumbs/scenic-collab/ningxia_museum.jpg` | 109,147 B |
| `assets/thumbs/food-collab/overview_food_map.jpg` | 79,836 B |
| `assets/thumbs/banners/product_matrix.jpg` | 48,272 B |
| `assets/thumbs/scenic-collab/zhenbeibao_fox_collab_banner.jpg` | 34,581 B |
| `assets/thumbs/food-collab/overview_ip_showcase.jpg` | 34,135 B |
| `assets/thumbs/scenic-collab/shapotou_camel_collab_banner.jpg` | 32,712 B |
| `assets/thumbs/scenic-collab/helan_mountain_banner.jpg` | 19,077 B |
| `assets/thumbs/scenic-collab/helan_rock_painting_banner.jpg` | 19,615 B |
| `assets/thumbs/scenic-collab/shahu_banner.jpg` | 18,868 B |
| `assets/thumbs/scenic-collab/xixia_tombs_banner.jpg` | 18,637 B |
