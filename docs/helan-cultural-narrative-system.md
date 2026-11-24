# Helan Cultural Narrative System

## Product definition

《贺兰有灵》把宁夏知识资产转成可复用的文化叙事单元：用户从一个问题进入，由合适的原创 IP 讲述，落到真实地点，再转成问答、路线、现场互动或文化共创。

## Runtime chain

`Ningxia Knowledge Asset → Theme/Place Graph → Task Contract → Character Lens → Retriever → Hunyuan → Evidence Gate → Story / QA / Trip / Create`

故事不是长文章，而是 `Hook → Story → Meaning → Place → Interaction → Action`。`knowledgeIds`、`facts` 和 `relatedPlaces` 是内容边界；角色只改变叙事视角，不改变事实。

## Three lenses

- yanYang：山与生命的观察者，负责贺兰山、岩羊、生态、动物、地质和岩画环境。
- luoTuo：文明与道路的讲述者，负责西夏、丝路、黄河文明、历史、非遗和文化交流。
- shaHu：今天宁夏的旅行伙伴，负责路线、景区、美食、夜游、交通和城市生活。

## Release experience

首页建立好奇，Story 建立理解，AI QA 负责追问，Trip 负责出发，AI Create 负责把理解变成纪念作品。实时语音 V1 冻结，文字/字幕人格仍完整可用。

## Acceptance boundary

当前可本地验收：故事字段完整性、角色匹配、地点关联、五级展开、创建提示、路由与页面引用。真实景区实时信息、云端模型、真机和合作授权仍需上线前验证，不以静态回归替代。
