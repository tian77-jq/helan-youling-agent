const fs = require('fs'), path = require('path')
const root = path.resolve(__dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dependency-license-manifest.json'), 'utf8'))
const cloudRoot=path.join(root,'cloudfunctions')
const packageFiles=fs.readdirSync(cloudRoot,{withFileTypes:true}).filter(item=>item.isDirectory()&&fs.existsSync(path.join(cloudRoot,item.name,'package.json'))).map(item=>path.join('cloudfunctions',item.name,'package.json'))
const declared=new Map()
for(const file of packageFiles){const pkg=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));for(const [name,version] of Object.entries(pkg.dependencies||{})){if(!declared.has(name))declared.set(name,new Set());declared.get(name).add(version)}}
const byName=new Map(manifest.entries.map(item=>[item.name,item]))
const unknown = manifest.entries.filter(x => !x.license || x.license === 'UNKNOWN')
const missing=[...declared.keys()].filter(name=>!byName.has(name))
const unpinned=[...declared.entries()].flatMap(([name,versions])=>[...versions].filter(version=>version==='latest'||/^[~^*]/.test(version)).map(version=>`${name}@${version}`))
console.log(`[DEPENDENCY_LICENSE_GATE] PACKAGE_MANIFESTS=${packageFiles.length} DIRECT_DEPENDENCIES=${declared.size} ENTRIES=${manifest.entries.length} UNKNOWN_CODE_LICENSE=${unknown.length} MISSING=${missing.length} UNPINNED=${unpinned.length}`)
const blocked = manifest.status !== 'VERIFIED_DIRECT_DEPENDENCIES' || unknown.length > 0 || missing.length > 0 || unpinned.length > 0
if(missing.length)console.log(`[DEPENDENCY_LICENSE_GATE] MISSING_ENTRIES=${missing.join(',')}`)
if(unpinned.length)console.log(`[DEPENDENCY_LICENSE_GATE] UNPINNED_ENTRIES=${unpinned.join(',')}`)
console.log(`[DEPENDENCY_LICENSE_GATE] ${blocked ? 'BLOCKED' : 'PASS'} dependency license gate`)
if (blocked) process.exitCode = 1
