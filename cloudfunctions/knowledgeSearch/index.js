exports.main=async function(event){return {success:false,code:'KNOWLEDGE_SEARCH_NOT_DEPLOYED',message:'知识检索云函数尚未启用，请使用本地知识库。',query:event&&event.query||''}}
