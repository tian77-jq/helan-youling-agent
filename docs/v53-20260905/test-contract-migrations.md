# V5.3 test contract migrations

These are documented product-contract migrations, not expected-value edits.

| Legacy test | Old expectation | New rule | Reason | Approval source |
|---|---|---|---|---|
| `knowledge-catalog-ai-regression` food-plan cases | Missing city still produces a route | `TRIP_NEEDS_BASE_CITY` asks for the starting city and preserves the food request | A short regional trip cannot choose a departure city safely; this rule is implemented in `utils/ai-orchestrator.js` | `docs/audit-20260905/final-reality-report.md`, V5.3 instruction §2/§49-53 |
| `scenic-vision-service-test` | Project illustration labeled `官方实景参考` | Project-owned illustration labeled `项目景观示意 · 非实景照片` with `visualMatch: UNRESOLVED` where no verified scene exists | An illustration is not an official documentary scene and must not imply endorsement | `docs/audit-20260905/final-reality-report.md`, V5.3 instruction §49-53 |

The old assertions remain visible in their historical logs; no blanket skip or forced PASS was added.
