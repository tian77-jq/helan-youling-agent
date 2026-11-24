const defaults={primary:'cloudbase',secondary:'coding-plan',active:'cloudbase',fallbackMode:'manual',autoFailover:false}
function routing(c){const r=Object.assign({},defaults,c&&c.textModelRouting);if(!['cloudbase','coding-plan'].includes(r.active))r.active=r.primary;if(!['manual','quota-only','automatic'].includes(r.fallbackMode))r.fallbackMode='manual';r.autoFailover=r.fallbackMode==='automatic';return r}
function active(c){return routing(c).active}
function providerState(c){const r=routing(c);return {primary:r.primary,secondary:r.secondary,active:r.active,fallbackMode:r.fallbackMode,autoFailover:r.autoFailover}}
function isQuotaFailure(e){return /QUOTA_EXCEEDED|RATE_LIMIT_EXCEEDED|PROVIDER_DISABLED|CODING_PLAN_RATE_LIMITED/i.test(String(e&&((e.code||'')+' '+(e.message||''))||''))}
function canFailover(c,e){return routing(c).fallbackMode==='quota-only'&&isQuotaFailure(e)}
module.exports={routing,active,providerState,isQuotaFailure,canFailover}
