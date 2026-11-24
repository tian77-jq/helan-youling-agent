const regions={
  mountain:{regionId:'mountain',label:'山',sceneTheme:'MOUNTAIN',character:'yanYang',landmarkIds:['helan-mountain','liupan-mountain','firestone-village'],constellationLayout:'RIDGE',entryMotion:'MOUNTAIN_PORTAL',emptyState:'你的宁夏，还在等第一颗山之星。',memoryFilter:item=>['helan-mountain','liupan-mountain','firestone-village'].includes(item.landmarkId)},
  river:{regionId:'river',label:'河',sceneTheme:'RIVER',character:'luoTuo',landmarkIds:['yellow-river','yellow-river-canyon','lanshan-park'],constellationLayout:'FLOW',entryMotion:'RIVER_PORTAL',emptyState:'黄河的光，正在等你留下。',memoryFilter:item=>['yellow-river','yellow-river-canyon','yellow-river-ancient-ferry','lanshan-park'].includes(item.landmarkId)},
  desert:{regionId:'desert',label:'沙',sceneTheme:'DESERT',character:'shaHu',landmarkIds:['shapotou','tengger-desert','route-66','zhongwei-star-sky'],constellationLayout:'DUNE',entryMotion:'DESERT_PORTAL',emptyState:'沙丘之间，还没有你的脚印。',memoryFilter:item=>['shapotou','tengger-desert','66-highway','route-66','zhongwei-star-sky'].includes(item.landmarkId)}
}
function getRegion(id){return regions[id]||regions.mountain}
module.exports={regions,getRegion}
