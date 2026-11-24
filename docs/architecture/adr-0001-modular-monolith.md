# ADR-0001: Modular Monolith First

## Decision

Use a modular monolith with Ports & Adapters and Branch by Abstraction. Keep the WeChat client stable while extracting use cases behind public facades.

## Rejected now

Microservices, Kubernetes, Docker-everywhere and a big-bang rewrite are deferred because the current product does not yet have independent team ownership, scaling or release requirements that justify the operational cost.

## Consequence

The system can later extract a bounded module without changing page callers, but temporary compatibility layers and explicit contract tests are required.
