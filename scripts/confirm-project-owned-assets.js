const fs=require('fs')
const path=require('path')

const root=path.resolve(__dirname,'..')
const manifestFile=path.join(root,'assets','asset-manifest.json')
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'))
const sourceRoots=['app.js','app.json','app.wxss','pages','feature','components','styles','design-tokens','utils','services','providers','knowledge','config','adapters','core','domain','ports']
const files=[]

function walk(value){
  const absolute=path.join(root,value)
  if(!fs.existsSync(absolute))return
  const stat=fs.statSync(absolute)
  if(stat.isDirectory())for(const child of fs.readdirSync(absolute))walk(path.join(value,child))
  else if(/\.(js|json|wxml|wxss)$/.test(value))files.push(absolute)
}

sourceRoots.forEach(walk)
const active=new Set()
const assetPattern=/(?:\/|\\)?assets[\\/]([^'"`\s)>}]+\.(?:png|jpe?g|webp|gif|svg))/ig
for(const file of files){
  const text=fs.readFileSync(file,'utf8')
  let match
  while((match=assetPattern.exec(text)))active.add(('assets/'+match[1]).replace(/\\/g,'/'))
}

let updated=0
for(const entry of manifest.entries||[]){
  const assetPath=String(entry.path||'').replace(/\\/g,'/')
  if(!active.has(assetPath)||entry.status==='APPROVED')continue
  Object.assign(entry,{
    creator:'贺兰有灵项目团队',
    source:'项目方自有素材；项目负责人于 2026-09-03 确认拥有并可用于本项目商业发布',
    license:'PROJECT_OWNED_COMMERCIAL',
    licenseCheckedAt:'2026-09-03',
    projectOwned:true,
    thirdParty:false,
    aiGenerated:entry.aiGenerated===true,
    officialBrandAsset:false,
    researchOnly:false,
    commercialUse:true,
    modificationAllowed:true,
    attributionRequired:false,
    demoAllowed:true,
    productionAllowed:true,
    transferAllowed:false,
    status:'APPROVED',
    risk:'项目方已声明自有；应保留原始文件、创作记录或权属证明以备平台抽查'
  })
  updated++
}

manifest.policy='PROJECT_OWNED_ASSETS_REQUIRE_RETAINED_PROVENANCE'
manifest.ownershipConfirmation={
  confirmedBy:'项目负责人（用户确认）',
  confirmedAt:'2026-09-03',
  scope:'当前运行时引用的项目素材',
  statement:'素材均为项目方自有，可用于本项目微信小程序商业发布；原始权属凭证由项目方留存'
}
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n')
console.log(JSON.stringify({activeAssets:active.size,updated,status:'CONFIRMED_PROJECT_OWNED'}))
