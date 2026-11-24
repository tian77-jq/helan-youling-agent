// Build profiles are consumed by the release packaging job. The checked-in
// runtime remains the demo profile so local development never impersonates a
// production compliance build.
module.exports={
 development:{mode:'development',PUBLIC_GENERATIVE_AI:true,AI_QA:true,AI_TRIP_GENERATION:true,AI_IMAGE:true,HOST_DEMO:true,DEV_DIAGNOSTICS:true,SYNTHETIC_BUYER_DATA:true,ANALYTICS:false},
 demo:{mode:'demo',PUBLIC_GENERATIVE_AI:true,AI_QA:true,AI_TRIP_GENERATION:true,AI_IMAGE:true,HOST_DEMO:true,DEV_DIAGNOSTICS:false,SYNTHETIC_BUYER_DATA:true,ANALYTICS:false},
 review:{mode:'review',PUBLIC_GENERATIVE_AI:false,AI_QA:false,AI_TRIP_GENERATION:false,AI_IMAGE:false,HOST_DEMO:false,DEV_DIAGNOSTICS:false,SYNTHETIC_BUYER_DATA:false,ANALYTICS:false},
 production:{mode:'production',PUBLIC_GENERATIVE_AI:false,AI_QA:false,AI_TRIP_GENERATION:false,AI_IMAGE:false,HOST_DEMO:false,DEV_DIAGNOSTICS:false,SYNTHETIC_BUYER_DATA:false,ANALYTICS:true}
}
