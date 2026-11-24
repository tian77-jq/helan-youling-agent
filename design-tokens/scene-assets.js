const sceneAssets={
  MOUNTAIN:['NX_HELAN_SKY','NX_HELAN_FAR_RIDGE','NX_HELAN_MID_RIDGE','NX_RIVER_LIGHT'],
  RIVER:['NX_RIVER_SPINE','NX_RIVER_NODE'],
  DESERT:['NX_DESERT_FRONT','NX_DESERT_BACK'],
  STAR:['NX_STAR_SKY','NX_MEMORY_STARS'],
  SHAPOTOU:['SPT_RIVER','SPT_RIVERBANK','SPT_DUNE_BACK','SPT_DUNE_FRONT','SPT_SUNSET_SKY','SPT_NIGHT_SKY','SPT_STAR_FIELD']
}
const registry={}
Object.keys(sceneAssets).forEach(scene=>sceneAssets[scene].forEach(id=>{registry[id]={id,scene,sourceType:'CSS_ORIGINAL',rightsStatus:'PROJECT_OWNED_ORIGINAL',usedBy:['theme-contract','core-scene-pages']}}))
const productionScenes=[
  ['NX_HELAN_HERO','helan-mountain','MOUNTAIN'],['NX_HELAN_ROCK_ART','helan-rock-painting','MOUNTAIN'],['NX_LANSHAN_SUNSET','lanshan-park','RIVER'],['NX_YELLOW_RIVER','yellow-river','RIVER'],
  ['NX_XIXIA','xixia-tombs','RIVER'],['NX_SHAHU','shahu','RIVER'],['NX_LIUPAN','liupan-mountain','MOUNTAIN'],
  ['NX_ROUTE66','route-66','DESERT'],['NX_ZHONGWEI_STAR','zhongwei-star-sky','STAR'],['SPT_RIVER_SCENE','shapotou','SHAPOTOU'],
  ['SPT_DESERT_SCENE','shapotou','SHAPOTOU'],['SPT_SUNSET_SCENE','shapotou','SHAPOTOU'],['SPT_STAR_SCENE','shapotou','SHAPOTOU']
].map(([sceneId,landmarkId,scene])=>({sceneId,landmarkId,scene,sourceType:'CSS_ORIGINAL',creator:'Scenic AI Engine',rightsStatus:'PROJECT_OWNED_ORIGINAL',referenceUrls:[],aiProvider:null,promptId:null,hash:'DECLARATIVE_CSS',usedBy:['core-scene-pages'],replaceable:true}))
productionScenes.forEach(item=>{registry[item.sceneId]=item})
module.exports={sceneAssets,registry,productionScenes}
