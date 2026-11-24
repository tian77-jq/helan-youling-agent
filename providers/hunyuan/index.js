const text=require('./text-provider.js');const image=require('./image-provider.js')
module.exports={text,image,status:()=>({text:text.status(),image:'HUNYUAN_FALLBACK'})}
