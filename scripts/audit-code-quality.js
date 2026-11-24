const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
const project=JSON.parse(fs.readFileSync(path.join(root,'project.config.json'),'utf8'))
const projectSetting=project.setting||{}
const ignores=(project.packOptions&&project.packOptions.ignore||[]).map(item=>item.value.replace(/\\/g,'/'))
function rel(file){return path.relative(root,file).replace(/\\/g,'/')}
function ignored(file){const value=rel(file);return value.startsWith('.git/')||ignores.some(rule=>value===rule||value.startsWith(rule+'/'))}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)])}
const all=walk(root).filter(file=>!ignored(file))
// Only runtime files are candidates for the mini-program package audit.
// Scripts, cloud functions and documentation helpers are deployed separately
// and must not be reported as unused main-package JS.
const jsFiles=all.filter(file=>file.endsWith('.js')&&!rel(file).startsWith('scripts/')&&!rel(file).startsWith('cloudfunctions/'))
const pageBases=[...(app.pages||[]),...(app.subPackages||[]).flatMap(pack=>pack.pages.map(page=>`${pack.root}/${page}`))]
const entries=[path.join(root,'app.js'),...pageBases.flatMap(page=>[path.join(root,page+'.js'),path.join(root,page+'.json')])]
const mainEntries=[path.join(root,'app.js'),...(app.pages||[]).flatMap(page=>[path.join(root,page+'.js'),path.join(root,page+'.json')])]
const reached=new Set()
const missingRequires=[]
const ignoredRuntimeDependencies=[]
function visit(file){
  file=path.normalize(file)
  if(reached.has(file)||!fs.existsSync(file))return
  reached.add(file)
  const source=fs.readFileSync(file,'utf8')
  for(const match of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)){
    if(!match[1].startsWith('.'))continue
    let target=path.resolve(path.dirname(file),match[1])
    if(!path.extname(target))target+='.js'
    if(!fs.existsSync(target)){missingRequires.push(`${rel(file)} -> ${rel(target)}`);continue}
    if(ignored(target)){ignoredRuntimeDependencies.push(`${rel(file)} -> ${rel(target)}`);continue}
    visit(target)
  }
  if(file.endsWith('.json')){
    let config={};try{config=JSON.parse(source)}catch(_){return}
    for(const targetValue of Object.values(config.usingComponents||{})){
      if(typeof targetValue!=='string'||targetValue.startsWith('wx://'))continue
      let target=path.resolve(path.dirname(file),targetValue)
      if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.js')
      else if(!path.extname(target))target+='.js'
      if(ignored(target)){ignoredRuntimeDependencies.push(`${rel(file)} -> ${rel(target)}`);continue}
      visit(target)
    }
  }
}
entries.forEach(visit)
const mainReached=new Set()
function visitMain(file){
  file=path.normalize(file)
  if(mainReached.has(file)||!fs.existsSync(file))return
  mainReached.add(file)
  const source=fs.readFileSync(file,'utf8')
  for(const match of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)){
    if(!match[1].startsWith('.'))continue
    let target=path.resolve(path.dirname(file),match[1])
    if(!path.extname(target))target+='.js'
    if(ignored(target)){ignoredRuntimeDependencies.push(`${rel(file)} -> ${rel(target)}`);continue}
    visitMain(target)
  }
  if(file.endsWith('.json')){
    let config={};try{config=JSON.parse(source)}catch(_){return}
    for(const targetValue of Object.values(config.usingComponents||{})){
      if(typeof targetValue!=='string'||targetValue.startsWith('wx://'))continue
      let target=path.resolve(path.dirname(file),targetValue)
      if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.js')
      else if(!path.extname(target))target+='.js'
      if(ignored(target)){ignoredRuntimeDependencies.push(`${rel(file)} -> ${rel(target)}`);continue}
      visitMain(target)
    }
  }
}
mainEntries.forEach(visitMain)
const intentionallyDeferred=new Set(['adapters/integration/zhiyou-ningxia/index.js','adapters/shapotou/experience-types.js','adapters/shapotou/index.js','adapters/shapotou/integration-config.js','adapters/shapotou/knowledge.js','adapters/shapotou/memory-templates.js','adapters/shapotou/scenic-profile.js','adapters/shapotou/share-templates.js','adapters/shapotou/stories.js','core/capability-flags.js','core/contracts.js','core/experience-orchestrator.js','services/scenic-trip-application.js','utils/scenic-runtime.js'])
const unused=jsFiles.filter(file=>!reached.has(path.normalize(file))&&!intentionallyDeferred.has(rel(file))).map(rel).sort()
const mainPackageUnused=jsFiles.filter(file=>!rel(file).startsWith('feature/')&&!mainReached.has(path.normalize(file))&&!intentionallyDeferred.has(rel(file))).map(rel).sort()
const media=all.filter(file=>/\.(jpg|jpeg|png|gif|webp|svg|mp3|wav|aac|m4a)$/i.test(file)).map(file=>({file:rel(file),bytes:fs.statSync(file).size})).sort((a,b)=>b.bytes-a.bytes)
const result={
  lazyCodeLoading:app.lazyCodeLoading||'disabled',
  ignoreDevUnusedFiles:projectSetting.ignoreDevUnusedFiles===false,
  customComponentDeclarations:all.filter(file=>file.endsWith('.json')).reduce((n,file)=>{try{return n+Object.keys(JSON.parse(fs.readFileSync(file,'utf8')).usingComponents||{}).length}catch(_){return n}},0),
  missingRequires:[...new Set(missingRequires)].sort(),
  ignoredRuntimeDependencies:[...new Set(ignoredRuntimeDependencies)].sort(),
  unusedJs:unused,
  mainPackageUnusedJs:mainPackageUnused,
  mediaOver200K:media.filter(item=>item.bytes>200*1024),
  largestMedia:media.slice(0,15)
}
const report=[
  '# 微信代码质量审计报告','',`生成时间：${new Date().toISOString()}`,'',
  `状态：${result.missingRequires.length||result.ignoredRuntimeDependencies.length||result.unusedJs.length||result.mainPackageUnusedJs.length||result.mediaOver200K.length||!result.ignoreDevUnusedFiles?'FAIL':'PASS'}`,'',
  `按需注入：${result.lazyCodeLoading}`,
  `无依赖 JS：${result.unusedJs.length}`,
  `主包仅被分包依赖 JS：${result.mainPackageUnusedJs.length}`,
  `媒体超过 200KB：${result.mediaOver200K.length}`,
  `无依赖文件误过滤保护：${result.ignoreDevUnusedFiles?'已配置':'未配置'}`,'',
  '## 被打包排除但仍被运行时代码引用',...(result.ignoredRuntimeDependencies.length?result.ignoredRuntimeDependencies.map(x=>`- ${x}`):['- 无']),'',
  '## 无依赖 JS',...(result.unusedJs.length?result.unusedJs.map(x=>`- ${x}`):['- 无']),'',
  '## 主包仅被分包依赖 JS',...(result.mainPackageUnusedJs.length?result.mainPackageUnusedJs.map(x=>`- ${x}`):['- 无']),'',
  '## 超过 200KB 的媒体',...(result.mediaOver200K.length?result.mediaOver200K.map(x=>`- ${x.file}（${x.bytes} 字节）`):['- 无']),'',
  '## 最大媒体文件',...result.largestMedia.slice(0,10).map(x=>`- ${x.file}（${x.bytes} 字节）`)
].join('\n')+'\n'
fs.mkdirSync(path.join(root,'docs'),{recursive:true});fs.writeFileSync(path.join(root,'docs','WX_CODE_QUALITY_AUDIT.md'),report)
console.log(JSON.stringify(result,null,2))
if(result.missingRequires.length||result.ignoredRuntimeDependencies.length||result.unusedJs.length||result.mainPackageUnusedJs.length||result.mediaOver200K.length||!result.ignoreDevUnusedFiles)process.exitCode=1
