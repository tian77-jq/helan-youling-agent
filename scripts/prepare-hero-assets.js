// Reproducible delivery encoding only; original artwork remains in docs.
const fs=require('fs'),crypto=require('crypto')
const sharp=require('C:/Users/32862/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const dir='docs/hero-20260905'
const hash=p=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
;(async()=>{
 const hero='assets/thumbs/banners/ningxia-hero-v1.jpg'
 const museum='assets/thumbs/scenic-collab/ningxia_museum.jpg'
 await sharp(dir+'/originals/ningxia-hero-v1.png').resize(750,750).jpeg({quality:70,mozjpeg:true}).toFile(hero)
 await sharp(dir+'/originals/ningxia_museum.jpg').resize(640).jpeg({quality:70,mozjpeg:true}).toFile(museum)
 const manifest=JSON.parse(fs.readFileSync('assets/asset-manifest.json','utf8'))
 const original=manifest.entries.find(e=>e.path===museum)
 original.originalHash=original.originalHash||original.hash
 original.hash=hash(museum);original.fileSize=fs.statSync(museum).size
 original.optimization={original:dir+'/originals/ningxia_museum.jpg',resize:'640px width; aspect ratio preserved',encoding:'JPEG mozjpeg quality 70',date:'2026-09-05'}
 const entry={assetId:'ningxia-hero-20260905-v1',path:hero,hash:hash(hero),type:'jpg',fileSize:fs.statSync(hero).size,usedBy:['pages/index/index.wxml'],creator:'OpenAI built-in imagegen',source:'Original generation 2026-09-05 from three project IP character references',sourceUrl:'',license:'PROJECT_OWNED_AI_GENERATED',licenseCheckedAt:'2026-09-05',projectOwned:true,thirdParty:false,aiGenerated:true,officialBrandAsset:false,researchOnly:false,commercialUse:true,modificationAllowed:true,attributionRequired:false,demoAllowed:true,productionAllowed:true,transferAllowed:true,status:'APPROVED',assetRole:'HOME_SCENE_ART',provenance:dir+'/README.md',risk:'Regional landscape montage, not a documentary photograph or exact viewpoint; existing IP provenance retained'}
 const i=manifest.entries.findIndex(e=>e.path===hero);if(i<0)manifest.entries.push(entry);else manifest.entries[i]=entry
 fs.writeFileSync('assets/asset-manifest.json',JSON.stringify(manifest,null,2)+'\n')
 console.log(JSON.stringify({hero:{bytes:entry.fileSize,hash:entry.hash},museum:{bytes:original.fileSize,hash:original.hash}}))
})().catch(e=>{console.error(e);process.exitCode=1})
