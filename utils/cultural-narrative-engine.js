const {stories}=require('../knowledge/story-universe')
const byId=stories.reduce((map,story)=>(map[story.storyId]=story,map),{})
function listStories(){return stories.map(story=>Object.assign({},story,{cardTitle:story.title,cardHook:story.hook,character:story.narrator}))}
function getStory(id){return byId[id]||null}
function storiesForCharacter(character){return stories.filter(story=>story.narrator===character)}
function buildLevels(story){if(!story)return[];return [
  {level:1,label:'先被吸引',title:story.hook,text:story.hook},
  {level:2,label:'听懂故事',title:'核心故事',text:story.narrative},
  {level:3,label:'理解文化',title:'为什么重要',text:story.whyItMatters},
  {level:4,label:'继续深挖',title:'事实与地点',text:story.facts.join('；')},
  {level:5,label:'去做一件事',title:'现在就行动',text:story.action}
]}
function buildCreatePrompt(story,scene,style){return `以《${story.title}》为主题，围绕${scene||story.location}创作一张${style||'宁夏文化纪念卡'}。视觉符号：${story.visualSymbol}。避免凭空添加未核验史实，突出“${story.theme}”与当代旅行行动。`}
module.exports={listStories,getStory,storiesForCharacter,buildLevels,buildCreatePrompt}
