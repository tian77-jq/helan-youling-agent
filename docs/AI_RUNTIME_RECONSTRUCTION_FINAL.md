# AI Runtime Reconstruction — Final Audit

## Status

`READY_FOR_WECHAT_HUMAN_TEST`

The app source, homepage handoff, trip-page state updates, intent routing, response quality gate, context continuity, and renderer isolation have been verified locally. Real WeChat Cloud AI and device behavior still require a Developer Tools/device run.

## Root causes found

1. The trip composer had two runtime branches. Guide mode used `askPetThroughPipeline`, while plan mode used `respond`; guide mode did not write the returned conversation state back to the page.
2. The UI mode (`guide` or `plan`) influenced the function called, even though it should only affect page copy. It no longer controls response type.
3. Cloud-success text passed through a `polish` function that only removed a few opening phrases. It did not apply the selected tourist personality, so flat model output remained flat.
4. Generic context fallbacks could turn an unclear current message into trip planning simply because older tourist context existed.
5. The planner used one generic summary and one generic attraction reason, which made legitimate plans look fixed even when their constraints differed.
6. The homepage Vision entry displayed a fixed unavailable modal instead of opening the existing recognition page.
7. Real image recognition is not configured: `featureVisionEnabled=false`, and `cloudfunctions/visionRecognize/index.js` always returns `VISION_PROVIDER_NOT_CONFIGURED`. No provider endpoint or credentials exist in this workspace.
8. A newly opened trip page could silently reuse `hly_currentQuery` and auto-submit the previous question. The fallback was removed; only a current navigation request or explicit page parameter can auto-start a conversation.

## Final runtime rules

- `FOOD_RECOMMENDATION` → text answer, `FOOD_GUIDE`, no trip renderer.
- `ATTRACTION_QA` → culture/value explanation, no trip renderer.
- `GENERAL_DISCOVERY` → exploratory text, no itinerary or scenic carousel.
- `TRIP_PLANNING` → trip cards only when the current input contains explicit planning language or a complete set of travel constraints.
- `ADJUST_TRIP` → modifies an existing plan, or uses a terse preference follow-up only when prior tourist context makes that follow-up meaningful.
- Current intent overrides history intent. Cloud receives the latest three turns plus a non-authoritative older-history summary.

## Final output quality gate

Cloud text is rejected when it contains customer-service prompts, route language in a non-trip answer, trip-day templates, is unusably short, or lacks a knowledge anchor for food/culture. Rejected text is replaced with a grounded natural-language answer. Accepted text is given the configured 岩羊 / 沙狐 / 灵灵 voice before rendering.

## Page-level runtime results

`node scripts/home-ai-runtime-test.js`

| Homepage entry | Input | Final page state |
| --- | --- | --- |
| 让灵灵规划 | 宁夏有什么特色美食？ | text / `FOOD_RECOMMENDATION` |
| 问萌宠 | 贺兰山岩画有什么值得了解？ | text / `ATTRACTION_QA` |
| 让灵灵规划 | 宁夏有什么好玩的？ | text / `GENERAL_DISCOVERY` |
| 让灵灵规划 | 明天带父母银川一天，不想走太多路 | plan / `TRIP_PLANNING` |

## Regression results

- Full AI regression: 51 / 51.
- Tourist personality corpus: 20 / 20; mechanical response rate 0 in the local pipeline.
- Context-priority cases: 3 / 3 plus bounded-history check.
- Cloud-response quality-gate cases: 2 / 2.
- Core static regression gate: all checks satisfied.

## WeChat verification markers

The expected Console markers are:

```text
[BUILD] 20260822-ai-runtime-unified-02
[AI_RUNTIME_BUILD] phase26-runtime-reconstruction-final-20260822
[FINAL_AI_CHAIN]
[CONTEXT_PRIORITY_TRACE]
[FINAL_RESPONSE_QUALITY_GATE]
[USER_VISIBLE_RESPONSE_TRACE]
```

If the first two markers are absent, WeChat Developer Tools is running another project directory or an old compiled/cache version.

## Developer Tools compile evidence

The running `wxfilewatcher_x64.exe` process points to `D:\贺兰有灵小程序`. The active WeChat Developer Tools compile cache contains the new runtime strings, including `broad_discovery_signal`, `FINAL_RESPONSE_QUALITY_GATE`, the personalized trip summary, and both build markers. The final page and app build markers were compiled at `2026-08-22 17:21:10` and `17:21:13`. This confirms the current workspace was read by the real WeChat compiler; it is not only a Node test result.

## Vision truth

The existing recognition page is now reachable from the homepage. Actual image recognition is still externally blocked until a real Vision Provider is configured and the `visionRecognize` cloud function is deployed. This audit does not label that capability as working.

## Final content-layer hardening (2026-08-22)

The remaining mechanical behavior was not another intent-router failure. `GENERAL_DISCOVERY` had already been classified correctly, but its knowledge retrieval still supplied the same broad, fixed list for every question. Consequently, a question about nature, photography, parents, or a specific city could receive an answer led by unrelated history items. The fallback writer also used fixed lead-in phrases, making correctly routed answers still appear templated.

This layer now filters grounded knowledge by the current input before writing: city (`银川 / 中卫 / 吴忠 / 石嘴山`), theme (`自然 / 历史文化`), companion (`亲子 / 父母老人`), and scene (`摄影`). Food retrieval separately respects city and food type (`羊肉 / 面食 / 茶饮`). Named attractions and foods still take precedence. The local writer selects wording from the returned category, so a history item is no longer described as a nature stop merely because its tags contain “贺兰山”.

Trip output was also extended from a daytime skeleton to a complete day. A relaxed Yinchuan plan now includes `09:00` core visit, `12:30` meal, `15:30` rest/flexible time, optional `18:30` 览山公园, and `20:00` dinner and return to the accommodation. For parents or low-walking context, the evening stop is explicitly optional and rest takes priority.

Final verification:

- `scripts/ai-full-regression-test.js`: exit 0, `READY_FOR_HUMAN_TEST`.
- `scripts/ai-tourist-personality-test.js`: exit 0, `READY_FOR_HUMAN_TEST`.
- `scripts/context-priority-test.js`: exit 0, `READY_FOR_HUMAN_TEST`.
- `scripts/final-response-quality-gate-test.js`: exit 0, `READY_FOR_HUMAN_TEST`.
- `scripts/home-ai-runtime-test.js`: exit 0, `READY_FOR_WECHAT_HUMAN_TEST`.
- The active WeChat compile cache contains the new strings `岩羊先把宁夏的味道摆上桌`, `览山公园`, and `当天体力优先`, confirming that Developer Tools compiled this content-layer revision.
