exports.main=async function(event){return {success:false,code:'TRIP_PLANNER_NOT_DEPLOYED',message:'行程规划云函数尚未启用，请使用本地知识库降级方案。',request:event&&event.request||{}}}
