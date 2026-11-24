# HUNYUAN Real Test Report

## 结果：BLOCKED

| 测试 | 结果 | 原因 |
|---|---|---|
| 介绍贺兰山岩画 | LOCAL_KNOWLEDGE PASS | 文字模式仍为本地/降级模式 |
| 三天宁夏旅行 | LOCAL_AGENT PASS | 路线与 Evidence 通过本地回归 |
| 生成贺兰山岩羊旅行纪念卡 | NOT_VERIFIED | 已切换 HUNYUAN_MODE；云函数 Active，但超时为 3 秒且未完成额度/真机验收 |

## 真实验收记录格式

部署后必须记录：时间、BuildId、设备、基础库、云函数返回 `success`、`taskId`/请求 ID、非空 `imageUrl`、图片展示截图、保存作品记录。没有这些证据，不得标记 SUCCESS。
