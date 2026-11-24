module.exports={
  LLM_PROVIDER:{ask:'(request, context) => Promise<Response>'},
  IMAGE_PROVIDER:{generate:'(request, context) => Promise<ImageResult>'},
  KNOWLEDGE_PROVIDER:{retrieve:'(query, scope) => Promise<Evidence[]>'},
  REALTIME_PROVIDER:{read:'(query, scope) => Promise<RealtimeData>'},
  STORAGE_PROVIDER:{save:'(event, policy) => Promise<void>',read:'(query, policy) => Promise<Data>'}
}
