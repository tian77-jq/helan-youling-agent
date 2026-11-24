const fs=require('fs'),path=require('path'),child=require('child_process')
const root=path.resolve(__dirname,'..'),errors=[],checks=[]
function ok(name,condition,detail){checks.push({name,status:condition?'PASS':'FAIL',detail});if(!condition)errors.push(`${name}: ${detail}`)}
const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
ok('核心页面',app.pages.includes('pages/index/index')&&app.pages.includes('pages/ai-trip/index')&&app.pages.includes('pages/ai-create/index'),'首页/AI灵游/AI灵境均注册')
ok('TabBar',app.tabBar.list.every(x=>app.pages.includes(x.pagePath)),'TabBar 路径全部存在')
for(const f of ['data/product.json','data/userWorks.json','business/business-model.json','docs/PROJECT_INNOVATION_MAP.md'])ok(`资产 ${f}`,fs.existsSync(path.join(root,f)),'文件存在')
let health={};try{health=JSON.parse(child.execFileSync(process.execPath,[path.join(root,'scripts','v2-health-check.js')],{cwd:root,encoding:'utf8'}))}catch(error){errors.push('v2-health-check 执行失败：'+error.message)}
ok('工程健康',health.status==='PASS','V2 health PASS')
let product={};try{product=JSON.parse(child.execFileSync(process.execPath,[path.join(root,'scripts','product-test.js')],{cwd:root,encoding:'utf8'}))}catch(error){errors.push('product-test 执行失败：'+error.message)}
ok('产品流程',product.status==='PASS','product-test PASS')
const report=['# COMPETITION READY REPORT','',`生成时间：${new Date().toISOString()}`,`状态：${errors.length?'FAIL':'PASS'}`,'',`BUILD：20260823-v2-phase5-competition-ready`,`主包估算：${health.mainBytes||'unknown'} 字节`,`产品测试：${product.status||'unknown'}`,'','## 检查项',...checks.map(x=>`- ${x.status} ${x.name}：${x.detail}`),'','## 竞赛三分钟演示','1. AI灵游：输入“三天宁夏文化旅行”，展示 Day1-Day3 结构化路线与证据。','2. AI灵境：选择贺兰山、西夏文化、岩羊、旅行纪念卡，展示 Prompt。','3. 商业闭环：从数字纪念卡进入商城，展示 IP 商品与景区合作路径。','',`错误数：${errors.length}`,...(errors.length?errors.map(x=>`- ${x}`):['- 无'])].join('\n')
fs.writeFileSync(path.join(root,'docs','COMPETITION_READY_REPORT.md'),report+'\n');console.log(JSON.stringify({status:errors.length?'FAIL':'PASS',checks,errors,report:'docs/COMPETITION_READY_REPORT.md'},null,2));if(errors.length)process.exitCode=1
