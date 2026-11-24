# 用户需求验证体系

## 目标人群

宁夏游客、大学生旅行群体、留学生、文旅消费者、景区合作方。

## 核心问题

1. 游客是否需要可信的 AI 行程规划？
2. 游客是否愿意把旅行经历生成数字纪念品？
3. 哪类 IP 文创最有购买意愿？
4. 景区最需要导览、传播还是联名转化？
5. 留学生理解宁夏文化的最大障碍是什么？

## 采集原则

不预填、不伪造、不把意向当成交。每条访谈记录包含 `respondentType`、`questionnaireVersion`、`answers`、`consent`、`createdAt`，仅在获得同意后保存匿名数据。

## 预留接口结构

```json
{"id":"","respondentType":"tourist|student|international|consumer|partner","answers":{},"consent":false,"createdAt":""}
```
