# PHASE23 — AI Conversation Engine Full System Audit & Hardening

## AI_CONVERSATION_ENGINE_FINAL_STATUS

`READY_FOR_HUMAN_TEST`

## Real architecture

The complete entry-to-response map is in `docs/REAL_AI_ARCHITECTURE_MAP.md`. The main visitor AI path is now:

```text
USER INPUT → conversation-manager → context-memory → intent-router
→ response-behavior-router → agent selection → prompt builder
→ Cloud AI → evidence gate → response formatter
```

`pages/ip/index.js` only navigates to the Trip page. `pages/photo/index.js` retains its Vision-local explanation path and is not part of text visitor AI; it was not modified.

## Findings and root causes

1. Text fallback previously delegated to `tripAgent.explainKnowledge()`, so a Cloud failure could turn food/culture/general queries into the travel-officer voice.
2. The fallback route previously defaulted to the camel agent when the keyword router was uncertain.
3. The adjustment matcher treated first-turn phrases such as “适合亲子” and “适合老人” as an adjustment, allowing ordinary discovery questions to become plans.
4. A one-key session store made the active conversation opaque and did not preserve separate session records for restoration.
5. Specific named entities could lose to a broad knowledge query during fallback, producing an answer about the first available item rather than the item asked about.

## Hardening changes

- All Trip page AI requests now enter `ai-orchestrator`; there is no direct Trip-page planner call.
- Agent permissions are strict:

| Intent | Behavior | Allowed response |
|---|---|---|
| GENERAL_DISCOVERY | DIRECT_ANSWER | Discovery text only; never Trip Agent |
| FOOD_RECOMMENDATION | FOOD_GUIDE | Food knowledge text only; never route |
| ATTRACTION_QA | STORY_EXPLANATION | Cultural explanation only; never route |
| TRIP_PLANNING | TRIP_PLAN | Only path allowed to call `tripAgent.planTrip()` |
| ADJUST_TRIP | ADJUST_TRIP | Only with an existing plan can call `tripAgent.adjustTrip()` |

- Named knowledge matches now take precedence over broad knowledge lists.
- Food local fallback returns multiple Ningxia foods, including hand-grabbed lamb and eight-treasure tea, rather than a route template.
- Formatter removes fixed service phrases from text responses.
- A first-turn “适合亲子/老人去哪里” is discovery, not an adjustment. Context-triggered planning requires prior-turn memory.

## Fallback rules

| Behavior | Fallback source | Planner allowed |
|---|---|---|
| DIRECT_ANSWER | Discovery knowledge entries | No |
| FOOD_GUIDE | Food knowledge entries | No |
| STORY_EXPLANATION | Named cultural/attraction entry | No |
| TRIP_PLAN | `tripAgent.planTrip()` | Yes |
| ADJUST_TRIP | `tripAgent.adjustTrip()` and existing plan | Yes |

## Session and context mechanism

- New conversation creates a new ID and a new `hly_ai-conversation-session-{sessionId}` history record.
- Active session is held under `hly_ai-conversation-session-active`.
- Same conversation resolves the same ID and appends user/assistant history.
- `tourist-context-memory` persists data under `hly_tourist-context-{sessionId}`.
- Cloud messages always include `SYSTEM`, `HISTORY`, and current `USER` content. It does not send only the latest phrase after a prior conversation exists.

## Pipeline trace

Every real pipeline request logs:

```text
[AI_PIPELINE_TRACE]
sessionId=...
input=...
history=...
intent=...
behavior=...
selected_agent=...
prompt_type=...
messages_count=3
model=...
final_response_type=...
```

## Regression result

Command: `node scripts/ai-full-regression-test.js`

Result: 51/51 cases completed with `READY_FOR_HUMAN_TEST`.

Coverage includes discovery, food, culture, explicit itineraries, a three-turn profile (`第一次去宁夏 → 带父母 → 少走路`) and a new-session isolation check. Non-trip categories were asserted to remain text responses and never select `camel`.

## Human WeChat verification still required

This environment cannot operate the user’s WeChat Developer Tools session. Before release, run the three real inputs in the Trip page and inspect Console output filtered by `AI_PIPELINE_TRACE`:

1. `宁夏有什么特色美食？` → `FOOD_RECOMMENDATION / FOOD_GUIDE / food_answer / text`.
2. `贺兰山岩画有什么值得了解？` → `ATTRACTION_QA / STORY_EXPLANATION / story_answer / text`.
3. `第一次来宁夏 → 带父母 → 少走路` in one conversation → history retained, then elderly-friendly plan/adjustment only after context is available.
