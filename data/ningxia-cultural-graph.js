const nodes=[
  ['helan-mountain','PLACE','贺兰山'],['yellow-river','PLACE','黄河宁夏段'],['xixia-tombs','PLACE','西夏陵'],['shapotou','PLACE','沙坡头'],['xixia','CULTURE','西夏文化'],['silk-road','CULTURE','丝路交流'],['rock-goat','IP_CHARACTER','yanYang'],['camel','IP_CHARACTER','luoTuo'],['sand-fox','IP_CHARACTER','shaHu'],['eight-treasure-tea','FOOD','八宝茶'],['ningxia-heritage','CRAFT','宁夏非遗']
].map(([id,type,name])=>({id,type,name}))
const edges=[
  ['rock-goat','NARRATED_BY','mountain'],['camel','NARRATED_BY','civilization'],['sand-fox','NARRATED_BY','night'],['helan-mountain','RELATED_TO','rock-goat'],['yellow-river','RELATED_TO','river'],['xixia-tombs','RELATED_TO','xixia'],['shapotou','RELATED_TO','desert'],['xixia','RELATED_TO','silk-road'],['eight-treasure-tea','CAN_EXPERIENCE_AT','yinchuan'],['ningxia-heritage','RELATED_TO','craft']
].map(([from,relation,to])=>({from,relation,to}))
const timePlaceAxis=[
  {axisId:'nature',label:'山河形成',time:'远古自然与地质',placeIds:['helan-mountain','yellow-river'],storyId:'mountain'},
  {axisId:'trace',label:'人留下痕迹',time:'岩画与早期人类文化',placeIds:['helan-rock-painting'],storyId:'rock-art'},
  {axisId:'exchange',label:'文明相遇',time:'黄河生活与丝路交流',placeIds:['yellow-river','xixia-tombs'],storyId:'route'},
  {axisId:'xixia',label:'王朝与文字',time:'西夏时期',placeIds:['xixia-tombs'],storyId:'civilization'},
  {axisId:'today',label:'今天的宁夏',time:'当代生活、旅行与共创',placeIds:['shapotou','lanshan-park'],storyId:'night'}
]
module.exports={nodes,edges,timePlaceAxis}
