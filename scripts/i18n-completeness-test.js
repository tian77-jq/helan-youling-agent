const assert=require('assert')
const fs=require('fs')
const path=require('path')
const catalogs={'zh-CN':require('../locales/zh-CN'),'en-US':require('../locales/en-US'),ar:require('../locales/ar')}
const visualCopy=require('../locales/visual-correction')
Object.keys(visualCopy).forEach(locale=>Object.keys(visualCopy[locale]).forEach(section=>Object.assign(catalogs[locale][section],visualCopy[locale][section])))
const coreKeys=[
  'nav.home','nav.discover','nav.gallery','nav.mine',
  'home.title','home.subtitle','home.tripTitle','home.newTrip','home.create','home.qaTitle','home.ask',
  'discover.title','discover.subtitle','discover.start','discover.picks','discover.taste','discover.routeTitle',
  'trip.title','trip.subtitle','trip.generate','trip.placeholder','trip.qa','trip.route','trip.creation','trip.itinerary','trip.safety','trip.evidence',
  'persona.yanyang.name','persona.yanyang.role','persona.luotuo.name','persona.luotuo.role','persona.shahu.name','persona.shahu.role',
  'my.profile','my.atlas','my.memories','my.language','settings.title','settings.zh','settings.en','settings.ar',
  'shop.title','shop.subtitle','shop.note','story.title',
  ...Object.keys(catalogs['zh-CN'].tripUi).map(key=>`tripUi.${key}`),
  ...['mountain','city','story','food'].flatMap(key=>[`discover.worlds.${key}`,`discover.worldLabels.${key}`,`discover.worldCopies.${key}`,`discover.worldPrompts.${key}`])
]
function get(object,key){return key.split('.').reduce((value,part)=>value&&value[part],object)}
const missing=[]
for(const key of coreKeys)for(const locale of Object.keys(catalogs))if(typeof get(catalogs[locale],key)!=='string')missing.push(`${locale}:${key}`)
const flatten=(value,prefix='',result=[])=>{Object.keys(value).sort().forEach(key=>{const next=prefix?`${prefix}.${key}`:key;value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key])?flatten(value[key],next,result):result.push(next)});return result}
const base=flatten(catalogs['zh-CN'])
for(const locale of Object.keys(catalogs))assert.deepStrictEqual(flatten(catalogs[locale]),base,`${locale} key registry differs from zh-CN`)
assert.deepStrictEqual(missing,[],`missing core translations: ${missing.join(', ')}`)
const root=path.resolve(__dirname,'..')
const pages=['pages/index/index.wxml','pages/ip/index.wxml','pages/trip/index.wxml','pages/admin/index.wxml','pages/language/index.wxml','pages/shop/index.wxml']
const hardcoded=[]
const unboundLocaleFields=[]
for(const file of pages){
  const source=fs.readFileSync(path.join(root,file),'utf8')
  const stripped=source.replace(/<!--([\s\S]*?)-->/g,'')
  if(file==='pages/trip/index.wxml')for(const match of stripped.matchAll(/localeText\.([A-Za-z0-9_]+)/g)){
    const field=match[1]
    if(typeof get(catalogs['zh-CN'].trip,field)!=='string'&&typeof get(catalogs['zh-CN'].tripUi,field)!=='string')unboundLocaleFields.push(field)
  }
  for(const match of stripped.matchAll(/>([^<{][^<]*)</g)){
    const text=match[1].trim()
    if(/[\u3400-\u9fff]/.test(text)||/[A-Za-z]{3,}/.test(text))hardcoded.push({file,text})
  }
}
assert.deepStrictEqual([...new Set(unboundLocaleFields)],[],`unbound Trip translation fields: ${[...new Set(unboundLocaleFields)].join(', ')}`)
console.log(JSON.stringify({status:'PASS',supportedLocales:Object.keys(catalogs),coreTranslationKeys:coreKeys.length,missingCoreTranslations:missing.length,unboundTripLocaleFields:0,hardcodedCoreWxmlTextCount:hardcoded.length,hardcodedExamples:hardcoded.slice(0,60)},null,2))
