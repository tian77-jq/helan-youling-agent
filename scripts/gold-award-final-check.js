const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const errors=[];const warnings=[]
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const exists=p=>fs.existsSync(path.join(root,p))
const required=[
  'pages/index/index.js','pages/index/index.wxml','pages/index/index.wxss',
  'pages/ai-trip/index.js','pages/ai-create/index.js',
  'services/image-service.js','utils/ai-orchestrator.js','utils/conversation-gateway.js',
  'data/scenic.json','data/food.json','data/culture.json','data/ip.json',
  'providers/hunyuan-image-provider.js',
  'competition/CORE_MESSAGE.md','competition/golden-demo/GOLDEN_DEMO_SCRIPT.md',
  'TECHNICAL_WHITEPAPER.md','DESIGN_SYSTEM.md','SCALING_STRATEGY.md',
  'operation-metrics/METRICS_SYSTEM.md','HUNYUAN_PRODUCTION_READY.md',
  'competition-defense-final/FINAL_DEFENSE_QA.md'
]
for(const file of required)if(!exists(file))errors.push(`缺少关键资产：${file}`)
const app=JSON.parse(read('app.json'))
for(const page of app.pages||[])for(const ext of ['.js','.wxml','.wxss'])if(!exists(page+ext))errors.push(`主包页面缺少：${page+ext}`)
for(const item of (app.tabBar&&app.tabBar.list)||[])if(!(app.pages||[]).includes(item.pagePath))errors.push(`tabBar 不在 pages：${item.pagePath}`)
for(const sub of app.subPackages||[])for(const page of sub.pages||[])for(const ext of ['.js','.wxml','.wxss'])if(!exists(`${sub.root}/${page}${ext}`))errors.push(`分包页面缺少：${sub.root}/${page}${ext}`)
const qa=read('competition-defense-final/FINAL_DEFENSE_QA.md');const questionCount=(qa.match(/^\s*\d+[\.、]/gm)||[]).length
if(questionCount<100)errors.push(`终版答辩问答仅 ${questionCount} 问，要求至少 100 问`)
const media=[];function walk(dir){if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name.startsWith('backup_before_'))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(png|jpe?g|gif|webp|mp3|aac|m4a|wav)$/i.test(e.name))media.push({file:path.relative(root,p),bytes:fs.statSync(p).size})}}walk(root)
const over=media.filter(x=>x.bytes>200*1024);if(over.length)errors.push(`媒体超过 200 KB：${over.map(x=>x.file).join(', ')}`)
const build=(read('app.js').match(/buildId:\s*'([^']+)'/)||[])[1]||'unknown'
const report=['# GOLD AWARD FINAL REPORT','',`生成时间：${new Date().toISOString()}`,`构建标识：${build}`,'',`状态：${errors.length?'FAIL':'PASS'}`,'','## 终局验收','',`- 产品闭环：${exists('competition/golden-demo/GOLDEN_DEMO_SCRIPT.md')?'已具备演示脚本':'缺失'}`,`- 技术白皮书：${exists('TECHNICAL_WHITEPAPER.md')?'已具备':'缺失'}`,`- 答辩问答：${questionCount} 问（目标 100）`,`- 媒体超过 200 KB：${over.length} 个`,`- 真机验证：需在微信开发者工具与真实手机完成，脚本不伪造结果`,'','## 错误',...(errors.length?errors.map(x=>`- ${x}`):['- 无']),'','## 待外部验证', '- Android/iOS 真机扫码与页面链路', '- 真实用户测试与景区合作证据', '- 腾讯混元云函数生产凭证与配额'].join('\n')+'\n'
fs.mkdirSync(path.join(root,'docs'),{recursive:true});fs.writeFileSync(path.join(root,'docs','GOLD_AWARD_FINAL_REPORT.md'),report)
console.log(JSON.stringify({status:errors.length?'FAIL':'PASS',build,questionCount,mediaOver200K:over.length,errors,report:'docs/GOLD_AWARD_FINAL_REPORT.md'},null,2));if(errors.length)process.exitCode=1
