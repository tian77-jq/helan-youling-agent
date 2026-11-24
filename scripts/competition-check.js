const fs=require('fs'),path=require('path'),child=require('child_process')
const root=path.resolve(__dirname,'..'),errors=[],checks=[]
const ok=(name,value,detail)=>{checks.push({name,status:value?'PASS':'FAIL',detail});if(!value)errors.push(`${name}: ${detail}`)}
const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
ok('核心路由',app.pages.includes('pages/index/index')&&app.pages.includes('pages/ai-trip/index')&&app.pages.includes('pages/ai-create/index'),'首页、AI灵游、AI灵境已注册')
ok('TabBar',app.tabBar.list.every(x=>app.pages.includes(x.pagePath)),'TabBar 路径完整')
for(const f of ['docs/COMPETITION_POSITIONING.md','competition-demo/README.md','BUSINESS_MODEL.md','DATA_METRICS_DESIGN.md','data/ip.json'])ok(`国赛资产 ${f}`,fs.existsSync(path.join(root,f)),'文件存在')
const ip=JSON.parse(fs.readFileSync(path.join(root,'data/ip.json'),'utf8'));ok('三萌宠 IP',ip.length===3&&ip.every(x=>x.cultureMeaning&&x.scene.length),'岩羊/骆驼/沙狐字段完整')
let health={};try{health=JSON.parse(child.execFileSync(process.execPath,[path.join(__dirname,'v2-health-check.js')],{cwd:root,encoding:'utf8'}))}catch(e){errors.push('V2 health failed: '+e.message)}
ok('工程健康',health.status==='PASS','V2 health PASS')
let product={};try{product=JSON.parse(child.execFileSync(process.execPath,[path.join(__dirname,'product-test.js')],{cwd:root,encoding:'utf8'}))}catch(e){errors.push('Product test failed: '+e.message)}
ok('产品闭环',product.status==='PASS','product test PASS')
const report=['# COMPETITION READY REPORT','',`生成时间：${new Date().toISOString()}`,`状态：${errors.length?'FAIL':'PASS'}`,`BUILD：20260823-v2-phase8-real-validation`,`主包估算：${health.mainBytes||'unknown'} 字节`,'','## Checks',...checks.map(x=>`- ${x.status} ${x.name}：${x.detail}`),'','## Demo','AI灵游 → AI灵境 → 数字纪念作品 → IP商品/商城 → 景区合作','',`错误数：${errors.length}`,...(errors.length?errors.map(x=>`- ${x}`):['- 无'])].join('\n')
fs.writeFileSync(path.join(root,'docs','COMPETITION_READY_REPORT.md'),report+'\n');console.log(JSON.stringify({status:errors.length?'FAIL':'PASS',checks,errors,report:'docs/COMPETITION_READY_REPORT.md'},null,2));if(errors.length)process.exitCode=1
