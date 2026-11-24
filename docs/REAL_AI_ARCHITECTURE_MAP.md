# Real AI Architecture Map

## Scope

This map follows the actual Mini Program entry files, not a demo-only path.

## Visitor AI entry points

| Entry | Actual action | AI pipeline status |
|---|---|---|
| `pages/trip/index.js` `generate()` | Main text input, guide prompt, quick task | Unified through `aiOrchestrator.respond()` or its pipeline wrapper |
| `pages/trip/index.js` `adjust()` | Existing-plan adjustment | Unified through `aiOrchestrator.adjust()` with session/history/context |
| `pages/ip/index.js` `askPet()` | Navigation only | Passes prompt to Trip page; does not call AI or planner |
| `pages/photo/index.js` | Vision result explanation | Local Vision knowledge explanation; not a tourist text-AI request and left unchanged |

## Runtime flow

```text
USER INPUT
  pages/trip/index.js · generate()
  ↓
conversation-manager.getSession()
  - active session key: hly_ai-conversation-session-active
  - per-session key: hly_ai-conversation-session-{sessionId}
  ↓
tourist-context-memory.load() + ingest()
  ↓
responseModeRouter()                 ← intent
  ↓
responseBehaviorRouter()             ← response_behavior
  ↓
ask-pet-ai.agentFor()                ← selected existing agent
  ↓
cloud-ai.askPet()                    ← SYSTEM + HISTORY + USER message assembly
  ↓
Cloud AI model.generateText()
  ↓
knowledgeIds validation + realtime guard / local knowledge fallback
  ↓
response-formatter.cleanAnswer()     ← removes mechanical service phrases
  ↓
pages/trip/index.js
  - kind=text → petAnswer
  - kind=plan → plan card
```

## Decision ownership

| Question | Owner | Result |
|---|---|---|
| Where does input enter? | `pages/trip/index.js` `generate()` | Starts a single pipeline request |
| Where is intent decided? | `utils/response-mode-router.js` | `GENERAL_DISCOVERY`, `FOOD_RECOMMENDATION`, `ATTRACTION_QA`, `TRIP_PLANNING`, `ADJUST_TRIP` |
| Where is behavior decided? | `utils/response-behavior-router.js` | `DIRECT_ANSWER`, `FOOD_GUIDE`, `STORY_EXPLANATION`, `TRIP_PLAN`, `ADJUST_TRIP` |
| Where is agent selected? | `utils/ask-pet-ai.js` `agentFor()` | rock-goat, sand-fox, camel only for trip/adjust |
| Where is prompt assembled? | `utils/cloud-ai.js` `askPet()` | Three messages: SYSTEM, HISTORY, USER |
| Where is Cloud AI called? | `utils/cloud-ai.js` `model.generateText()` | Existing Cloud AI provider/model |
| Where is evidence enforced? | `utils/ask-pet-ai.js` | Validates knowledge IDs and realtime claims; uses knowledge-only fallback |
| Where is final text formatted? | `utils/response-formatter.js` | Cleans mechanical phrases and returns response mode |

## Planner access rule

`utils/trip-agent.js` is reachable only from `utils/ai-orchestrator.js`:

- `TRIP_PLANNING` → `plan()` → `tripAgent.planTrip()`.
- `ADJUST_TRIP` with an existing plan → `adjust()` → `tripAgent.adjustTrip()`.

No visitor AI request in `pages/trip/index.js` directly imports or invokes a planner.

## Debug trace

Each orchestrated request emits:

```text
[AI_PIPELINE_TRACE] {
  sessionId, input, history, intent, behavior,
  selected_agent, prompt_type, messages_count,
  model, final_response_type
}
```

Session creation and reuse emit:

```text
[SESSION] old=<sessionId|none> new=<sessionId>
```
