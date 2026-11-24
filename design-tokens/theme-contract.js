const base=require('./regional-base')
const scenes=require('./scene-tokens')
const sceneAssets=require('./scene-assets')
function resolve(scene='MOUNTAIN',overrides={}){const key=String(scene).toUpperCase();return Object.assign({},base,scenes[key]||scenes.MOUNTAIN,{sceneAssetIds:sceneAssets.sceneAssets[key]||sceneAssets.sceneAssets.MOUNTAIN},overrides,{scene:key})}
module.exports={resolve,base,scenes}
