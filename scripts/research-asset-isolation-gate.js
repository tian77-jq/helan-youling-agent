const fs=require('fs'),path=require('path')
const root=path.resolve(__dirname,'..')
const research=path.join(root,'research'),production=path.join(root,'production-assets')
const researchNames=fs.existsSync(research)?new Set(fs.readdirSync(research,{recursive:true})):new Set()
const leaks=[]
if(fs.existsSync(production))for(const name of fs.readdirSync(production,{recursive:true}))if(researchNames.has(name))leaks.push(name)
console.log(`[RESEARCH_ISOLATION_GATE] ${leaks.length?'FAIL':'PASS'} research_asset_leaks=${leaks.length}`)
if(leaks.length)process.exitCode=1
