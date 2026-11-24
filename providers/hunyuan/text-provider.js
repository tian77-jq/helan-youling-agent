const config=require('../../config/cloud')
function status(){return config.textMode==='HUNYUAN_MODE'?'HUNYUAN_ONLINE':'HUNYUAN_FALLBACK'}
function generate(input){return Promise.resolve({success:false,mode:status(),code:'TEXT_PROVIDER_REQUIRES_CLOUD_DEPLOYMENT',message:'文字 Provider 已就绪，待云端部署后启用',input})}
module.exports={status,generate}
