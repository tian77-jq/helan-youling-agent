module.exports={
  envId:'cloudbase-d6g1u2dzk45c62fc1',
  AI_MODE:'hybrid',
  cloudAiProvider:'cloudbase',
  cloudAiModel:'hy3',
  textModelRouting:{primary:'cloudbase',secondary:'coding-plan',active:'cloudbase',fallbackMode:'manual',autoFailover:false},
  codingPlanFunctionName:'codingPlanProxy',
  codingPlanModel:'Deepseek-v4-flash',
  providerCapabilities:{
    cloudbase:{provider:'cloudbase',model:'hy3',text:true,toolCalling:true,imageInput:true,reasoning:true,contextLimit:'provider-managed'},
    'coding-plan':{provider:'coding-plan',model:'Deepseek-v4-flash',text:true,toolCalling:true,imageInput:true,reasoning:true,contextLimit:200000}
  },
  textModelRealId:'',
  textModelEndpoint:'CloudBase AI.createModel',
  VISION_MODE:'HUNYUAN_ENABLED',
  visionModes:{LOCAL_ONLY:'LOCAL_ONLY',HUNYUAN_ENABLED:'HUNYUAN_ENABLED',FALLBACK_MODE:'FALLBACK_MODE'},
  hunyuanTravelImageFunctionName:'generateImage',
  imageFunctionName:'generateImage',
  imageProvider:'Tencent CloudBase',
  imageModel:'HY-Image-3.0-Plus-4090-Tob-v1.0',
  imageMode:'HUNYUAN_MODE',
  textMode:'LOCAL_DEMO_MODE',
  // 技术实现保留，但当前比赛版本不开放入口、不发起视觉模型请求，避免图片 token 成本。
  featureVisionEnabled:false,
  visionModel:'glm-5v-turbo',
  visionConfidenceThreshold:0.72,
  visionFunctionName:'visionRecognize'
}
