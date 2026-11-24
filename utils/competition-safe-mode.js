const FRIENDLY={CLOUD_AI_UNAVAILABLE:'灵灵刚刚开了个小差，已切换到本地宁夏知识库。',CLOUD_AI_TIMEOUT:'灵灵响应有点慢，已用本地知识库继续规划。',CLOUD_AI_INVALID_JSON:'灵灵没有返回可核验的结构，已切换到本地知识库。',VISION_FEATURE_DISABLED:'AI识景仍在安全内测中，当前不会生成猜测结果。',VISION_PROVIDER_NOT_CONFIGURED:'AI识景服务尚未配置，暂不生成识别结论。',UNKNOWN_ENTITY:'当前知识库暂无可靠信息。'}
function userMessage(error){const code=error&&error.message||error;return FRIENDLY[code]||'灵灵刚刚开了个小差，请稍后再试。'}
function fallbackLabel(source){return source==='cloud'?'Cloud AI 意图理解 + 宁夏知识库':'本地宁夏知识库安全兜底'}
module.exports={userMessage,fallbackLabel,FRIENDLY}
