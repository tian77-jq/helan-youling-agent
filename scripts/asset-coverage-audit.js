const fs=require('fs'),path=require('path')
const root=path.resolve(__dirname,'..')
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/asset-manifest.json'),'utf8'))
const listed=new Set(manifest.entries.map(x=>x.path))
const files=[]
const assets=path.join(root,'assets')
const walk=d=>{for(const item of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,item.name);if(item.isDirectory())walk(p);else files.push(path.relative(root,p).replace(/\\/g,'/'))}}
walk(assets)
const untracked=files.filter(file=>![...listed].some(entry=>entry.endsWith('/')?file.startsWith(entry):file===entry))
console.log(`[ASSET_COVERAGE] total=${files.length} listed=${files.length-untracked.length} untracked=${untracked.length}`)
console.log(`[ASSET_COVERAGE] ${untracked.length?'BLOCKED':'PASS'} production asset coverage`)
if(untracked.length)process.exitCode=1
