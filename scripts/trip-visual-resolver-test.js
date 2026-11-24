const {resolveSegment}=require('../utils/trip-visual-resolver')
const cases=[
  ['helan-mountain','MOUNTAIN'],['helan-rock-painting','MOUNTAIN'],['lanshan-park','RIVER'],['xixia-tombs','RIVER'],['yellow-river','RIVER'],
  ['shahu','RIVER'],['shapotou','SHAPOTOU'],['route-66','DESERT'],['liupan-mountain','MOUNTAIN'],['zhongwei-star-sky','STAR'],
  ['西夏陵','RIVER'],['沙坡头','SHAPOTOU'],['66号公路','DESERT']
]
const failures=[]
cases.forEach(([value,scene],index)=>{
  const item=resolveSegment({id:value,name:value},index)
  if(!item.landmarkId||!item.sceneId||!item.sceneAsset)failures.push(`${value}: unresolved`)
  if(item.sceneAsset&&item.sceneAsset.scene!==scene)failures.push(`${value}: expected ${scene}, got ${item.sceneAsset.scene}`)
  if(item.region!=='NINGXIA')failures.push(`${value}: wrong region`)
})
if(failures.length){console.error(JSON.stringify({pass:false,failures},null,2));process.exit(1)}
console.log(JSON.stringify({pass:true,cases:cases.length,exactLandmarkCount:cases.length}))
