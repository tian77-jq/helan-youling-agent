const cloudVision=require('./cloud-vision')
const {attractions,foods}=require('../../knowledge/index')

function recognize(filePath,locale){
  return cloudVision.recognizeImage(filePath,locale).catch(error=>{
    if(error&&error.message==='UNKNOWN_SCENE')return {status:'UNKNOWN',reason:'UNKNOWN_SCENE'}
    throw error
  })
}

function entityById(id){
  return attractions.concat(foods).find(item=>item.id===id)||null
}

module.exports={recognize,entityById,friendlyError:cloudVision.friendlyError}
