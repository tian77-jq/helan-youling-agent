const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const required=[
  'docs/visual-audit/current-visual-problems.md',
  'docs/visual-audit/visual-audit-checklist.md',
  'docs/visual-audit/before/README.md',
  'docs/visual-audit/after-pass1/README.md'
]
const missing=required.filter(file=>!fs.existsSync(path.join(root,file)))
const problemText=fs.readFileSync(path.join(root,'docs/visual-audit/current-visual-problems.md'),'utf8')
const problems=(problemText.match(/^\d+\. /gm)||[]).length
const failureSection=problemText.split('## 反向失败原因（20 项）')[1]||''
const failures=(failureSection.match(/^\d+\. /gm)||[]).length
const wxml=fs.readFileSync(path.join(root,'pages/index/index.wxml'),'utf8')
const js=fs.readFileSync(path.join(root,'pages/index/index.js'),'utf8')
const checks={
  requiredDocs:missing.length===0,
  visualProblemsAtLeast30:problems>=30,
  reverseFailuresAtLeast20:failures>=20,
  homePrimaryCta:wxml.includes('home-primary-cta')&&js.includes('startTrip'),
  humanScreenshotRequired:problemText.includes('HUMAN_SCREENSHOT_REQUIRED=YES')
}
console.log('[VISUAL_AUDIT_GATE]',JSON.stringify({checks,missing,problems,failures}))
if(Object.values(checks).some(value=>!value))process.exit(1)
