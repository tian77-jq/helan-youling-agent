const COPY={
  yanYang:{title:'灵灵的声音还在准备中',body:'声音还在准备中，先让我用文字陪你看看贺兰山。'},
  luoTuo:{title:'灵灵的声音还在准备中',body:'声音还在准备中，先让我用文字带你翻开宁夏的历史。'},
  shaHu:{title:'灵灵的声音还在准备中',body:'声音还在准备中，先让我用文字带你逛宁夏。'}
}
function copy(character){return COPY[character]||COPY.shaHu}
module.exports={copy}
