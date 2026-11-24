const FACTS=[
  {patterns:[/宁夏.*大学|大学.*宁夏|宁夏.*高校|有名.*大学/],answer:'宁夏较有代表性的高校包括宁夏大学、北方民族大学和宁夏医科大学。宁夏大学是综合性大学；北方民族大学位于银川，具有民族学科和多学科办学特色；宁夏医科大学以医学教育为主。招生、专业和录取信息会变化，准备报考时应以各校官网最新公告为准。',ids:['ningxia-universities']},
  {patterns:[/人生如梦.*下一句|人生如梦.*下句/],answer:'“人生如梦”的下一句通常是“⼀尊还酹江月”，出自苏轼《念奴娇·赤壁怀古》。如果你想问的是“人生若只如初见”，下一句则是“何事秋风悲画扇”。这两句很容易混淆。',ids:[]}
]
function answerFor(question){
  const item=FACTS.find(value=>value.patterns.some(pattern=>pattern.test(String(question||''))))
  return item?{answer:item.answer,knowledgeIds:item.ids,type:'FACT',evidence:'curated_general_fact'}:null
}
module.exports={answerFor}
