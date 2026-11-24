const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const tripAgent=require(path.join(root,'utils','trip-agent'))

function assert(value,message){if(!value)throw new Error(message)}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)])}

const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'))
app.pages.forEach(page=>['.js','.wxml','.wxss'].forEach(ext=>assert(fs.existsSync(path.join(root,page+ext)),`missing page file: ${page+ext}`)))
;(app.tabBar&&app.tabBar.list||[]).forEach(item=>assert(app.pages.includes(item.pagePath),`tabBar page is not in pages: ${item.pagePath}`))
const registeredRoutes=new Set(app.pages.map(page=>`/${page}`))
;(app.subPackages||[]).forEach(subPackage=>subPackage.pages.forEach(page=>{
  const route=`/${subPackage.root}/${page}`
  registeredRoutes.add(route)
  ;['.js','.wxml','.wxss'].forEach(ext=>assert(fs.existsSync(path.join(root,subPackage.root,page+ext)),`missing subpackage file: ${subPackage.root}/${page+ext}`))
}))

const zh=tripAgent.planTrip('第一次来宁夏，两天时间，喜欢历史和美食',{locale:'zh-CN'})
assert(zh.days.length===2,'Chinese two-day plan failed')
assert(zh.days.every(day=>day.items.length>=3),'itinerary must be structured cards')
const relaxed=tripAgent.planTrip('明天带父母在银川玩一天，不想走太多路',{locale:'zh-CN'})
assert(relaxed.constraints.pace==='relaxed'&&relaxed.days.length===1,'elderly relaxed constraints failed')
const child=tripAgent.planTrip('带7岁孩子去沙坡头，有什么安排？',{locale:'zh-CN'})
assert(child.constraints.withChildren&&child.constraints.city==='中卫','child/Shapotou constraints failed')
const adjusted=tripAgent.adjustTrip(zh,'少走一点')
assert(adjusted.constraints.pace==='relaxed'&&adjusted.constraints.days===zh.constraints.days,'contextual adjustment failed')
const changed=tripAgent.adjustTrip(zh,'换一个景点')
assert(changed.days[0].items[0].id!==zh.days[0].items[0].id,'change-stop adjustment failed')
const moreFood=tripAgent.adjustTrip(zh,'增加美食')
assert(moreFood.days[0].items.filter(item=>item.type==='food').length>1,'add-food adjustment failed')
const en=tripAgent.planTrip('Two days in Ningxia with history and food',{locale:'en-US'})
assert(!/[\u4e00-\u9fff]/.test([en.summary,en.cityLabel,en.days[0].items[0].name,en.days[0].items[0].reason,en.days[0].items[0].duration,en.tips[0]].join(' ')),'English core output contains Chinese')

const sourceFiles=walk(root).filter(file=>/\.(js|json|wxml|wxss)$/.test(file)&&!file.includes('backup_before_'))
const source=sourceFiles.map(file=>fs.readFileSync(file,'utf8')).join('\n')
sourceFiles.filter(file=>file.endsWith('.wxml')).forEach(file=>{
  const tags=[...fs.readFileSync(file,'utf8').matchAll(/<\/?([a-z-]+)(?:\s[^>]*)?>/g)].map(match=>match[0])
  const stack=[]
  tags.forEach(tag=>{const name=(tag.match(/^<\/?([a-z-]+)/)||[])[1];if(!name||tag.endsWith('/>'))return;if(tag.startsWith('</')){assert(stack.pop()===name,`unbalanced WXML tag in ${path.relative(root,file)}: ${tag}`)}else stack.push(name)})
  assert(stack.length===0,`unclosed WXML tag in ${path.relative(root,file)}: ${stack.join(',')}`)
})
const routeRefs=[...source.matchAll(/["'](\/(?:pages\/|feature\/(?!assets\/))[A-Za-z0-9_/-]+)(?:\?[^"']*)?["']/g)].map(match=>match[1])
routeRefs.forEach(route=>assert(registeredRoutes.has(route),`unregistered route: ${route}`))
const assetRefs=[...source.matchAll(/["'](\/(?:assets|feature\/assets)\/[^"']+)["']/g)].map(match=>match[1])
assetRefs.forEach(ref=>assert(fs.existsSync(path.join(root,ref.slice(1))),`missing asset: ${ref}`))
const featureAssetDir=path.join(root,'feature','assets')
const featureAssets=fs.existsSync(featureAssetDir)?walk(featureAssetDir).filter(file=>/\.(jpg|jpeg|png|webp)$/i.test(file)):[]
// Feature pages intentionally reuse the lightweight main-package thumbnails;
// duplicated full-size subpackage images are excluded to keep the upload lean.
assert(featureAssets.length===0||featureAssets.length>=20,'subpackage asset set is incomplete')
assert(!/sk-[A-Za-z0-9]{12,}|api[_-]?key\s*[:=]\s*['"][^'"]+/i.test(source),'possible client secret detected')

const relative=file=>path.relative(root,file).replace(/\\/g,'/')
// Historical backup folders are not uploaded by the mini-program and must not
// contaminate the main-package budget calculation.
const allFiles=walk(root).filter(file=>!file.includes('backup_before_')&&!file.includes(`${path.sep}.git${path.sep}`))
const ignoredMain=rel=>rel==='README.md'||rel==='assets/asset-manifest.json'||rel.startsWith('docs/')||rel.startsWith('evaluation/')||rel.startsWith('scripts/')||rel.startsWith('cloudfunctions/')||rel.startsWith('feature/')||rel.startsWith('assets/images/')||rel.startsWith('assets/thumbs/intangible/')||rel.startsWith('pages/ip/detail/')||rel.startsWith('pages/shop/detail/')||rel.startsWith('pages/recommend/result/')||rel.startsWith('pages/photo/')||rel.startsWith('pages/memory/')||rel.startsWith('pages/survey/')
const mainBytes=allFiles.filter(file=>!ignoredMain(relative(file))).reduce((sum,file)=>sum+fs.statSync(file).size,0)
const subpackageBytes=allFiles.filter(file=>{const rel=relative(file);return rel.startsWith('feature/')&&!rel.startsWith('feature/assets/images/')}).reduce((sum,file)=>sum+fs.statSync(file).size,0)
assert(mainBytes<1572864,`main package exceeds 1.50 MiB: ${mainBytes}`)

console.log(JSON.stringify({status:'PASS',pages:app.pages.length,subPackages:(app.subPackages||[]).length,registeredRoutes:registeredRoutes.size,routeReferences:new Set(routeRefs).size,knowledgePlans:4,assetReferences:new Set(assetRefs).size,mainPackageBytes:mainBytes,mainPackageMiB:Number((mainBytes/1048576).toFixed(3)),subpackageBytes,locales:['zh-CN','en-US']},null,2))
