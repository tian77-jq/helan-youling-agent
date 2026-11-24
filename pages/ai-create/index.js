const imageService=require('../../services/image-service')
const analytics=require('../../services/analytics-service')
const narrative=require('../../utils/cultural-narrative-engine')
const imageComposition=require('../../utils/image-composition')

function friendlyError(result){
  const code=String(result&&result.code||'').toUpperCase()
  const detail=String(result&&result.detail||'').toUpperCase()
  if(code==='-504003'||code.indexOf('FUNCTIONS_TIME_LIMIT_EXCEEDED')>=0||detail.indexOf('FUNCTIONS_TIME_LIMIT_EXCEEDED')>=0)return '云函数超时：请稍后重试'
  if(code.indexOf('AUTH')>=0||code.indexOf('PERMISSION')>=0||detail.indexOf('UNAUTHORIZED')>=0)return '腾讯混元权限未开通，请检查云函数服务账号权限'
  if(code==='429'||code.indexOf('QUOTA')>=0||code.indexOf('LIMIT')>=0||detail.indexOf('429')>=0)return '腾讯混元当前触发限流或额度不足（429），请稍后重试'
  return (result&&result.message)||'AI创作暂时不可用，请稍后重试'
}

Page({
  data:{prompt:'',scene:'贺兰山',culture:'西夏文化',pet:'岩羊',style:'文旅纪念卡',storyId:'mountain',loading:false,error:'',promptObject:null,imageUrl:'',result:null},
  onLoad(options){const story=narrative.getStory(options&&options.storyId)||narrative.getStory('mountain');this.setData({storyId:story.storyId,scene:story.location},()=>this.setData({prompt:narrative.buildCreatePrompt(story,story.location,this.data.style)}))},
  input(e){this.setData({prompt:e.detail.value,error:''})},
  choose(e){
    const field=e.currentTarget.dataset.field
    const value=e.currentTarget.dataset.value
    const next=Object.assign({},this.data,{[field]:value})
    const story=narrative.getStory(next.storyId||this.data.storyId)||narrative.getStory('mountain')
    const prompt=narrative.buildCreatePrompt(story,next.scene,next.style)+` 使用${next.pet}原创萌宠IP，融入${next.culture}元素。`
    this.setData({[field]:value,prompt,error:'',promptObject:null,imageUrl:'',result:null})
    wx.nextTick(()=>this.setData({prompt}))
  },
  generate(){
    const prompt=String(this.data.prompt||'').trim()
    if(!prompt)return this.setData({error:'请先选择景区、文化、萌宠和风格，或输入提示词'})
    const input={scene:this.data.scene,culture:this.data.culture,pet:this.data.pet,style:this.data.style}
    console.log('[CREATE_INPUT]',{visualFields:Object.keys(input),textKeptForOverlay:Boolean(prompt)})
    this.setData({loading:true,error:'',promptObject:null,imageUrl:'',result:null})
    imageService.generateImage(input).then(result=>{
      analytics.track('work_generated',{mode:result.source||'LOCAL_DEMO_MODE',scene:input.scene})
      const imageUrl=result.imageUrl||''
      const errorText=result.success===false?friendlyError(result):''
      console.log('[CREATE_RUNTIME_RESULT]',{provider:result.provider,mode:result.source,status:result.success?'success':'failed',code:result.code,model:result.model,sdk:result.sdk,hasImageUrl:Boolean(imageUrl),detail:result.detail,rawError:result.rawError})
      const composition=imageComposition.buildComposition({location:this.data.scene,character:this.data.pet,quote:prompt})
      this.setData({promptObject:result.prompt,imageUrl,result,composition,loading:false,error:errorText})
    }).catch(error=>{console.error('[CREATE_RUNTIME_LOG]',error);this.setData({loading:false,error:'当前生成失败，请稍后重试'})})
  },
  saveWork(){
    const result=this.data.result
    if(!result||!this.data.imageUrl||String(result.provider||'').indexOf('hunyuan')!==0)return wx.showToast({title:'仅真实混元图片可保存',icon:'none'})
    const savedImage=result.fileID||this.data.imageUrl
    const work={id:'work-'+Date.now(),userId:'anonymous',theme:this.data.style,location:this.data.scene,scene:this.data.scene,culture:this.data.culture,pet:this.data.pet,prompt:this.data.prompt||'',composition:this.data.composition||null,image:savedImage,imageUrl:savedImage,fileID:result.fileID||'',provider:'hunyuan',sdk:result.sdk||'',model:result.model||'',createdAt:new Date().toISOString(),source:'HUNYUAN_MODE',commercialStatus:'PERSONAL_ONLY'}
    const works=wx.getStorageSync('digitalAssets')||[]
    works.push(work)
    wx.setStorageSync('digitalAssets',works.slice(-50))
    wx.showToast({title:'作品已保存',icon:'success'})
  }
})
