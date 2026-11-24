const fs=require('fs')
const path=require('path')
const childProcess=require('child_process')
const root=path.resolve(__dirname,'..')
const read=file=>fs.readFileSync(path.join(root,file),'utf8')
const app=JSON.parse(read('app.json'))
const project=JSON.parse(read('project.config.json'))
const cloud=require(path.join(root,'config/cloud'))
const readiness=require(path.join(root,'config/release-readiness'))
const buildModes=require(path.join(root,'config/build-modes'))
const trip=read('pages/trip/index.js')
const appSource=read('app.js')
const buildMatch=appSource.match(/buildId:\s*['"]([^'"]+)['"]/) 
const releaseBuildId=buildMatch&&buildMatch[1]||''
const ignored=(project.packOptions&&project.packOptions.ignore||[]).map(x=>x.value)
const releaseDocs=['docs/release-manifest.md','docs/wechat-production-release-audit.md','docs/privacy-api-map.md','docs/device-test-card.md','docs/cloud-function-release-matrix.md','docs/wechat-review-notes.md']
const assetGate=childProcess.spawnSync(process.execPath,[path.join(root,'scripts/asset-license-gate.js')],{cwd:root,encoding:'utf8'})
const checks={
  BUILD_MODE_PROFILES:Object.keys(buildModes).join(',')==='development,demo,review,production'&&buildModes.production.SYNTHETIC_BUYER_DATA===false,
  APPID_MATCH:/^wx[0-9a-z]+$/i.test(project.appid||''),
  LAZY_CODE_LOADING_RELEASE_DECISION:!app.lazyCodeLoading,
  CLOUD_PRODUCTION_MODE:cloud.AI_MODE!=='local'&&cloud.imageMode==='HUNYUAN_MODE'&&cloud.envId==='cloudbase-d6g1u2dzk45c62fc1',
  PACKAGE_EXCLUDES_DOCS_AND_SCRIPTS:ignored.includes('docs')&&ignored.includes('scripts'),
  PRODUCTION_LOG_PRIVACY:!trip.includes('conversation_history=')&&!trip.includes('final_text_preview=')&&!trip.includes('dataPrompt:String(this.data.prompt'),
  BUILD_ID:/^20\d{6}-[a-z0-9-]+$/i.test(releaseBuildId)&&!/(^|-)(dev|test|debug)(-|$)/i.test(releaseBuildId),
  RELEASE_EVIDENCE_DOCUMENTS:releaseDocs.every(file=>fs.existsSync(path.join(root,file))),
  ACTIVE_ASSET_RIGHTS:assetGate.status===0,
  AI_IMPLICIT_METADATA_LABEL:readiness.aiImplicitMetadataLabelVerified===true,
  DISTRIBUTED_RATE_LIMIT_AND_IDEMPOTENCY:readiness.distributedRateLimitAndIdempotencyVerified===true,
  CONTENT_MODERATION_AND_COMPLAINT_LOOP:readiness.contentModerationAndComplaintLoopVerified===true,
  WECHAT_PLATFORM_CONFIGURATION:readiness.wechatPlatformConfigurationVerified===true,
  REAL_DEVICE_REGRESSION:readiness.realDeviceRegressionVerified===true,
  PRODUCTION_LOAD_TEST:readiness.productionLoadTestVerified===true
}
const failed=Object.entries(checks).filter(([,value])=>value!==true)
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',RELEASE_BUILD_ID:releaseBuildId,checks,failed:failed.map(([name])=>name),platformRequired:['ACCOUNT_CERTIFICATION','FILING','SERVICE_CATEGORY','PRIVACY_GUIDE','UPLOAD','TRIAL','REVIEW','OFFICIAL_RELEASE']},null,2))
if(failed.length)process.exitCode=1
