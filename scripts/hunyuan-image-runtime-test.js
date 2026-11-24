const assert=require('assert')
const config=require('../config/cloud')
const cloudbaseConfig=require('../cloudbaserc.json')
assert.strictEqual(config.imageMode,'HUNYUAN_MODE','Hunyuan image mode remains the active runtime provider')
assert.strictEqual(config.imageFunctionName,'generateImage')
assert.ok(cloudbaseConfig.functions.find(item=>item.name==='generateImage').timeout>=60,'repository deployment config gives image generation a 60s budget')
let callCount=0
let captured
global.wx={cloud:{init(){},callFunction(options){callCount+=1;captured=options;return Promise.resolve({result:{success:true,provider:'hunyuan-node-sdk',source:'HUNYUAN_MODE',imageUrl:'https://image.example.test/generated.jpg',fileID:'cloud://test/generated.jpg',model:'HY-Image-3.0-Plus-4090-Tob-v1.0'}})}}}
const imageService=require('../services/image-service')

imageService.generateImage({prompt:'宁夏贺兰山文化旅行纪念卡',scene:'贺兰山',culture:'西夏文化',pet:'岩羊',style:'旅行海报'}).then(result=>{
  assert.strictEqual(callCount,1,'image service reaches the registered cloud function provider')
  assert.strictEqual(captured.name,'generateImage')
  assert.ok(captured.data.prompt.length>0)
  assert.strictEqual(result.success,true)
  assert.strictEqual(result.source,'HUNYUAN_MODE')
  assert.strictEqual(result.imageUrl,'https://image.example.test/generated.jpg')
  assert.strictEqual(result.fileID,'cloud://test/generated.jpg')
  console.log('HUNYUAN_IMAGE_RUNTIME_TEST PASS: HUNYUAN_MODE active; configured 60s CloudBase budget; image-service → generateImage contract; result and persistent file ID preserved (mocked CloudBase response)')
}).catch(error=>{console.error(error);process.exitCode=1})
