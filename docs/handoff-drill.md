# Handoff Drill

This drill is a readiness checklist, not evidence of a completed third-party handoff.

| Scenario | Target path | Current status |
| --- | --- | --- |
| Run the project | README + existing WeChat client | SUPPORTED / HUMAN CHECK REQUIRED |
| Find Shapotou configuration | `adapters/shapotou/` | SUPPORTED |
| Disable AI Create | capability flag | CONFIG ONLY |
| Replace text provider | `ports/` + provider adapter | ADAPTER REQUIRED |
| Add mock scenic | scenic adapter contract | SUPPORTED BY CONTRACT |
| Run tests | scripts and gates | SUPPORTED |
| Export handoff bundle | release checklist | DOCUMENTATION REQUIRED |

## Human handoff gate

`HUMAN_HANDOFF_TEST_REQUIRED = YES`

A second engineer must perform this drill without author assistance before the product can be called handoff-ready.
