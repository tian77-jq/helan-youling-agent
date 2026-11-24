// SYNTHETIC_TEST_DATA: invented test content; no real buyer/platform affiliation.
const pipeline=require('../../services/knowledge-pipeline')
function install(){
 const common={updatedAt:'2026-09-05',sourceId:'SYNTHETIC_TEST_DATA',synthetic:true}
 const rows=[
 ['BUYER_TEST_HELAN_001','ScenicSpot','贺兰山亲子观察','银川','helan-mountain','合成测试资料：亲子观察主题为岩羊足迹和山地植物辨识，只在步道观察，不喂食野生动物。'],
 ['BUYER_TEST_SHAPOTOU_001','ScenicSpot','沙坡头亲子观察','中卫','shapotou','合成测试资料：亲子主题是黄河岸边观察与治沙草方格故事。轻松游以河岸观察为主；资料修订版推荐黄河观察，不采用旧版沙丘竞速主题。'],
 ['BUYER_TEST_WUZHONG_FOOD_001','Food','吴忠早茶风味','吴忠','wuzhong-food','合成测试资料：宁夏风味主题包含八宝茶与手抓羊肉，仅用于资料接入演示，不代表商家套餐或营业承诺。'],
 ['BUYER_TEST_XIXIA_STORY_001','Story','西夏文化线索','银川','xixia-tombs','合成测试资料：文化解说围绕西夏文字与陵区遗存展开，区分考古依据和文学想象。'],
 ['BUYER_TEST_EVENT_001','Event','沙坡头观察主题','中卫','shapotou','合成测试资料：草方格主题讲述防风固沙原理。这是虚构测试主题，不是正在举办的活动。']
 ].map(([id,type,name,city,landmarkId,content])=>Object.assign({},common,{id,type,name,city,landmarkId,claimKey:landmarkId,content}))
 return pipeline.ingest(rows,{tenantId:'synthetic-tenant',sourceId:'SYNTHETIC_TEST_DATA',synthetic:true})
}
module.exports={install,SYNTHETIC_TEST_DATA:true}
