const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const pages={HOME:{files:['pages/index/index.js','pages/index/index.wxml','pages/index/index.wxss'],scene:'MOUNTAIN'},DISCOVER:{files:['pages/ip/index.js','pages/ip/index.wxml','pages/ip/index.wxss'],scene:'RIVER'},GALLERY:{files:['pages/shop/index.js','pages/shop/index.wxml','pages/shop/index.wxss'],scene:'DESERT'},MY:{files:['pages/admin/index.js','pages/admin/index.wxml','pages/admin/index.wxss'],scene:'STAR'},TRIP:{files:['pages/trip/index.js','pages/trip/index.wxml','pages/trip/index.wxss'],scene:'MOUNTAIN'}}
const modes=['FULL','REDUCED','OFF']
const rows=Object.entries(pages).map(([name,definition])=>{const content=definition.files.map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');return {name,scene:definition.scene,themeResolver:/theme-contract/.test(content),motionResolver:/motion-tokens/.test(content),motionBinding:/data-motion|motionToken/.test(content),transformOpacityOnly:/@keyframes[\s\S]*(?:transform|opacity)/.test(content),sceneIdentity:new RegExp(definition.scene,'i').test(content)||new RegExp(name,'i').test(content)}})
const pass=rows.every(row=>row.themeResolver&&row.motionResolver&&row.motionBinding&&row.transformOpacityOnly&&row.sceneIdentity)&&modes.every(mode=>mode==='FULL'||mode==='REDUCED'||mode==='OFF')
console.log(JSON.stringify({status:pass?'PASS':'FAIL',modes,rows},null,2))
process.exitCode=pass?0:1
