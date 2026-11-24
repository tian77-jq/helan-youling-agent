const fs=require('fs')
const path=require('path')

const root=path.resolve(__dirname,'..')
const read=file=>fs.readFileSync(path.join(root,file),'utf8')
const app=JSON.parse(read('app.json'))
const project=JSON.parse(read('project.config.json'))
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const full=path.join(dir,entry.name)
  if(['.git','docs','scripts','node_modules','cloudfunctions'].includes(entry.name))return []
  return entry.isDirectory()?walk(full):[full]
})
const sourceFiles=walk(root).filter(file=>/\.(js|json|wxml|wxss)$/.test(file))
const source=sourceFiles.map(file=>({file:path.relative(root,file).replace(/\\/g,'/'),content:fs.readFileSync(file,'utf8')}))
const matches=pattern=>source.filter(item=>pattern.test(item.content)).map(item=>item.file)
const extractDomains=()=>[...new Set(source.flatMap(item=>[...item.content.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)].map(match=>match[1])))]
const privacy={
  chooseMedia:matches(/wx\.chooseMedia/),
  saveImageToPhotosAlbum:matches(/wx\.saveImageToPhotosAlbum/),
  clipboard:matches(/wx\.(setClipboardData|getClipboardData)/),
  location:matches(/wx\.(getLocation|chooseLocation)/),
  microphone:matches(/wx\.(getRecorderManager|startRecord)/),
  userProfile:matches(/wx\.getUserProfile/),
  phoneNumber:matches(/getPhoneNumber/)
}
const network={
  wxRequest:matches(/wx\.request/),
  uploadFile:matches(/wx\.uploadFile/),
  downloadFile:matches(/wx\.downloadFile/),
  socket:matches(/wx\.connectSocket/),
  cloudFunctions:matches(/wx\.cloud\.callFunction/),
  cloudStorage:matches(/wx\.cloud\.(uploadFile|downloadFile|getTempFileURL)/),
  directDomains:extractDomains()
}
const localhost=matches(/localhost|127\.0\.0\.1|192\.168\./i)
const secret=matches(/(?:SecretId|SecretKey|AppSecret)\s*[:=]\s*['"][^'"]+/)
const result={
  WECHAT_RELEASE_AUDIT:'PASS_WITH_PLATFORM_ACTIONS',
  appIdConfigured:Boolean(project.appid&&/^wx[0-9a-z]+$/i.test(project.appid)),
  appId:project.appid||'',
  package:{pages:(app.pages||[]).length,subPackages:(app.subPackages||[]).length,lazyCodeLoading:app.lazyCodeLoading||'',plugins:app.plugins||{}},
  privacy,
  network,
  localhostReleaseRisk:localhost,
  frontendSecretExposure:secret,
  platformActions:[
    '确认主体账号、认证、备案、小程序名称、简介和服务类目。',
    '按本审计的实际权限 API 配置用户隐私保护指引。',
    '在公众平台确认 WechatSI 插件授权；未授权则发布构建保持字幕模式。',
    '上传版本、体验版验收、提交审核、正式发布和正式版真机复测。'
  ],
  blockers:[]
}
if(!result.appIdConfigured)result.blockers.push('APPID_NOT_CONFIGURED')
if(localhost.length)result.blockers.push('LOCALHOST_RELEASE_RISK')
if(secret.length)result.blockers.push('FRONTEND_SECRET_RISK')
result.releaseVoiceMode=require(path.join(root,'scripts/fixtures/voice-release')).VOICE_PROVIDER_RELEASE_MODE
console.log(JSON.stringify(result,null,2))
if(result.blockers.length)process.exitCode=1
