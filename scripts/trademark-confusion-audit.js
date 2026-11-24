const fs=require('fs'),path=require('path')
const root=path.resolve(__dirname,'..')
const files=[]
for(const dir of ['pages','feature','docs']){const full=path.join(root,dir);if(!fs.existsSync(full))continue;const walk=d=>{for(const item of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,item.name);if(item.isDirectory())walk(p);else if(/\.(js|wxml|md|json)$/.test(item.name))files.push(p)}};walk(full)}
const risky=/(中旅沙坡头官方|沙坡头官方AI|中旅联合开发|官方推荐|战略合作|授权产品|官方沙坡头)/g
const allow=/(未获[^。\n]{0,40}官方授权|不表示官方|独立技术演示版|不得|不应|未获书面许可|must not say|without written permission)/i
const hits=[]
for(const file of files){const text=fs.readFileSync(file,'utf8');for(const match of text.matchAll(risky)){const line=text.slice(0,text.indexOf('\n',match.index)<0?text.length:text.indexOf('\n',match.index)).split('\n').pop();const context=text.slice(Math.max(0,match.index-20),match.index+match[0].length+20);if(!allow.test(context)&&!allow.test(line))hits.push(`${path.relative(root,file)}:${match[0]}`)}}
console.log(`[TRADEMARK_AUDIT] ${hits.length?'FAIL':'PASS'} unauthorized_or_confusing_claims=${hits.length}`)
if(hits.length){console.error(hits.join('\n'));process.exitCode=1}
