# Current Dependency Map

## Baseline

This is an incremental audit, not a claim that the legacy client is already fully separated.

| Area | Current observation | Classification | Handoff risk |
| --- | --- | --- | --- |
| pages → wx | 35 direct matches in page JS scan | ACCEPTABLE_LEGACY | medium |
| pages → cloud/provider | direct calls remain in legacy flows | HIGH_COUPLING | high |
| pages → storage | local state is used directly by some pages | ACCEPTABLE_LEGACY | medium |
| core → scenic strings | new Core gate reports zero region-specific strings | GOOD_BOUNDARY | low |
| scenic adapter | configuration-first Shapotou adapter exists | GOOD_BOUNDARY | low |
| provider replacement | contracts exist; full runtime migration pending | BUYER_LOCK_IN risk reduced, not eliminated | medium |
| page → business rules | legacy pages still contain orchestration | HANDOFF_RISK | high |

## Target call chain

`PAGE → APPLICATION SERVICE → DOMAIN → PORT → ADAPTER`

Migration rule: add a facade, migrate one use case, run page/trip/grounding/navigation tests, then remove legacy coupling only after evidence.
