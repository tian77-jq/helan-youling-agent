const fs=require('fs'),path=require('path')
const root=path.resolve(__dirname,'..')
const dirs=['domain','core']
const files=[]
for(const dir of dirs){const full=path.join(root,dir);if(fs.existsSync(full))for(const name of fs.readdirSync(full))if(name.endsWith('.js'))files.push(path.join(full,name))}
const forbidden=[/\bwx\s*\./,/cloudbase|wx\.cloud/i,/hunyuan|混元/i,/宁夏|沙坡头|银川|贺兰山/]
const hits=[]
for(const file of files){const text=fs.readFileSync(file,'utf8');for(const rule of forbidden)if(rule.test(text))hits.push(`${path.relative(root,file)}:${rule}`)}
for(const [name,ok] of [['DOMAIN_WX_IMPORT',!hits.some(x=>/wx/.test(x))],['DOMAIN_CLOUDBASE_IMPORT',!hits.some(x=>/cloudbase|wx\.cloud/i.test(x))],['DOMAIN_HUNYUAN_IMPORT',!hits.some(x=>/hunyuan|混元/i.test(x))],['DOMAIN_SCENIC_HARDCODE',!hits.some(x=>/宁夏|沙坡头|银川|贺兰山/.test(x))]])console.log(`[DOMAIN_PURITY_GATE] ${ok?'PASS':'FAIL'} ${name}`)
if(hits.length){console.error(hits.join('\n'));process.exitCode=1}
