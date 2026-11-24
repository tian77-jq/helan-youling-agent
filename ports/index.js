/** @typedef {{ask:function(Object):Promise<Object>}} TextModelPort */
/** @typedef {{generate:function(Object):Promise<Object>}} ImageModelPort */
/** @typedef {{retrieve:function(String,Object):Promise<Array>}} KnowledgePort */
/** @typedef {{read:function(String,Object):Promise<Object>}} RealtimePort */
/** @typedef {{save:function(Object,Object):Promise<void>,read:function(Object,Object):Promise<Object>}} StoragePort */
module.exports={TextModelPort:'TextModelPort',ImageModelPort:'ImageModelPort',KnowledgePort:'KnowledgePort',RealtimePort:'RealtimePort',StoragePort:'StoragePort',SharePort:'SharePort',AnalyticsPort:'AnalyticsPort',ScenicConfigPort:'ScenicConfigPort',UserStatePort:'UserStatePort',ClockPort:'ClockPort'}
