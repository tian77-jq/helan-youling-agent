const expected={mountain:'岩羊',city:'沙狐',story:'骆驼',food:'沙狐'}
// The page module is intentionally not exported in WeChat runtime; keep this
// contract test data-driven through the source so it catches accidental drift.
const fs=require('fs')
const source=fs.readFileSync(require.resolve('../pages/ip/index.js'),'utf8')
const missing=Object.keys(expected).filter(id=>!source.includes(`id:'${id}'`)||!source.includes(`character:'${expected[id]}'`))
console.log(JSON.stringify({status:missing.length?'FAIL':'PASS',worldCount:Object.keys(expected).length,missing},null,2))
if(missing.length)process.exitCode=1
