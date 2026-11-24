const fs=require('fs'),path=require('path'),vm=require('vm')
const roots=['app.js','app.json','app.wxss','pages','feature','components','services','utils','adapters','cloudfunctions','scripts','config','docs','assets','design-tokens','knowledge','core','domain','ports','providers']
const files=[]
function walk(file){if(!fs.existsSync(file))return;const stat=fs.statSync(file);if(stat.isDirectory()){if(/(?:^|[/\\])(?:node_modules|audit-20260905)$/.test(file))return;fs.readdirSync(file).forEach(name=>walk(path.join(file,name)))}else files.push(file)}
roots.forEach(walk)
const markers={},syntaxFailures=[],secretCandidates=[];let checked=0
for(const file of files){if(!/\.(js|json|wxml|wxss|md)$/.test(file))continue;const source=fs.readFileSync(file,'utf8');for(const marker of ['TODO','FIXME','NOT_PROVEN','DEVICE_REQUIRED','HUMAN_REQUIRED','NOT_YET','FALLBACK','MOCK','TEMP','LEGACY','DEPRECATED']){const count=(source.match(new RegExp('\\b'+marker+'\\b','g'))||[]).length;if(count)(markers[marker]||(markers[marker]=[])).push({file,count})}
 if(file.endsWith('.js')){checked++;try{new vm.Script(source,{filename:file})}catch(error){syntaxFailures.push({file,message:error.message})}}
 if(!file.startsWith('scripts')&&!file.startsWith('docs'))source.split('\n').forEach((line,index)=>{if(/(?:AKID[a-zA-Z0-9]{20,}|sk-[a-zA-Z0-9]{24,}|BEGIN (?:RSA )?PRIVATE KEY)/.test(line))secretCandidates.push({file,line:index+1})})
}
fs.mkdirSync('docs/audit-20260905',{recursive:true})
fs.writeFileSync('docs/audit-20260905/source-inventory.json',JSON.stringify({files:files.length,jsSyntaxChecked:checked,syntaxFailures,secretCandidates,markers},null,2))
console.log(JSON.stringify({files:files.length,jsSyntaxChecked:checked,syntaxFailures,secretCandidateCount:secretCandidates.length,scope:'STRUCTURAL_ONLY'}))
if(syntaxFailures.length||secretCandidates.length)process.exitCode=1
