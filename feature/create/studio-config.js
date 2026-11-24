// 贺兰灵境 · AI文旅共创空间配置
// “宁夏文化增强型生成算法”由场景、文化知识、IP人格、风格和输出约束组成。
const scenes=[
  {id:'travel_memory',title:'我的宁夏旅行纪念照',short:'把一次旅行变成可分享的专属纪念',icon:'📮',accent:'gold',subScenes:[['shahu','沙湖'],['zhenbeibao','镇北堡西部影城'],['xixia_tombs','西夏陵'],['helan_rock','贺兰山岩画'],['shuidonggou','水洞沟'],['manpu','漫葡小镇'],['yuehai','阅海湖'],['huaiyuan','怀远夜市']],defaultStyle:'poster',note:'适合生成手机壁纸、朋友圈海报或纪念明信片。'},
  {id:'yellow_river',title:'黄河文化AI画卷',short:'让三只萌宠守护黄河文明',icon:'🌊',accent:'blue',subScenes:[['nine_bends','黄河九曲'],['jiangnan','塞上江南'],['mother_river','黄河母亲'],['canyon','黄河大峡谷'],['guardian','黄河文明守护']],defaultStyle:'guofeng',note:'偏东方美学与文化叙事，适合比赛展示。'},
  {id:'xixia',title:'西夏文化复原空间',short:'与灵灵一起打开西夏历史想象',icon:'🏺',accent:'ink',subScenes:[['xixia_kingdom','西夏王朝印象'],['xixia_script','西夏文字'],['xixia_mural','西夏壁画'],['xixia_tombs','西夏陵'],['helan_rock','贺兰山岩画']],defaultStyle:'guofeng',note:'强调遗产复原、历史氛围与数字文化表达。'},
  {id:'helan_ecology',title:'贺兰山生态守护者',short:'和岩岩成为山川生态守护者',icon:'🏔️',accent:'green',subScenes:[['helan_ecology','贺兰山生态'],['rock_guardian','岩羊守护山川'],['silk_road_ecology','丝路生态旅伴'],['desert_oasis','荒漠与绿洲'],['eco_poster','生态文明宣传海报']],defaultStyle:'healing',note:'突出山川、自然、环保与生态美育。'},
  {id:'food_collab',title:'宁夏美食 × 萌宠联名海报',short:'把地方味道做成一张打卡海报',icon:'🍵',accent:'red',subScenes:[['hand_lamb','手抓羊肉'],['lamb_offal','羊杂碎'],['eight_tea','八宝茶'],['goji','枸杞'],['shahu_fish','沙湖鱼'],['noodles','宁夏特色面食']],defaultStyle:'cute',note:'适合美食商家、景区联名和社交传播。'}
]
const pets=[
  {id:'rockyan',name:'岩岩',animal:'岩羊',icon:'🐏',role:'贺兰山生态专家',keywords:'山川、自然、守护、生态、坚韧',fit:'贺兰山、生态文明、自然景观、山系旅行'},
  {id:'lingling',name:'灵灵',animal:'狐狸',icon:'🦊',role:'西夏文化探索者',keywords:'人文、历史、西夏、神秘、智慧',fit:'西夏文化、遗址、岩画、历史复原'},
  {id:'tuotuo',name:'驼驼',animal:'骆驼',icon:'🐫',role:'丝路旅行伙伴',keywords:'丝绸之路、沙漠、远行、豪迈、驼队',fit:'沙坡头、荒漠、丝路、美食、旅行纪念'}
]
const styles=[{id:'guofeng',name:'国风插画',hint:'东方美学与文化叙事'},{id:'poster',name:'文旅海报',hint:'构图完整，适合分享'},{id:'postcard',name:'明信片风',hint:'旅行纪念与留白感'},{id:'healing',name:'可爱治愈',hint:'温暖轻松的萌宠陪伴'}]
const outputTypes=[{id:'wallpaper',name:'手机壁纸',ratio:'9:16'},{id:'poster',name:'分享海报',ratio:'4:5'},{id:'postcard',name:'纪念明信片',ratio:'3:2'}]
function sceneById(id){return scenes.find(item=>item.id===id)||scenes[0]}
function petById(id){return pets.find(item=>item.id===id)||pets[1]}
function styleById(id){return styles.find(item=>item.id===id)||styles[1]}
function outputById(id){return outputTypes.find(item=>item.id===id)||outputTypes[1]}
module.exports={scenes,pets,styles,outputTypes,sceneById,petById,styleById,outputById}
