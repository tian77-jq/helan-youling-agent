const fs=require('fs')
const childProcess=require('child_process')
const path=require('path')
const root=path.resolve(__dirname,'..')
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets','asset-manifest.json'),'utf8'))
const entries=Array.isArray(manifest)?manifest:(manifest.entries||manifest.assets||[])
const sourceRoots=['app.js','app.json','app.wxss','pages','feature','components','styles','design-tokens','utils','services','providers','knowledge','config','adapters','core','domain','ports']
const files=[]
function walk(value){const absolute=path.join(root,value);if(!fs.existsSync(absolute))return;const stat=fs.statSync(absolute);if(stat.isDirectory())for(const child of fs.readdirSync(absolute))walk(path.join(value,child));else if(/\.(js|json|wxml|wxss)$/.test(value))files.push(absolute)}
sourceRoots.forEach(walk)
const references=new Map()
const assetPattern=/(?:\/|\\)?assets[\\/]([^'"`\s)>}]+\.(?:png|jpe?g|webp|gif|svg))/ig
for(const file of files){const text=fs.readFileSync(file,'utf8');let match;while((match=assetPattern.exec(text))){const assetPath=('assets/'+match[1]).replace(/\\/g,'/');if(!references.has(assetPath))references.set(assetPath,new Set());references.get(assetPath).add(path.relative(root,file).replace(/\\/g,'/'))}}
const normalizeAssetPath=value=>String(value||'').replace(/\\/g,'/').replace(/^\/+/,'')
const byPath=new Map(entries.map(item=>[normalizeAssetPath(item.path),item]))
function jpegDimensions(file){const buffer=fs.readFileSync(file);let offset=2;while(offset+9<buffer.length){if(buffer[offset]!==0xff){offset++;continue}const marker=buffer[offset+1];const length=buffer.readUInt16BE(offset+2);if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:buffer.readUInt16BE(offset+7),height:buffer.readUInt16BE(offset+5)};offset+=2+length}return null}
function firstCommit(assetPath){try{return childProcess.execFileSync('git',['log','--all','--format=%H %ad','--date=iso','--',assetPath],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean).pop()||null}catch(error){return null}}
const active=[...references.entries()].map(([assetPath,usedBy])=>{const file=path.join(root,assetPath);const manifestEntry=byPath.get(assetPath);return {path:assetPath,usedBy:[...usedBy],firstKnownUsage:[...usedBy][0]||null,sha256:fs.existsSync(file)?require('crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex'):null,fileSize:fs.existsSync(file)?fs.statSync(file).size:null,dimensions:fs.existsSync(file)?jpegDimensions(file):null,firstKnownCommit:firstCommit(assetPath),assetRole:manifestEntry&&manifestEntry.assetRole||'PRODUCT_RENDER',parentCharacterId:manifestEntry&&manifestEntry.parentCharacterId||null,manifest:manifestEntry||null}})
const unknownActive=active.filter(item=>!item.manifest||item.manifest.status==='LICENSE_UNKNOWN'||item.manifest.productionAllowed!==true)
const dangling=active.filter(item=>item.manifest&&(!fs.existsSync(path.join(root,item.path))))
const result={pass:unknownActive.length===0&&dangling.length===0,sourceFileCount:files.length,activeAssetCount:active.length,activeUsageEdgeCount:active.reduce((sum,item)=>sum+item.usedBy.length,0),unknownActiveCount:unknownActive.length,danglingActiveCount:dangling.length,active:active.map(item=>({path:item.path,usedBy:item.usedBy,firstKnownUsage:item.firstKnownUsage,sha256:item.sha256,fileSize:item.fileSize,dimensions:item.dimensions,firstKnownCommit:item.firstKnownCommit,assetRole:item.assetRole,parentCharacterId:item.parentCharacterId,status:item.manifest&&item.manifest.status||'MISSING',productionAllowed:item.manifest&&item.manifest.productionAllowed===true})),unknownActive:unknownActive.map(item=>({path:item.path,usedBy:item.usedBy,status:item.manifest&&item.manifest.status||'MISSING'}))}
console.log(JSON.stringify(result,null,2))
process.exitCode=result.pass?0:1
