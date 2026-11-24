const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const core=path.join(root,'core')
const forbidden=[/宁夏/g,/沙坡头/g,/银川/g,/贺兰山/g,/Shapotou/g,/Ningxia/g]
const files=fs.readdirSync(core).filter(name=>name.endsWith('.js'))
const hits=[]
for(const file of files){const text=fs.readFileSync(path.join(core,file),'utf8');for(const pattern of forbidden){if(pattern.test(text))hits.push(`${file}:${pattern}`);pattern.lastIndex=0}}
const required=[
  ['contracts',fs.existsSync(path.join(core,'contracts.js'))],
  ['capability flags',fs.existsSync(path.join(core,'capability-flags.js'))],
  ['provider contract',fs.existsSync(path.join(core,'provider-contract.js'))],
  ['shapotou adapter',fs.existsSync(path.join(root,'adapters/shapotou/scenic-profile.js'))],
  ['integration contract',fs.existsSync(path.join(core,'integration-contract.md'))]
]
for(const [name,ok] of required)console.log(`[SCENIC_CORE_GATE] ${ok?'PASS':'FAIL'} ${name}`)
console.log(`[SCENIC_CORE_GATE] ${hits.length?'FAIL':'PASS'} region hardcode count=${hits.length}`)
if(hits.length||required.some(([,ok])=>!ok))process.exitCode=1
