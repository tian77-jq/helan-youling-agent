const cloudConfig=require('../../config/cloud')
const {sceneById,petById,styleById,outputById}=require('./studio-config')
const imageService=require('../../services/image-service')

// 本地次数仅用于防止前端连续误触，不代表腾讯云账户的实际赠送余额。
const LOCAL_DAILY_LIMIT=20
const OUTPUT_SIZES={wallpaper:'720x1280',poster:'1024x1024',postcard:'1280x720'}

function storageKey(){return 'helan_create_quota_'+new Date().toISOString().slice(0,10)}
function quota(){const used=Number(wx.getStorageSync(storageKey())||0);return {used,limit:LOCAL_DAILY_LIMIT,remaining:Math.max(0,LOCAL_DAILY_LIMIT-used)}}
function safetyFilter(text){const value=String(text||'').trim();const blocked=/违法|色情|暴力血腥|恐怖袭击|赌博|毒品/i;if(blocked.test(value))throw new Error('这段内容不适合生成，请换一句旅行故事。');return value.slice(0,120)}
function buildPrompt(input){
  const scene=sceneById(input.scene),pet=petById(input.pet),style=styleById(input.style),output=outputById(input.outputType)
  const subItem=scene.subScenes.find(item=>item[0]===input.subScene)||scene.subScenes[0]||['','宁夏文化']
  return ['生成宁夏主题的无文字视觉背景：',`场景：${scene.title}；视觉主题：${subItem[1]}。`,`地域知识约束：呈现真实的宁夏地域气质，避免泛化为其他地区；结合${scene.id==='yellow_river'?'黄河文化与塞上江南':scene.id==='xixia'?'西夏遗产与贺兰山岩画':scene.id==='helan_ecology'?'贺兰山生态、岩羊与荒漠绿洲':scene.id==='food_collab'?'宁夏地方美食与城市风味':'宁夏景区旅行与原创文旅IP'}。`,`原创IP角色：${pet.name}（${pet.animal}），定位为${pet.role}；关键词：${pet.keywords}；角色适配：${pet.fit}。`,`视觉风格：${style.name}；输出比例：${output.ratio}，主体清晰、构图完整、高清。`,`优先表现自然山体、岩层、黄河、沙漠、天空等视觉元素，避免道路标牌、商铺、景区门头、海报和牌匾。`,`TEXT-FREE IMAGE ONLY. NO TEXT, NO LETTERS, NO WORDS, NO CHINESE CHARACTERS, NO ENGLISH WORDS, NO ARABIC LETTERING, NO TYPOGRAPHY, NO CAPTIONS, NO LOGO TEXT, NO LOGOS, NO SIGNAGE, NO READABLE SIGNS, NO WATERMARK, NO PSEUDO-TEXT. 不得把用户提供的任何文字渲染到图像中；标题、地点、日期、角色名和旅行寄语由小程序原生文字层绘制。禁止虚构景区票价或开放时间。`].join('\n')
}
function callHunyuan(payload){
  return imageService.generateImage({scene:payload.scene||'宁夏旅行',culture:payload.culture||'宁夏文化',pet:payload.pet||'三萌宠联名',style:payload.style||'旅行纪念卡',prompt:payload.prompt,size:payload.size,requestId:payload.requestId}).then(result=>{
    if(!result.success||!result.imageUrl){console.error('[AI_CREATE][IMAGE_SERVICE_FAIL]',result);throw new Error(result.message||result.code||'腾讯混元暂未返回图片')}
    return result
  })
}
function generate(input){
  if(cloudConfig.VISION_MODE!==cloudConfig.visionModes.HUNYUAN_ENABLED)return Promise.reject(new Error('AI旅行效果预览正在准备中，当前优先展示已核验景区实景。'))
  const q=quota()
  if(q.remaining<=0)return Promise.reject(new Error('今日体验次数已用完，明天再来创作吧。'))
  const prompt=buildPrompt(input)
  const scene=sceneById(input.scene),pet=petById(input.pet),style=styleById(input.style),subItem=(scene.subScenes.find(item=>item[0]===input.subScene)||scene.subScenes[0]||['','宁夏文化'])
  const payload={prompt,size:OUTPUT_SIZES[input.outputType]||OUTPUT_SIZES.poster,scene:scene.title,culture:subItem[1],pet:pet.name,style:style.name,subScene:input.subScene,requestId:'helan-'+Date.now()+'-'+Math.random().toString(36).slice(2,10)}
  return callHunyuan(payload).then(result=>{
    wx.setStorageSync(storageKey(),q.used+1)
    const scene=sceneById(input.scene),pet=petById(input.pet)
    return {success:true,mode:'tencent-hunyuan',provider:result.provider||cloudConfig.imageProvider,model:result.model||cloudConfig.imageModel,taskId:result.taskId||payload.requestId,imageUrl:result.imageUrl,providerUrl:result.providerUrl||'',fileID:result.fileID||'',persisted:Boolean(result.persisted),revisedPrompt:result.revisedPrompt||'',cultureNote:`${pet.name}陪你把“${scene.title}”变成一张由腾讯混元生成的宁夏专属纪念作品。`,finalPrompt:prompt,userPrompt:safetyFilter(input.userPrompt),remainingQuota:Math.max(0,q.remaining-1)}
  })
}

module.exports={quota,safetyFilter,buildPrompt,generate}
