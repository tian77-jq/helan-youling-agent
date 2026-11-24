# Context Priority Audit

## Status

`READY_FOR_HUMAN_TEST` — source-level and local end-to-end checks are complete. WeChat Developer Tools / real Cloud AI verification has not been run in this workspace.

## Finding

There was a real history-contamination risk. The orchestrator classified the current input, but passed up to eight raw history messages to Cloud AI without a machine-readable statement that the current intent must override the historical intent. A prior trip-planning turn could therefore bias the model toward continuing an itinerary when the current request was about food or culture.

During the follow-up runtime audit, a second real inconsistency was found in `pages/trip/index.js`: the `guide` composer used `askPetThroughPipeline`, while the normal composer used `respond`. The guide branch did not write the returned conversation state back to the page. The composer now has one entry only: `aiOrchestrator.respond(...)`, regardless of UI mode. This preserves the session, applies the same router and formatter gates, and makes the final renderer decision from the same routed result.

## Applied priority rule

`current_intent` is calculated from the current input before the model call. The latest user history intent is retained only for comparison.

- When `current_intent !== history_intent`, the final instruction explicitly requires the model to answer the current intent and forbids carrying over route, itinerary, or response mode from history.
- History sent to Cloud AI is capped at the most recent three turns (six messages).
- Earlier user turns become a short background summary labelled as non-authoritative; it may inform traveller preferences only.
- The same bounded-history rule applies to the route-adjustment Cloud request.

## Runtime trace

Both ordinary answers and adjustment requests emit:

```text
[CONTEXT_PRIORITY_TRACE]
current_input=
history_count=
history_summary=
current_intent=
history_intent=
final_instruction=
```

The full Cloud `messages` payload continues to be printed as `[REAL_CLOUD_MESSAGES]`. Its system message now contains the current-vs-history priority rule, and its history message is split into `HISTORY SUMMARY` and `RECENT HISTORY`.

## Continuity handling

A terse culture follow-up such as `注意事项？` now resolves the preceding `ATTRACTION_QA` topic only. It becomes a culture question about that topic; it does not inherit a trip-planning mode.

## Local end-to-end regression

Command: `node scripts/context-priority-test.js`

| Case | Result |
| --- | --- |
| 第一次来宁夏 → 带父母 → 少走路 | `ADJUST_TRIP`; returned a relaxed, elderly-friendly plan |
| 两天怎么玩？ → 宁夏有什么特色美食？ | `FOOD_RECOMMENDATION` / `FOOD_GUIDE`; final text, no route template |
| 贺兰山岩画值得去吗？ → 注意事项？ | `ATTRACTION_QA` / `STORY_EXPLANATION`; retained the rock-art topic |
| Five-turn history window | 5 stored turns, 6 recent messages, older turns condensed to one summary |

The pre-existing real-response quality regression was also rerun and remained `READY_FOR_HUMAN_TEST`.

## Modified files

- `utils/conversation-manager.js` — added bounded context construction and older-history summary.
- `utils/ai-orchestrator.js` — added intent override decision, context trace, bounded message handoff, and culture follow-up resolution.
- `utils/cloud-ai.js` — added priority instructions, bounded history messages, and Cloud-side priority traces.
- `scripts/context-priority-test.js` — local final-output regression for the three required cases.

## Remaining human check

The source now guards against historical mode contamination. The remaining risk is model compliance at the real Cloud AI endpoint, so run the three cases in WeChat Developer Tools and inspect `[CONTEXT_PRIORITY_TRACE]` plus `[REAL_CLOUD_MESSAGES]` before declaring production readiness.

The trip page logs `[AI_RUNTIME_BUILD] phase26-unified-entry-20260822` on load. If that line does not appear in the WeChat Console, the test is running an older cached/compiled project or a different project directory, rather than this workspace.
