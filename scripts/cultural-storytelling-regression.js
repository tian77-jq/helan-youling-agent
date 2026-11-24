const assert=require('assert')
const engine=require('../utils/cultural-narrative-engine')
const {stories}=require('../knowledge/story-universe')
const required=['storyId','title','hook','narrator','location','era','theme','facts','narrative','whyItMatters','visualSymbol','interaction','relatedPlaces','relatedStories','action','knowledgeIds']
const cases=[]
function check(name,fn){cases.push({name,fn})}
stories.forEach(story=>{
  required.forEach(field=>check(`${story.storyId}:${field}`,()=>assert(story[field]!==undefined&&story[field]!==null)))
  check(`${story.storyId}:five-levels`,()=>assert.strictEqual(engine.buildLevels(story).length,5))
  check(`${story.storyId}:character`,()=>assert(['yanYang','shaHu','luoTuo'].includes(story.narrator)))
  check(`${story.storyId}:action`,()=>assert(story.action.length>8))
  check(`${story.storyId}:places`,()=>assert(story.relatedPlaces.length>0))
  check(`${story.storyId}:knowledge`,()=>assert(story.knowledgeIds.length>0))
  check(`${story.storyId}:create-prompt`,()=>assert(engine.buildCreatePrompt(story).includes(story.title)))
})
for(let i=0;i<16;i++){
  const story=stories[i%stories.length]
  check(`journey-link-${i+1}`,()=>assert(engine.getStory(story.storyId).relatedPlaces.includes(story.relatedPlaces[0])))
  check(`level-order-${i+1}`,()=>assert.deepStrictEqual(engine.buildLevels(story).map(x=>x.level),[1,2,3,4,5]))
}
let failed=0
for(const item of cases){try{item.fn()}catch(error){failed++;console.error(`FAIL ${item.name}: ${error.message}`)}}
console.log(`CULTURAL_STORY_REGRESSION: ${cases.length-failed}/${cases.length} PASS`)
if(failed)process.exitCode=1
