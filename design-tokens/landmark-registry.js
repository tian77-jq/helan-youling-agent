const landmarks=[
  {landmarkId:'helan-mountain',officialName:'贺兰山',city:'银川',visualSceneId:'MOUNTAIN',character:'yanYang',aiActions:['SEE','ASK','STORY'],knowledgeScope:'NINGXIA',tripPolicy:'SAFE_UNKNOWN',storyIds:['helan-ecology'],memoryTemplate:'mountain-first-light',rightsProfile:'PROJECT_ORIGINAL_SCENE'},
  {landmarkId:'helan-rock-painting',officialName:'贺兰山岩画',city:'银川',visualSceneId:'MOUNTAIN',character:'luoTuo',aiActions:['SEE','ASK','STORY','REMEMBER'],knowledgeScope:'YINCHUAN',tripPolicy:'SAFE_UNKNOWN',storyIds:['helan-rock-art'],memoryTemplate:'rock-art-trace',rightsProfile:'FACTUAL_REFERENCE_ONLY'},
  {landmarkId:'lanshan-park',officialName:'览山公园',city:'银川',visualSceneId:'RIVER',character:'shaHu',aiActions:['SEE','ASK','PLAN','SHARE'],knowledgeScope:'YINCHUAN',tripPolicy:'SAFE_UNKNOWN',storyIds:['yinchuan-sunset'],memoryTemplate:'silver-city-sunset',rightsProfile:'FACTUAL_REFERENCE_ONLY'},
  {landmarkId:'xixia-tombs',officialName:'西夏陵',city:'银川',visualSceneId:'RIVER',character:'luoTuo',aiActions:['SEE','ASK','STORY','REMEMBER'],knowledgeScope:'YINCHUAN',tripPolicy:'SAFE_UNKNOWN',storyIds:['xixia-memory'],memoryTemplate:'civilization-trace',rightsProfile:'FACTUAL_REFERENCE_ONLY'},
  {landmarkId:'yellow-river',officialName:'黄河',city:'宁夏',visualSceneId:'RIVER',character:'luoTuo',aiActions:['SEE','ASK','STORY'],knowledgeScope:'NINGXIA',tripPolicy:'SAFE_UNKNOWN',storyIds:['yellow-river-culture'],memoryTemplate:'river-memory',rightsProfile:'FACTUAL_REFERENCE_ONLY'},
  {landmarkId:'shahu',officialName:'沙湖',city:'石嘴山',visualSceneId:'RIVER',character:'yanYang',aiActions:['SEE','ASK','PLAN'],knowledgeScope:'SHIZUISHAN',tripPolicy:'SAFE_UNKNOWN',storyIds:[],memoryTemplate:'sand-water-memory',rightsProfile:'FACTUAL_REFERENCE_ONLY'},
  {landmarkId:'shapotou',officialName:'沙坡头',city:'中卫',visualSceneId:'SHAPOTOU',character:'shaHu',aiActions:['SEE','ASK','PLAN','STORY','CREATE','REMEMBER','SHARE'],knowledgeScope:'ZHONGWEI',tripPolicy:'SHAPOTOU_SAFE_UNKNOWN',storyIds:['shapotou-river-to-stars'],memoryTemplate:'river-desert-stars',rightsProfile:'PROJECT_ORIGINAL_SCENE'},
  {landmarkId:'route-66',officialName:'66号公路',city:'中卫',visualSceneId:'DESERT',character:'shaHu',aiActions:['SEE','ASK','PLAN','SHARE'],knowledgeScope:'ZHONGWEI',tripPolicy:'SAFE_UNKNOWN',storyIds:[],memoryTemplate:'road-depth',rightsProfile:'FACTUAL_REFERENCE_ONLY'},
  {landmarkId:'liupan-mountain',officialName:'六盘山',city:'固原',visualSceneId:'MOUNTAIN',character:'yanYang',aiActions:['SEE','ASK','STORY'],knowledgeScope:'GUYUAN',tripPolicy:'SAFE_UNKNOWN',storyIds:[],memoryTemplate:'mountain-forest',rightsProfile:'FACTUAL_REFERENCE_ONLY'},
  {landmarkId:'zhongwei-star-sky',officialName:'中卫大漠星空',city:'中卫',visualSceneId:'STAR',character:'shaHu',aiActions:['SEE','ASK','CREATE','REMEMBER','SHARE'],knowledgeScope:'ZHONGWEI',tripPolicy:'SAFE_UNKNOWN',storyIds:[],memoryTemplate:'desert-stars',rightsProfile:'PROJECT_ORIGINAL_SCENE'}
]

function getLandmark(id){return landmarks.find(item=>item.landmarkId===id)||null}
const translations={
  'helan-mountain':['Helan Mountain','贺兰山 · سلسلة جبلية'],
  'helan-rock-painting':['Helan Mountain Rock Art','贺兰山岩画 · فنون صخرية'],
  'lanshan-park':['Lanshan Park','览山公园 · حديقة'],
  'xixia-tombs':['Western Xia Imperial Tombs','西夏陵 · أضرحة شيا الغربية'],
  'yellow-river':['Yellow River','النهر الأصفر'],
  shahu:['Shahu Lake','沙湖 · بحيرة'],
  shapotou:['Shapotou Scenic Area','沙坡头 · منطقة سياحية صحراوية'],
  'route-66':['Highway 66','66号公路 · طريق صحراوي'],
  'liupan-mountain':['Liupan Mountain','六盘山 · سلسلة جبلية'],
  'zhongwei-star-sky':['Zhongwei Desert Night Sky','中卫大漠星空 · سماء الصحراء ليلاً']
}
landmarks.forEach(item=>{const names=translations[item.landmarkId]||[item.officialName,item.officialName];item.officialNameZh=item.officialName;item.displayNameEn=names[0];item.displayNameAr=names[1]})
function displayName(id,locale){const item=getLandmark(id);if(!item)return '';return locale==='en-US'?item.displayNameEn:locale==='ar'?item.displayNameAr:item.officialNameZh}
module.exports={landmarks,getLandmark,displayName}
