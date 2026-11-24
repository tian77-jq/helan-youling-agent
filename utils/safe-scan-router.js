const ROUTES={
  landmark:id=>`/feature/attraction/detail?id=${encodeURIComponent(id)}`,
  story:id=>`/feature/ip/detail?storyId=${encodeURIComponent(id)}`,
  memory:()=>'/feature/memory/index',
  product:id=>`/feature/shop/detail?id=${encodeURIComponent(id)}`
}
const ALLOWED_TYPES=Object.keys(ROUTES)

function resolve(raw){
  const value=String(raw||'').trim()
  const match=value.match(/^helan:\/\/(landmark|story|memory|product)\/([A-Za-z0-9_-]+)$/i)
  if(!match)return {ok:false,reason:'UNSUPPORTED_CODE'}
  const type=match[1].toLowerCase();const id=match[2]
  return {ok:true,type,id,url:ROUTES[type](id)}
}

module.exports={ALLOWED_TYPES,resolve}
