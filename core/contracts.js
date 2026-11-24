const CAPABILITIES=require('./capability-flags')
function createScenicProfile(input){return Object.assign({scenicId:'',name:'',region:'',destinationType:'',coreLandscapes:[],culturalThemes:[],experienceThemes:[],visitorSegments:[],recommendedDurations:[],lifecycleCapabilities:[],realtimeCapabilities:[],availableDataSources:[],characters:[],visualTheme:{},commercialHooks:[]},input||{})}
function createExperience(input){return Object.assign({experienceId:'',placeId:'',type:'',durationClass:'',visitorFit:[],timeOfDay:[],indoorOutdoor:'',intensity:'',storyIds:[],evidenceIds:[],realtimeRequired:false,bookableExternally:false,commercialLink:null},input||{})}
function createProviderContract(){return {llm:'server-side provider',image:'server-side provider',knowledge:'evidence-gated adapter',realtime:'optional adapter',storage:'buyer-controlled adapter'}}
module.exports={CAPABILITIES,createScenicProfile,createExperience,createProviderContract}
