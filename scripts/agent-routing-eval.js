const {routeQuestion}=require('../utils/agent-router')

const cases=[
  ['为什么贺兰山有岩羊','ecology'],['宁夏有哪些自然生态','ecology'],['沙漠里的动物和植物','ecology'],['贺兰山地理特点','ecology'],['想了解湿地生态','ecology'],['岩羊适合什么环境','ecology'],['自然摄影去哪','ecology'],
  ['西夏陵为什么值得去','culture'],['贺兰山岩画讲什么','culture'],['宁夏历史故事','culture'],['有哪些民俗文化','culture'],['文物和西夏文明','culture'],['镇北堡的文化故事','culture'],['给孩子讲历史','culture'],
  ['第一次来银川吃什么','travel'],['两天路线怎么安排','travel'],['预算300元怎么规划','travel'],['吴忠有什么美食','travel'],['少走一点怎么改','travel'],['加入手抓羊肉','travel'],['旅行纪念怎么做','travel'],
  ['未知的星际景区在哪里','unknown'],['今天实时天气','unknown'],['票价多少','unknown'],['开放时间','unknown'],['景区交通','travel'],['路线和文化混合','culture'],['生态和美食混合','ecology'],['拍照识宁夏','travel'],['问萌宠规划','travel']
]

const results=cases.map(([question,expected])=>{const actual=routeQuestion(question).route;return {question,expected,actual,pass:actual===expected}})
const pass=results.filter(item=>item.pass).length
console.log(JSON.stringify({status:pass===30?'PASS':'PARTIAL',pass,total:30,results},null,2))
