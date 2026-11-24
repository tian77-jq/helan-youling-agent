const SCENES={
  mountain:{id:'mountain',label:'山',meaning:'看见宁夏',lens:'rock-goat',accent:'#174f50'},
  river:{id:'river',label:'河',meaning:'走进宁夏',lens:'sand-fox',accent:'#2d7180'},
  desert:{id:'desert',label:'沙',meaning:'带走宁夏',lens:'sand-fox',accent:'#a56e38'},
  star:{id:'star',label:'星',meaning:'记住宁夏',lens:'camel',accent:'#596080'}
}
const MEMORY_LAWS=['导航就是故事','景观就是界面','IP就是理解宁夏的视角','AI就是行动','记忆就是留存']
function getScene(id){return SCENES[id]||SCENES.mountain}
module.exports={SCENES,MEMORY_LAWS,getScene}
