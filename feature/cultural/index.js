const tracker=require('../../utils/tracker')
const runtimeState=require('../../utils/runtime-state')
const navigation=require('../../utils/navigation')
const game=require('./game-data')
const ai=require('../../utils/ai-orchestrator')

Page({
  data:{levels:game.levels,level:null,task:null,taskIndex:0,selected:-1,answer:'',feedback:'',score:null,progress:{completedLevels:[],badges:[],challengeHistory:[]},agent:game.getAgent('sand-fox'),drama:game.drama,dramaScene:null,dramaUnlocked:false,dramaDone:false},
  onLoad(){this.refresh()},
  refresh(){const progress=runtimeState.get('culturalProgress',{completedLevels:[],badges:[],challengeHistory:[]});this.setData({progress,dramaUnlocked:progress.badges.includes(game.drama.badge),dramaScene:progress.badges.includes(game.drama.badge)?game.drama.scenes[0]:null})},
  startLevel(e){const level=game.getLevel(e.currentTarget.dataset.level);tracker.trackEvent('challenge_start',{level:level.id});this.setData({level,task:level.tasks[0],taskIndex:0,selected:-1,answer:'',feedback:'',score:null,agent:game.getAgent(level.agent)})},
  choose(e){this.setData({selected:Number(e.currentTarget.dataset.index)})},
  input(e){this.setData({answer:e.detail.value})},
  submit(){
    const task=this.data.task;if(!task)return
    let result
    if(task.type==='choice'){const correct=this.data.selected===task.answer;result={correct,feedback:correct?'回答抓住了知识库的关键。':'这项选择与当前知识库证据不一致。'+task.explain,score:correct?100:35,unsupportedClaims:[]}}
    else{result=game.scoreOpen(task,this.data.answer);result.correct=result.score>=60;result.feedback+=result.unsupportedClaims.length?' '+result.unsupportedClaims.join(''):''}
    this.setData({feedback:result.feedback,score:result})
    tracker.trackEvent(task.type==='open'?'open_answer':'question_answer',{level:this.data.level.id,taskId:task.id,correct:!!result.correct})
    if(task.type==='open')ai.evaluateOpenAnswer(this.data.answer,task,runtimeState.get('locale','zh-CN')).then(value=>{if(value)this.setData({score:Object.assign({},value,{correct:value.score>=60}),feedback:value.feedback})}).catch(()=>{})
    else ai.askPet(task.explain,runtimeState.get('locale','zh-CN'),task.evidenceIds[0]).catch(()=>{})
  },
  next(){const level=this.data.level;const nextIndex=this.data.taskIndex+1;if(nextIndex<level.tasks.length){this.setData({taskIndex:nextIndex,task:level.tasks[nextIndex],selected:-1,answer:'',feedback:'',score:null});return}const progress=this.data.progress;const completed=progress.completedLevels.includes(level.id)?progress.completedLevels:progress.completedLevels.concat(level.id);const badges=progress.badges.includes(level.badge)?progress.badges:progress.badges.concat(level.badge);const nextProgress={completedLevels:completed,badges,challengeHistory:(progress.challengeHistory||[]).concat({level:level.id,completedAt:new Date().toISOString()})};runtimeState.set('culturalProgress',nextProgress);tracker.trackEvent('challenge_complete',{level:level.id});tracker.trackEvent('badge_unlock',{badge:level.badge});this.setData({progress:nextProgress,level:null,task:null,feedback:'',score:null,dramaUnlocked:badges.includes(game.drama.badge),dramaScene:badges.includes(game.drama.badge)?game.drama.scenes[0]:null})},
  dramaChoose(e){const next=this.data.dramaScene.choices.find(x=>x.id===e.currentTarget.dataset.choice);if(!next)return;if(next.next==='end'){this.setData({dramaDone:true});tracker.trackEvent('drama_complete',{dramaId:game.drama.id});return}this.setData({dramaScene:game.drama.scenes.find(x=>x.id===next.next)||this.data.dramaScene});tracker.trackEvent('drama_start',{dramaId:game.drama.id})},
  shareDrama(){tracker.trackEvent('drama_share',{dramaId:game.drama.id});wx.showToast({title:'已准备分享',icon:'success'})},
  goMy(){navigation.switchTab('/pages/admin/index')},goShop(){navigation.switchTab('/pages/shop/index')}
})
