const fs=require('fs')
const path=require('path')
const app=JSON.parse(fs.readFileSync(path.join(__dirname,'..','app.json'),'utf8'))
const routes=[...(app.pages||[]),...((app.subPackages||[]).flatMap(sp=>sp.pages.map(p=>`${sp.root}/${p}`)))]
const eventRe=/(?:bindtap|catchtap|bindchange|catchchange|bindsubmit|bindinput|bindconfirm)="([^"]+)"/g
const navRe=/(?:navigateTo|switchTab|redirectTo|reLaunch|navigateBack)\s*\(\s*\{[^}]*?url\s*:\s*['"`]([^'"`?]+)[^}]*\}/gs
const rows=[]
for(const route of routes){
  const wxml=fs.readFileSync(path.join(__dirname,'..',`${route}.wxml`),'utf8')
  const js=fs.readFileSync(path.join(__dirname,'..',`${route}.js`),'utf8')
  const events=[...wxml.matchAll(eventRe)].map(m=>m[1]).filter((v,i,a)=>a.indexOf(v)===i)
  for(const event of events){
    const found=new RegExp(`(?:^|[,\\s])${event}\\s*\\(`,'m').test(js)
    rows.push({page:route,event,handler:found?'FOUND':'MISSING',status:found?'ACTIVE':'BROKEN'})
  }
  for(const match of js.matchAll(navRe))rows.push({page:route,event:'navigation',handler:match[1],status:'ROUTE_REFERENCE'})
}
const broken=rows.filter(row=>row.status==='BROKEN')
console.log(JSON.stringify({status:broken.length?'FAIL':'PASS',routes:routes.length,events:rows.filter(row=>row.status!=='ROUTE_REFERENCE').length,broken,rows},null,2))
if(broken.length)process.exit(1)
