const {sceneById,petById,styleById,outputById}=require('./studio-config')
const service=require('./studio-service')
const shareObject=require('../../utils/share-object-builder')
const imageComposition=require('../../utils/image-composition')

function wrapCanvasText(context,text,maxWidth,maxLines,fontSize){
  const source=Array.from(String(text||''));const lines=[];let line=''
  const measure=value=>{try{return context.measureText(value).width}catch(error){return Array.from(value).length*fontSize*0.65}}
  source.forEach(character=>{
    const candidate=line+character
    if(line&&measure(candidate)>maxWidth){
      const splitAt=line.lastIndexOf(' ')
      if(splitAt>0){lines.push(line.slice(0,splitAt));line=line.slice(splitAt+1)+character}
      else{lines.push(line.trimEnd());line=character===' '?'':character}
    }else line=candidate
  })
  if(line.trim())lines.push(line.trimEnd())
  if(lines.length>maxLines){lines.length=maxLines;lines[maxLines-1]=`${lines[maxLines-1].replace(/[.…]+$/,'')}…`}
  return lines
}

Page({
  data:{result:null,scene:null,pet:null,style:null,output:null,saving:false,markCanvasWidth:1,markCanvasHeight:1},
  onShow(){
    const result=wx.getStorageSync('helan_create_result')
    // 预览二维码可能直接打开结果页，但手机端没有开发者工具的本地缓存；
    // 不再回退到空白栈，统一回到创作首页让用户重新开始。
    if(!result)return wx.redirectTo({url:'/feature/create/index'})
    const scene=sceneById(result.scene),pet=petById(result.pet)
    const composition=imageComposition.buildComposition({location:scene.title,character:pet.name,quote:result.userPrompt,date:result.createdAt||new Date()})
    this.setData({result,scene,pet,style:styleById(result.style),output:outputById(result.outputType),composition})
  },
  preview(){
    const url=this.data.result&&this.data.result.imageUrl
    if(url)this.createMarkedImage(url).then(finalImage=>wx.previewImage({current:finalImage,urls:[finalImage]})).catch(error=>{console.warn('[AI_CREATE][PREVIEW_COMPOSE_FAIL]',error);wx.showToast({title:'预览排版暂不可用，请稍后重试',icon:'none'})})
  },
  resolveLocalImage(url){
    if(String(url).indexOf('cloud://')===0&&wx.cloud&&typeof wx.cloud.downloadFile==='function')return wx.cloud.downloadFile({fileID:url}).then(res=>res.tempFilePath)
    return new Promise((resolve,reject)=>wx.getImageInfo({src:url,success:res=>resolve(res.path),fail:reject}))
  },
  createMarkedImage(url){
    return this.resolveLocalImage(url).then(localPath=>new Promise((resolve,reject)=>{
      wx.getImageInfo({src:localPath,success:info=>{
        const maxEdge=1280
        const scale=Math.min(1,maxEdge/Math.max(info.width,info.height))
        const width=Math.max(1,Math.round(info.width*scale))
        const height=Math.max(1,Math.round(info.height*scale))
        this.setData({markCanvasWidth:width,markCanvasHeight:height},()=>{
          const context=wx.createCanvasContext('aiMarkedCanvas',this)
          context.drawImage(localPath,0,0,width,height)
          const composition=this.data.composition||imageComposition.buildComposition({location:'宁夏',date:new Date()})
          const rtl=Boolean(composition.isRtl)
          const fontSize=Math.max(22,Math.round(Math.min(width,height)*0.032))
          const smallSize=Math.max(17,Math.round(fontSize*0.62))
          const padding=Math.max(20,Math.round(fontSize*0.72))
          const title=composition.title
          const meta=[composition.location,composition.character].filter(Boolean).join(' · ')
          const dateLine=`${composition.dateLabel} · ${composition.date}`
          const quote=composition.quote?`${composition.quoteLabel} · ${composition.quote}`:''
          const entries=[{text:title,size:fontSize,max:2},meta&&{text:meta,size:smallSize,max:1},quote&&{text:quote,size:smallSize,max:2},{text:dateLine,size:smallSize,max:1},{text:composition.generated,size:smallSize,max:2}].filter(Boolean)
          const rendered=entries.map(entry=>{context.setFontSize(entry.size);return {size:entry.size,lines:wrapCanvasText(context,entry.text,width-padding*2,entry.max,entry.size)}})
          const bandHeight=padding*2+rendered.reduce((total,entry)=>total+entry.size*entry.lines.length+Math.round(entry.size*0.4),0)
          context.setFillStyle('rgba(0,0,0,0.72)')
          context.fillRect(0,Math.max(0,height-bandHeight),width,bandHeight)
          context.setFillStyle('#ffffff')
          if(typeof context.setDirection==='function')context.setDirection(rtl?'rtl':'ltr')
          context.setTextAlign(rtl?'right':'left')
          context.setTextBaseline('top')
          let y=Math.max(padding,height-bandHeight+padding)
          rendered.forEach(entry=>{context.setFontSize(entry.size);entry.lines.forEach(line=>{context.fillText(line,rtl?width-padding:padding,y);y+=entry.size+Math.round(entry.size*0.4)})})
          context.draw(false,()=>wx.canvasToTempFilePath({canvasId:'aiMarkedCanvas',x:0,y:0,width,height,destWidth:width,destHeight:height,fileType:'jpg',quality:0.9,success:res=>resolve(res.tempFilePath),fail:reject},this))
        })
      },fail:reject})
    }))
  },
  save(){
    const url=this.data.result&&this.data.result.imageUrl
    if(!url||this.data.saving)return
    this.setData({saving:true})
    return this.createMarkedImage(url)
      .then(filePath=>new Promise((resolve,reject)=>wx.saveImageToPhotosAlbum({filePath,success:resolve,fail:reject})))
      .then(()=>wx.showToast({title:'已保存含AI标识图片',icon:'success'}))
      .catch(error=>{
        const denied=/auth deny|authorize|permission/i.test(error&&error.errMsg||'')
        wx.showToast({title:denied?'请授权保存到相册':'图片处理失败，请稍后重试',icon:'none'})
      })
      .finally(()=>this.setData({saving:false}))
  },
  share(){wx.showToast({title:'请点击右上角分享作品',icon:'none'})},
  again(){
    const input=this.data.result
    if(!input)return
    this.setData({saving:true})
    service.generate(Object.assign({},input,{regenerate:true})).then(result=>{
      const next=Object.assign({},input,result)
      wx.setStorageSync('helan_create_result',next)
      this.setData({result:next,saving:false})
    }).catch(error=>{this.setData({saving:false});wx.showToast({title:error.message||'今日额度已用完',icon:'none'})})
  },
  backConfig(){wx.navigateTo({url:'/feature/create/config?scene='+(this.data.result&&this.data.result.scene||'xixia')})},
  onShareAppMessage(){const result=this.data.result||{};const object=shareObject.build({type:'memory',objectId:result.id||'create-memory',title:`我的宁夏纪念作品 · ${this.data.pet&&this.data.pet.name||'贺兰灵境'}`,subtitle:'AI生成 / 合成内容',scene:'desert',character:this.data.pet&&this.data.pet.name,image:result.imageUrl,sharePath:'/feature/create/index',aiGenerated:true});return shareObject.toShareMeta(object)}
})
