const fs=require('fs'),path=require('path'),child=require('child_process')
const root=path.resolve(__dirname,'..'),app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
const errors=[],warnings=[]
const exists=p=>fs.existsSync(path.join(root,p))
for(const p of app.pages)for(const ext of ['.js','.wxml','.wxss'])if(!exists(p+ext))errors.push(`页面文件缺失：${p+ext}`)
for(const item of app.tabBar.list||[])if(!app.pages.includes(item.pagePath))errors.push(`TabBar 路由错误：${item.pagePath}`)
for(const sub of app.subPackages||[])for(const p of sub.pages)for(const ext of ['.js','.wxml','.wxss'])if(!exists(`${sub.root}/${p}${ext}`))errors.push(`分包文件缺失：${sub.root}/${p}${ext}`)
const pageFiles=[];function walk(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.js'))pageFiles.push(p)}}walk(path.join(root,'pages'));walk(path.join(root,'feature'))
for(const f of pageFiles){const s=fs.readFileSync(f,'utf8');if(!/service\.js$/.test(f)&&/wx\.cloud\.callFunction\s*\(/.test(s))errors.push(`页面直接调用云函数：${path.relative(root,f)}`);if(/usingComponents/.test(s))warnings.push(`请人工复核组件声明：${path.relative(root,f)}`)}
let health={status:'UNKNOWN'};try{health=JSON.parse(child.execFileSync(process.execPath,[path.join(__dirname,'project-health-check.js')],{cwd:root,encoding:'utf8'}))}catch(error){errors.push(`基础健康检查失败：${error.message}`)}
if(health.status==='FAIL')errors.push(...(health.errors||[]))
const report=['# V2 HEALTH REPORT','',`生成时间：${new Date().toISOString()}`,`状态：${errors.length?'FAIL':'PASS'}`,'',`页面：${app.pages.length}`,`分包：${(app.subPackages||[]).length}`,`主包估算：${health.mainBytes||'unknown'} 字节`,`媒体超 200 KB：${health.mediaOver200K===0?'0':health.mediaOver200K}`,`云函数：${(health.cloudFunctions||[]).join(', ')}`,'','## 错误',...(errors.length?errors.map(x=>`- ${x}`):['- 无']),'','## 警告',...(warnings.length?warnings.map(x=>`- ${x}`):['- 无'])].join('\n')
fs.writeFileSync(path.join(root,'docs','V2_HEALTH_REPORT.md'),report+'\n')
fs.writeFileSync(path.join(root,'docs','V2_FINAL_HEALTH_REPORT.md'),report+'\n')
console.log(JSON.stringify({status:errors.length?'FAIL':'PASS',pages:app.pages.length,subPackages:(app.subPackages||[]).length,mainBytes:health.mainBytes,errors,warnings,report:'docs/V2_FINAL_HEALTH_REPORT.md'},null,2));if(errors.length)process.exitCode=1
