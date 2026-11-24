# Integration Contract

The engine is an experience layer. It does not replace ticketing, hotel booking, CRM, membership, OTA distribution, payment, or the buyer's operational dashboard.

## External hooks

| Hook | Direction | Minimum payload | Runtime rule |
| --- | --- | --- | --- |
| ticketing | inbound/read | product id, availability token | never invent price or stock |
| hotel | inbound/read | property/product reference | buyer owns booking truth |
| membership | outbound/event | consented memory/share event | no raw conversation by default |
| realtime | inbound/read | freshness, source, scope | show official verification notice |
| content | inbound/read | evidence id, locale, version | evidence gate before answer |

## Deployment assumptions

- Secrets remain server-side.
- Provider implementations are replaceable.
- Buyer controls official data freshness and retention policy.
- Every external fact carries source and freshness metadata.
- Failure falls back to a safe clarification or non-specific cultural response.
