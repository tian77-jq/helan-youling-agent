const host=require('../adapters/integration/zhiyou-ningxia')
const scenic=host.normalizeOfficialRecord({poiId:'xixia-tombs',poiName:'西夏陵',city_name:'银川',businessHours:'以官方公告为准'})
const event=host.normalizeOfficialRecord({eventId:'event-1',title:'黄河文化活动',district:'吴忠'},'Event')
const catalog=host.normalizeCatalog([{spot_name:'沙坡头',spot_id:'shapotou',city_name:'中卫'},{poiName:'览山公园',poiId:'lanshan-park',district:'银川'}])
const entry=host.createEmbeddedEntry({contextId:'demo-1',returnPath:'/host/scenic/xixia-tombs'})
const returned=host.returnToHost({contextId:'demo-1',capability:'memory',resultRef:'memory-1',returnPath:'/host/scenic/xixia-tombs'})
const failures=[]
if(scenic.id!=='xixia-tombs'||scenic.name!=='西夏陵'||scenic.city!=='银川')failures.push('scenic field mapping')
if(event.type!=='Event'||event.city!=='吴忠')failures.push('event field mapping')
if(catalog.length!==2||catalog[0].region!=='NINGXIA')failures.push('catalog normalization')
if(entry.mode!=='EMBEDDED_EXPERIENCE_LAYER'||returned.action!=='RETURN_TO_HOST')failures.push('host handoff contract')
if(failures.length){console.error(JSON.stringify({pass:false,failures},null,2));process.exit(1)}
console.log(JSON.stringify({pass:true,normalized:catalog.length,entryMode:entry.mode,returnAction:returned.action}))
