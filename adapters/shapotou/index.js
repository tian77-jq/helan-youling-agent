const profile=require('./scenic-profile')
const experiences=require('./experience-types')
const stories=require('./stories')
const knowledge=require('./knowledge')
const memoryTemplates=require('./memory-templates')
const shareTemplates=require('./share-templates')
const integration=require('./integration-config')
module.exports={
  scenicId:'shapotou',
  getProfile:()=>Object.assign({},profile,{rightsMode:'INDEPENDENT_POC'}),
  getExperienceCatalog:()=>experiences,
  getStoryCatalog:()=>stories,
  getTripPolicy:()=>({supportedDurations:['half-day','one-day','two-day-context'],paceModes:['relaxed','balanced','active'],realtimeDefault:'SAFE_UNKNOWN'}),
  getCharacterPolicy:()=>({characters:profile.characters,mode:'optional',officialBrandClaim:false}),
  getTheme:()=>profile.visualTheme,
  getKnowledgeScope:()=>knowledge,
  getMemoryTemplates:()=>memoryTemplates,
  getShareTemplates:()=>shareTemplates,
  getIntegrationConfig:()=>integration,
  rightsProfile:{mode:'INDEPENDENT_POC',officialLogo:false,buyerPrivateApi:false,buyerPrivateData:false,officialBrandClaim:false}
}
