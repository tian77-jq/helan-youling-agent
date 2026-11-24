const {attractions}=require('../knowledge')
const tripAgent=require('../utils/trip-agent')

function minutes(value){const match=String(value||'').match(/(\d{1,2}):(\d{2})/);return match?Number(match[1])*60+Number(match[2]):-1}
function itemsFor(query){return tripAgent.planTrip(tripAgent.parseConstraints(query,'zh-CN'),{locale:'zh-CN'}).days.flatMap(day=>day.items)}

function main(){
  const rows=[]
  attractions.forEach(item=>{
    const items=itemsFor(`安排一天游览${item.name['zh-CN']}，两个人`)
    const target=items.find(value=>value.id===item.id)
    const ordered=items.map(value=>minutes(value.time)).every((value,index,list)=>index===0||value>=list[index-1])
    const attractionsAtNight=items.filter(value=>value.type==='attraction'&&value.id!=='lanshan-park'&&minutes(value.time)>=18*60)
    const lunch=items.find(value=>value.type==='food')
    rows.push({case:'默认时段合理',id:item.id,targetTime:target&&target.time,ordered,lunch:lunch&&lunch.time,nightAttractions:attractionsAtNight.map(value=>value.id),pass:Boolean(target)&&ordered&&Boolean(lunch)&&minutes(lunch.time)>=11*60&&minutes(lunch.time)<=14*60&&attractionsAtNight.length===0&&(item.id!=='lanshan-park'||target.time==='18:30')})
  })
  const morning=itemsFor('安排一天游览览山公园，父母同行，上午去览山公园').find(value=>value.id==='lanshan-park')
  const afternoon=itemsFor('安排一天游览览山公园，父母同行，下午去览山公园').find(value=>value.id==='lanshan-park')
  rows.push({case:'明确上午览山被尊重',time:morning&&morning.time,pass:morning&&morning.time==='09:00'})
  rows.push({case:'明确下午览山被尊重',time:afternoon&&afternoon.time,pass:afternoon&&afternoon.time==='14:30'})
  const afternoonTombs=itemsFor('安排一天游览西夏陵，父母同行，下午去西夏陵').find(value=>value.id==='xixia-tombs')
  const eveningFilm=itemsFor('安排一天游览镇北堡西部影城，两个人，晚上去镇北堡西部影城').find(value=>value.id==='zhenbeibao')
  rows.push({case:'明确下午景点被尊重',time:afternoonTombs&&afternoonTombs.time,pass:afternoonTombs&&afternoonTombs.time==='14:30'})
  rows.push({case:'明确晚上景点被尊重',time:eveningFilm&&eveningFilm.time,pass:eveningFilm&&eveningFilm.time==='18:30'})
  const failed=rows.filter(row=>!row.pass)
  console.log(JSON.stringify({status:failed.length?'BLOCKED':'READY_FOR_WECHAT_HUMAN_TEST',total:rows.length,passed:rows.length-failed.length,failed},null,2))
  if(failed.length)process.exitCode=1
}

main()
