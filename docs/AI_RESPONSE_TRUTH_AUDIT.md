# PHASE24 — AI Response Root Cause Forensic Debug

## AI_RESPONSE_ROOT_CAUSE

`CLOUD_TEXT_OUTPUT_WAS_NOT_FORMAT_GATED; PLAN_RENDERER_REQUIRED_KIND_PLAN`

## Why the previous optimization did not fully work

The prior work correctly improved intent routing and agent selection, but it relied on the Cloud prompt to obey the selected response behavior. The Evidence Gate validated `knowledgeIds` and realtime claims only. It did **not** validate whether Cloud AI had inserted a route template into the `answer` text.

That allowed this failure mode:

```text
FOOD_RECOMMENDATION → FOOD_GUIDE → Cloud AI
  ↓
Cloud answer still contains “第一天 / 第二天 / 景点推荐”
  ↓
knowledgeIds are valid, so the answer is accepted
  ↓
Trip page renders the accepted text unchanged
```

Therefore prompt-only changes could improve probability but could not guarantee the final response shape.

## Final real click chain

```text
pages/trip/index.js
  button bindtap="generate"
  ↓
generate(promptOverride)
  ↓
aiOrchestrator.respond(prompt, locale, currentPlan, conversationState)
  ↓
conversation-manager.getSession()
  ↓
tourist-context-memory.load() / ingest()
  ↓
responseModeRouter()                  ← intent
  ↓
responseBehaviorRouter()              ← behavior
  ↓
ask-pet-ai.agentFor()                 ← agent
  ↓
cloud-ai.askPet()                     ← SYSTEM + HISTORY + USER
  ↓
knowledge/evidence and output-format gate
  ↓
response-formatter.format()
  ↓
pages/trip/index.js text renderer or authorized plan renderer
```

The concrete logs are:

```text
[FINAL_AI_CHAIN]
input=...
entry=pages/trip/index.js
mode=...
function=generate
orchestrator=respond
agent=...
prompt=...
formatter=...
renderer=...

[FINAL_RESPONSE_TRACE]
input=...
intent=...
behavior=...
agent=...
prompt_type=...
formatter=...
image_renderer=...
final_type=...
```

## Route and image template sources

| File | Function / branch | Trigger |
|---|---|---|
| `pages/trip/index.wxml` | `result-area`, `day-block`, `timeline-item`, `itinerary-card` | Only `hasPlan && !loading` |
| `utils/trip-agent.js` | `planTrip()` | `TRIP_PLANNING` only |
| `utils/trip-agent.js` | `adjustTrip()` | `ADJUST_TRIP` with existing plan only |
| `utils/response-formatter.js` | `timeline_route_card` | `TRIP_OUTPUT` only |
| `pages/trip/index.js` | `authorizedPlan` renderer gate | Requires `kind=plan` and intent `TRIP_PLANNING` or `ADJUST_TRIP` |

The only dynamic route image renderer in the Trip page is `planItem.image`, nested under `hasPlan`. The normal `petAnswer` card has no image list or scenic carousel renderer. It renders only `petAnswer.answer`.

Consequently, if a current WeChat runtime still shows the route timeline and images for a food/culture question, Console must show either:

1. `kind=plan` with an unauthorized intent, which the new renderer gate logs and blocks; or
2. no new `[FINAL_AI_CHAIN]` trace, which means the device/Developer Tools is running an old compiled bundle rather than this source tree.

## Cloud prompt audit

`utils/cloud-ai.js` sends the final system message in `[FINAL_AI_CHAIN] prompt=...` and now states:

```text
你是宁夏AI旅行伙伴。
首要任务是回答用户当前问题。
用户问美食只回答美食；问文化只回答文化；问景点介绍价值。
只有明确要求安排行程时才生成路线。
```

It contains no `旅游规划助手`、`第一天`、`第二天`、`第三天`、`景点推荐` or `推荐图片` template wording. Behavior-specific constraints explicitly prohibit day plans and routes for `FOOD_GUIDE`, `STORY_EXPLANATION`, and `DIRECT_ANSWER`.

## Final output isolation

`utils/response-formatter.js` now declares these output classes:

| Behavior | Output type | Formatter | Image renderer |
|---|---|---|---|
| FOOD_GUIDE | `FOOD_OUTPUT` | `food_knowledge_text` | `food_knowledge_image` metadata only |
| STORY_EXPLANATION | `CULTURE_OUTPUT` | `culture_knowledge_text` | `culture_knowledge_image` metadata only |
| DIRECT_ANSWER | `GENERAL_OUTPUT` | `discovery_text` | none |
| TRIP_PLAN / ADJUST_TRIP | `TRIP_OUTPUT` | `timeline_route_card` | `trip_route_images` |

For every non-Trip response, the format gate detects `第一天/第二天/第三天`、Day 1、路线、行程卡片、时间轴、景区推荐、图片推荐 and similar template language. A detected violation rejects the Cloud text and returns the matching local knowledge answer instead.

## Image recommendation finding

No ordinary question answer in `pages/trip/index.wxml` can render a scenic-image carousel. Existing scenic images are:

- Trip route item images: allowed only for authorized `TRIP_OUTPUT`.
- Starter guide topic images: displayed before an answer, not generated as a response.
- Home and Discover page scenic media: unrelated to Trip answer rendering.

Food and culture image renderer values are output metadata for future consumers; no UI was added or modified to display them.

## Regression

Command:

```text
node scripts/ai-full-regression-test.js
```

Result:

```text
51 total
51 completed
0 failed
status=READY_FOR_HUMAN_TEST
```

The suite covers the requested food, culture, attraction and trip questions, three-turn memory, new-session isolation, and asserts that non-Trip results are text-only, never select `camel`, and do not contain a trip-template marker.

## Required human verification

The current environment cannot operate the WeChat Developer Tools session. Recompile the current project in Developer Tools, clear its local cache, then test:

1. `宁夏有什么特色美食？` → `FOOD_GUIDE`, `FOOD_OUTPUT`, text renderer.
2. `贺兰山岩画有什么值得了解？` → `STORY_EXPLANATION`, `CULTURE_OUTPUT`, text renderer.
3. `西夏陵值得去吗？` → `ATTRACTION_QA`, `CULTURE_OUTPUT`, text renderer.
4. `两天怎么玩？` → `TRIP_PLAN`, `TRIP_OUTPUT`, trip route renderer.

If any of the first three renders a timeline, capture the matching `[FINAL_AI_CHAIN]` and `[FINAL_RESPONSE_TRACE]` records. They distinguish an active unauthorized `kind=plan` path from an old bundle immediately.
