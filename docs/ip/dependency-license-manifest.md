# Dependency License Manifest

This repository has no `package.json` or lockfile at the project root, so no npm dependency license set can be asserted from package metadata. Runtime/provider dependencies are therefore treated as `MANUAL_REVIEW_REQUIRED` until a build manifest is supplied.

| dependency class | current status | delivery rule |
| --- | --- | --- |
| npm packages | no root manifest found | do not claim zero dependencies; record build-time packages separately |
| WeChat runtime | platform-provided | verify platform terms for commercial delivery |
| CloudBase | buyer/environment adapter | retain provider terms and account ownership in contract |
| Hunyuan | provider adapter | record account, API terms and generated-asset terms before production |

`UNKNOWN_LICENSE = NOT_YET_CLOSED`.
