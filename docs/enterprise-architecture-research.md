# Enterprise Architecture Decision

## Decision

Adopt a pragmatic modular monolith with Ports & Adapters, contract-first boundaries, scenic adapters and provider adapters. Defer microservices until there is a real need for independent scaling, ownership or release cadence.

| Option | Benefit | Cost | Current fit | Future fit | Decision |
| --- | --- | --- | --- | --- | --- |
| Modular monolith | Low deployment and debugging cost; clear boundaries | Requires discipline | high | high | ADOPT |
| Ports & Adapters | Replaces CloudBase/Hunyuan without domain rewrite | More explicit interfaces | high | high | ADOPT |
| Microservices now | Independent deployment/scaling | Network, ops, data and team overhead | low | conditional | DEFER |
| Big-bang rewrite | Clean theoretical end state | High regression and delivery risk | very low | low | REJECT |
| Branch by Abstraction | Incremental migration with rollback path | Temporary compatibility code | high | high | ADOPT |

AWS guidance explicitly warns that big-bang migration increases transformation risk and recommends incremental extraction with an anti-corruption layer; this supports the current decision. OpenAPI is used for machine-readable HTTP contracts, and C4 is used for handoff communication.

## Engineering principles

- WeChat is a first-class client, not the domain.
- `wx.*`, CloudBase SDK and model SDKs stay outside domain code.
- Scenic facts, characters, visual themes and policies are adapter-owned.
- Existing ticketing, hotel, CRM, membership and payment systems are not rebuilt.
- Secrets remain server-side; buyer controls environment and data retention.

## Sources

- AWS Strangler Fig: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html
- OpenAPI 3.1.1: https://spec.openapis.org/oas/v3.1.1.html
- C4 Model: https://c4model.com/
- Tencent CloudBase overview: https://cloud.tencent.com/document/product/876/18431
- Tencent Cloud API key security: https://cloud.tencent.com/document/product/664/132236
