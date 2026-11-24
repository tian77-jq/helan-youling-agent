const ipRoles = [
  {id:'rock-goat',name:'岩羊',animal:'🐏',title:'山与生命的观察者',personality:'坚韧、温暖、可靠、守护',culturalMeaning:'象征贺兰山的生命力与坚守精神',targetUsers:'喜欢自然、动物、生态与地理的旅行者',recommendedProducts:['岩羊抱枕','岩羊钥匙扣','岩羊明信片','岩羊礼盒'],story:'它站在岩壁与云线之间，用温暖而准确的方式讲解贺兰山生态。',tags:['生态讲解','自然探索','山地记忆'],image:'/assets/thumbs/products/pillow_yangyang.jpg',color:'#d8b07a'},
  {id:'sand-fox',name:'沙狐',animal:'🦊',title:'今天宁夏的旅行伙伴',personality:'灵动、聪明、活泼、有探索欲',culturalMeaning:'象征今天宁夏的烟火、夜色与年轻活力',targetUsers:'喜欢路线、美食、夜游、城市与轻松体验的旅行者',recommendedProducts:['沙狐抱枕','沙狐钥匙扣','沙狐帆布包','沙狐食品包装'],story:'它把沙丘的弧线装进尾巴，也陪你去发现今天的宁夏。',tags:['路线规划','宁夏美食','夜游生活'],image:'/assets/thumbs/products/pillow_fox.jpg',color:'#e3aa69'},
  {id:'camel',name:'双峰驼',animal:'🐫',title:'时间与文明的讲述者',personality:'沉稳、可靠、包容、有历史感',culturalMeaning:'象征西夏、丝路与黄河文明的时间回响',targetUsers:'喜欢历史、文化、非遗与文明交流的旅行者',recommendedProducts:['双峰驼抱枕','双峰驼冰箱贴','八宝茶礼盒','文旅伴手礼'],story:'它穿越时间与驼铃，把西夏、丝路和黄河文明讲成可亲近的故事。',tags:['西夏文化','丝路记忆','文明讲解'],image:'/assets/thumbs/products/pillow_camel.jpg',color:'#b89470'}
]
const products = [
  {id:'p-goat-pillow',name:'岩羊抱枕',category:'萌宠抱枕',ipId:'rock-goat',scene:'自用陪伴 / 温暖礼物',tags:['治愈','生态IP'],story:'把贺兰山的守护感带回日常，适合宿舍、客厅和长途旅程。',recommendedWith:'岩羊明信片',image:'/assets/thumbs/products/pillow_yangyang.jpg',isPreSale:true},
  {id:'p-fox-pillow',name:'沙狐抱枕',category:'萌宠抱枕',ipId:'sand-fox',scene:'自用陪伴 / 校园礼物',tags:['灵动','沙漠IP'],story:'把沙丘的弧线和探索的好奇心带回日常。',recommendedWith:'沙狐钥匙扣',image:'/assets/thumbs/products/pillow_fox.jpg',isPreSale:true},
  {id:'p-fox-key',name:'沙狐钥匙扣',category:'周边产品',ipId:'sand-fox',scene:'校园文创 / 旅游纪念',tags:['轻量','年轻共创'],story:'一枚随身携带的小小沙狐，让探索精神每天发生。',recommendedWith:'沙狐明信片',image:'/assets/thumbs/products/keychain_set.jpg',isPreSale:true},
  {id:'p-fox-bag',name:'沙狐帆布包',category:'周边产品',ipId:'sand-fox',scene:'日常使用 / 校园出行',tags:['实用','灵动'],story:'将沙漠的暖色与年轻设计装进一只可重复使用的包。',recommendedWith:'沙狐钥匙扣',image:'/assets/thumbs/products/totebag_set.jpg',isPreSale:true},
  {id:'p-camel-pillow',name:'双峰驼抱枕',category:'萌宠抱枕',ipId:'camel',scene:'丝路纪念 / 温暖礼物',tags:['陪伴','丝路IP'],story:'把驼铃与丝路记忆带进日常空间。',recommendedWith:'八宝茶联名礼盒',image:'/assets/thumbs/products/pillow_camel.jpg',isPreSale:true},
  {id:'p-camel-magnet',name:'双峰驼冰箱贴',category:'周边产品',ipId:'camel',scene:'旅行纪念 / 文化收藏',tags:['纪念','丝路文化'],story:'让一次宁夏旅行，在冰箱门上留下可见的坐标。',recommendedWith:'八宝茶联名礼盒',image:'/assets/thumbs/products/magnet_set.jpg',isPreSale:true},
  {id:'p-camel-tea',name:'八宝茶联名礼盒',category:'IP联名食品包装',ipId:'camel',scene:'跨文化礼物 / 文旅伴手礼',tags:['宁夏味道','丝路联名'],story:'以双峰驼承载丝路记忆，将宁夏特色消费品转化为可分享的IP体验。',recommendedWith:'双峰驼冰箱贴',image:'/assets/thumbs/products/food_ip_packaging.jpg',isPreSale:true},
  {id:'p-tour-box',name:'留学生文旅礼盒',category:'文旅礼盒',ipId:'sand-fox',scene:'跨文化礼物 / 旅游纪念',tags:['双语传播','文化体验'],story:'从IP故事、文创周边到宁夏特色消费品的组合体验，适合跨文化赠礼。',recommendedWith:'双语祝福卡',image:'/assets/thumbs/products/gift_box.jpg',isPreSale:true},
  {id:'p-postcard',name:'贺兰山生态明信片',category:'周边产品',ipId:'rock-goat',scene:'旅游纪念 / 了解宁夏文化',tags:['故事传播','轻文创'],story:'每一张卡片都是一个打开IP故事馆的入口。',recommendedWith:'岩羊钥匙扣',image:'/assets/thumbs/products/postcard_set.jpg',isPreSale:true}
]
const conceptCollabProducts = [
  {id:'cc-06',name:'沙狐流苏书签',category:'联名文具',ipId:'sand-fox',scene:'阅读礼物 / 轻收藏',tags:['沙狐','流苏','金属'],story:'沙狐头像与流苏相遇，成为轻巧而有辨识度的阅读伴手礼。',conceptNote:'概念设计：采用沙狐头像、细线纹样和流苏结构，突出灵动而不喧闹的礼物感。',image:'/assets/thumbs/concept-collab/cc-06.jpg'},
  {id:'cc-07',name:'双峰驼手机壳',category:'联名手机壳',ipId:'camel',scene:'日常使用 / 旅行纪念',tags:['手机壳','双峰驼','纹样'],story:'把双峰驼与宁夏地域纹样放到日常设备背面，成为低调的旅行记号。',conceptNote:'概念设计：展示图为视觉效果提案，实际型号、材质与开孔方案需后续打样确认。',image:'/assets/thumbs/concept-collab/cc-07.jpg'},
  {id:'cc-08',name:'双峰驼暖饮杯套装',category:'联名饮具',ipId:'camel',scene:'办公饮水 / 文旅礼物',tags:['保温杯','礼盒','饮具'],story:'双峰驼形象延展到保温杯、包装盒与杯垫，适合表达“带着宁夏走远一点”的日常场景。',conceptNote:'概念设计：图片用于展示视觉方向，不代表已生产、可购买或具备食品接触安全认证。',image:'/assets/thumbs/concept-collab/cc-08.jpg'},
  {id:'cc-09',name:'三灵物手机壳套组',category:'联名套装',ipId:'sand-fox',scene:'系列收藏 / 日常使用',tags:['手机壳','三款','套组'],story:'三只灵物各自拥有一款手机壳，适合做成系列收藏或朋友间的主题礼物。',conceptNote:'概念设计：同系列三款仅作视觉展示，具体适配机型与生产规格待定。',image:'/assets/thumbs/concept-collab/cc-09.jpg'},
  {id:'cc-10',name:'沙狐旅行卡套',category:'联名挂件',ipId:'sand-fox',scene:'旅行收纳 / 校园出行',tags:['卡套','沙狐','沙漠'],story:'沙狐从沙丘与山脊中探出头来，成为旅行卡、校园卡的趣味收纳封面。',conceptNote:'概念设计：图中卡套不承载真实证件信息，重点展示角色插画与沙丘色彩。',image:'/assets/thumbs/concept-collab/cc-10.jpg'},
  {id:'cc-11',name:'岩羊鎏金书签',category:'联名文具',ipId:'rock-goat',scene:'阅读陪伴 / 文化礼赠',tags:['岩羊','书签','鎏金'],story:'以岩羊正面形象结合云纹与边框，形成一款适合文化礼赠的书签提案。',conceptNote:'概念设计：鎏金质感为效果表达，实际工艺可选金属蚀刻、烫金或珐琅方案。',image:'/assets/thumbs/concept-collab/cc-11.jpg'},
  {id:'cc-12',name:'岩羊云朵手机壳',category:'联名手机壳',ipId:'rock-goat',scene:'日常使用 / 萌宠收藏',tags:['岩羊','手机壳','治愈'],story:'蓬松岩羊成为手机壳的视觉中心，用柔和配色传达贺兰山的陪伴感。',conceptNote:'概念设计：仅展示外观方向，具体材质、耐磨等级和机型适配需后续确认。',image:'/assets/thumbs/concept-collab/cc-12.jpg'},
  {id:'cc-13',name:'岩羊暖饮杯礼盒',category:'联名饮具',ipId:'rock-goat',scene:'办公饮水 / 温暖礼物',tags:['马克杯','岩羊','礼盒'],story:'岩羊马克杯与同主题包装组合，适合做成温暖、易理解的宁夏生态礼物。',conceptNote:'概念设计：图片是产品效果提案，不代表已生产或可直接购买。',image:'/assets/thumbs/concept-collab/cc-13.jpg'},
  {id:'cc-14',name:'岩羊证件挂件',category:'联名挂件',ipId:'rock-goat',scene:'校园出行 / 旅行收纳',tags:['岩羊','挂件','卡套'],story:'把岩羊头像放入简洁的卡套结构，适合校园、展会与旅行收纳场景。',conceptNote:'概念设计：展示图不对应任何真实证件、门票或官方身份标识。',image:'/assets/thumbs/concept-collab/cc-14.jpg'},
  {id:'cc-15',name:'宁夏萌宠马克杯组',category:'联名套装',ipId:'sand-fox',scene:'家庭使用 / 文旅礼物',tags:['马克杯','三灵物','套装'],story:'岩羊、沙狐、双峰驼组成一组马克杯，让三种宁夏地域气质在同一张餐桌上相遇。',conceptNote:'概念设计：适合作为展厅中的系列陈列主视觉，实际杯型与包装需进一步打样。',image:'/assets/thumbs/concept-collab/cc-15.jpg'},
  {id:'cc-16',name:'岩羊卡套单品',category:'联名挂件',ipId:'rock-goat',scene:'校园出行 / 轻文创',tags:['岩羊','卡套','透明保护'],story:'以岩羊头像为主视觉的卡套单品，强调清爽、轻巧和一眼可识别。',conceptNote:'概念设计：图中为空白展示卡片，不含真实个人信息或官方证件功能。',image:'/assets/thumbs/concept-collab/cc-16.jpg'},
  {id:'cc-17',name:'沙狐手机壳',category:'联名手机壳',ipId:'sand-fox',scene:'日常使用 / 旅行纪念',tags:['沙狐','手机壳','灵动'],story:'把沙狐的灵动形象放到日常设备背面，成为轻巧的宁夏旅行记号。',conceptNote:'概念设计：展示图为视觉效果提案，实际型号、材质与开孔方案需后续打样确认。',image:'/assets/thumbs/concept-collab/cc-17.jpg'},
  {id:'cc-18',name:'岩羊暖饮瓶礼盒',category:'联名饮具',ipId:'rock-goat',scene:'户外出行 / 温暖礼物',tags:['岩羊','保温瓶','礼盒'],story:'岩羊形象延展到暖饮瓶与礼盒，适合自然观察、通勤和宁夏文旅赠礼场景。',conceptNote:'概念设计：图片用于展示视觉方向，不代表已生产、可购买或具备食品接触安全认证。',image:'/assets/thumbs/concept-collab/cc-18.jpg'},
  {id:'cc-19',name:'双峰驼流苏书签礼盒',category:'联名文具',ipId:'camel',scene:'丝路纪念 / 文化礼赠',tags:['双峰驼','书签','流苏'],story:'以双峰驼、丝路纹样与流苏组合，表达宁夏作为旅行目的地的文化连接。',conceptNote:'概念设计：礼盒与金色书签仅作创意展示，实际材质和工艺尚未确定。',image:'/assets/thumbs/concept-collab/cc-19.jpg'},
  {id:'cc-20',name:'沙狐暖饮马克杯',category:'联名饮具',ipId:'sand-fox',scene:'日常饮用 / 旅行纪念',tags:['沙狐','马克杯','饮具'],story:'沙狐马克杯与包装盒形成完整陈列，适合咖啡、茶饮和文旅礼赠场景。',conceptNote:'概念设计：图片不代表实际销售商品，食品接触材质与安全信息需后续确认。',image:'/assets/thumbs/concept-collab/cc-20.jpg'},
  {id:'cc-21',name:'灵物暖饮礼盒组',category:'联名套装',ipId:'camel',scene:'文旅礼物 / 系列展示',tags:['饮具','礼盒','组合'],story:'把岩羊、沙狐、双峰驼的杯具与包装放在同一组视觉中，呈现完整的文创展厅提案。',conceptNote:'概念设计：合辑图只作为系列展示，不重复拆成同款商品；实际套装组合待定。',image:'/assets/thumbs/concept-collab/cc-21.jpg'},
  {id:'cc-22',name:'沙狐暖饮瓶礼盒',category:'联名饮具',ipId:'sand-fox',scene:'户外出行 / 旅行纪念',tags:['沙狐','保温瓶','杯垫'],story:'沙狐保温瓶、包装盒与杯垫组合，适合户外旅行和日常通勤的视觉提案。',conceptNote:'概念设计：展示的是外观与陈列方向，容量、保温性能及生产信息均未确定。',image:'/assets/thumbs/concept-collab/cc-22.jpg'},
  {id:'cc-23',name:'三灵物卡套陈列组',category:'联名套装',ipId:'rock-goat',scene:'展厅陈列 / 旅行收纳',tags:['卡套','三灵物','陈列'],story:'以三只灵物卡套组成一组展陈，让用户一眼看懂角色系统与系列关系。',conceptNote:'概念设计：合辑中每个角色只作为一组展示，不再重复生成同款单品。',image:'/assets/thumbs/concept-collab/cc-23.jpg'},
  {id:'cc-24',name:'岩羊透明卡套',category:'联名挂件',ipId:'rock-goat',scene:'校园出行 / 轻文创',tags:['岩羊','透明卡套','便携'],story:'岩羊头像与地域边框结合，形成简洁耐看的透明卡套视觉方案。',conceptNote:'概念设计：为空白展示卡，不含真实证件、门票或身份认证功能。',image:'/assets/thumbs/concept-collab/cc-24.jpg'},
  {id:'cc-25',name:'沙狐绒感手账本',category:'联名文具',ipId:'sand-fox',scene:'日常记录 / 旅行手账',tags:['沙狐','手账','收藏'],story:'把沙狐完整形象置于手账封面，适合与岩羊、双峰驼款组成系列文具。',conceptNote:'概念设计：封面纹理和刺绣效果为视觉提案，未对应现售商品。',image:'/assets/thumbs/concept-collab/cc-25.jpg'},
  {id:'cc-26',name:'岩羊挂绳卡套',category:'联名挂件',ipId:'rock-goat',scene:'校园出行 / 旅行收纳',tags:['岩羊','挂绳','卡套'],story:'岩羊头像搭配挂绳与透明保护套，突出随身携带和快速取用的便利性。',conceptNote:'概念设计：挂绳长度、扣具材质与卡套规格均需后续打样确认。',image:'/assets/thumbs/concept-collab/cc-26.jpg'},
  {id:'cc-27',name:'沙狐挂绳卡套',category:'联名挂件',ipId:'sand-fox',scene:'校园出行 / 旅行收纳',tags:['沙狐','挂绳','卡套'],story:'沙狐以沙丘色调进入卡套挂件，适合做成轻便、年轻的旅行文创。',conceptNote:'概念设计：展示为空白卡片与角色图案，不代表任何实际联名授权或证件功能。',image:'/assets/thumbs/concept-collab/cc-27.jpg'},
  {id:'cc-28',name:'双峰驼暖饮马克杯',category:'联名饮具',ipId:'camel',scene:'日常饮用 / 丝路礼物',tags:['双峰驼','马克杯','礼盒'],story:'双峰驼马克杯与包装盒共同呈现丝路旅行的稳重与温度。',conceptNote:'概念设计：杯具、包装和画面均为创意展示，不代表已生产或可购买。',image:'/assets/thumbs/concept-collab/cc-28.jpg'}
]
const creativeProducts = products.concat(conceptCollabProducts)
const productVisuals={matrix:'/assets/thumbs/banners/product_matrix.jpg'}
const scenicCollabSources = [
  {id:'helan-mountain',title:'贺兰有灵 × 贺兰山',scenicName:'贺兰山国家森林公园',subtitle:'山河有灵，萌宠同行',tag:'生态山地',image:'/assets/thumbs/scenic-collab/helan_mountain_banner.jpg',description:'岩羊、沙狐与双峰驼走进贺兰山，让生态IP成为认识宁夏的年轻入口。'},
  {id:'helan-rock-painting',title:'贺兰有灵 × 贺兰山岩画',scenicName:'贺兰山岩画',subtitle:'一张图认识宁夏之美',tag:'历史遗址',image:'/assets/thumbs/scenic-collab/helan_rock_painting_banner.jpg',description:'让远古岩画与当代萌宠相遇，把宁夏的文化记忆变成可传播的视觉故事。'},
  {id:'shapotou',title:'贺兰有灵 × 沙坡头',scenicName:'沙坡头',subtitle:'生态IP走进文旅场景',tag:'沙漠黄河',image:'/assets/thumbs/scenic-collab/shapotou_banner.jpg',description:'从沙漠到黄河，萌宠陪伴游客发现宁夏独特的自然景观。'},
  {id:'shahu',title:'贺兰有灵 × 沙湖',scenicName:'沙湖',subtitle:'让宁夏风景被年轻人看见',tag:'沙水共生',image:'/assets/thumbs/scenic-collab/shahu_banner.jpg',description:'以沙狐的灵动连接沙水共生的宁夏风景，拓展生态IP的文旅表达。'},
  {id:'shapotou-camel-collab',title:'贺兰有灵 × 沙坡头 · 小骆驼联名款',scenicName:'沙坡头',subtitle:'大漠黄河，萌游宁夏',tag:'沙漠黄河',image:'/assets/thumbs/scenic-collab/shapotou_camel_collab_banner.jpg',description:'以双峰驼联名形象连接沙坡头的大漠黄河，让宁夏风景变成可以带走的陪伴。'},
  {id:'zhenbeibao-fox-collab',title:'贺兰有灵 × 镇北堡西部影城 · 小狐狸联名款',scenicName:'镇北堡西部影城',subtitle:'光影传奇，萌趣同行',tag:'西部影城',image:'/assets/thumbs/scenic-collab/zhenbeibao_fox_collab_banner.jpg',description:'以沙狐联名形象走进镇北堡西部影城，让西部故事拥有更年轻、更可爱的传播方式。'},
  {id:'zhenbeibao',title:'贺兰有灵 × 镇北堡西部影城',scenicName:'镇北堡西部影城',subtitle:'萌宠同行，打开西部想象',tag:'西部影城',image:'/assets/thumbs/scenic-collab/zhenbeibao_banner.jpg',description:'让原创萌宠IP进入影视与旅行场景，形成更年轻的宁夏传播记忆。'},
  {id:'shuidonggou',title:'贺兰有灵 × 水洞沟',scenicName:'水洞沟',subtitle:'穿越万年，遇见新灵感',tag:'历史遗址',image:'/assets/thumbs/scenic-collab/shuidonggou_banner.jpg',description:'把史前文明、自然探索与IP角色结合，打造可互动的文旅内容入口。'},
  {id:'huanghe-grand-canyon',title:'贺兰有灵 × 青铜峡黄河大峡谷',scenicName:'青铜峡黄河大峡谷',subtitle:'黄河奔流，萌宠共创',tag:'黄河峡谷',image:'/assets/thumbs/scenic-collab/huanghe_grand_canyon_banner.jpg',description:'沿着黄河大峡谷展开联名想象，让地域景观成为IP共创的真实背景。'},
  {id:'xixia-tombs',title:'贺兰有灵 × 西夏陵',scenicName:'西夏陵',subtitle:'丝路记忆，年轻表达',tag:'西夏文化',image:'/assets/thumbs/scenic-collab/xixia_tombs_banner.jpg',description:'以双峰驼承接丝路记忆，让西夏文化通过年轻化IP被更多人理解。'},
  {id:'word-66-highway',title:'贺兰有灵 × 66号公路',scenicName:'66号公路',subtitle:'一路向北，萌宠同行',tag:'公路风景',image:'/assets/thumbs/scenic-docx/66-highway.jpg',description:'联名视觉提案，展示萌宠与宁夏公路风景的文创表达。',source:'word'},
  {id:'word-shuanglong-grottoes',title:'贺兰有灵 × 双龙石窟',scenicName:'双龙石窟',subtitle:'石窟记忆，文化相遇',tag:'文化景观',image:'/assets/thumbs/scenic-docx/shuanglong-grottoes.jpg',description:'联名视觉提案，详情以景区官方信息与后续知识库核验为准。',source:'word'},
  {id:'word-jinsha-island',title:'贺兰有灵 × 金沙岛',scenicName:'金沙岛',subtitle:'沙岛之间，发现宁夏',tag:'沙漠景观',image:'/assets/thumbs/scenic-docx/jinsha-island.jpg',description:'联名视觉提案，展示萌宠与沙漠景观的联名想象。',source:'word'},
  {id:'word-dingbian-salt-lake',title:'贺兰有灵 × 定边盐湖',scenicName:'定边盐湖',subtitle:'盐湖风光，萌趣记录',tag:'湖泊风景',image:'/assets/thumbs/scenic-docx/dingbian-salt-lake.jpg',description:'联名视觉提案，详情以官方信息核验为准。',source:'word'},
  {id:'word-yellow-river-ancient-ferry',title:'贺兰有灵 × 黄河古渡',scenicName:'黄河古渡',subtitle:'黄河流动的生活记忆',tag:'黄河文化',image:'/assets/thumbs/scenic-docx/yellow-river-ancient-ferry.jpg',description:'联名视觉提案，展示萌宠与黄河生活场景的联名表达。',source:'word'},
  {id:'word-wulan-lake',title:'贺兰有灵 × 乌兰湖',scenicName:'乌兰湖',subtitle:'湖光与萌宠的相遇',tag:'自然风景',image:'/assets/thumbs/scenic-docx/wulan-lake.jpg',description:'联名视觉提案，详情以官方信息核验为准。',source:'word'},
  {id:'word-firestone-village',title:'贺兰有灵 × 火石寨',scenicName:'火石寨',subtitle:'山野色彩，灵物同行',tag:'山地风景',image:'/assets/thumbs/scenic-docx/firestone-village.jpg',description:'联名视觉提案，展示萌宠与山地风景的联名想象。',source:'word'},
  {id:'word-beiwudang-eco',title:'贺兰有灵 × 北武当生态旅游区',scenicName:'北武当生态旅游区',subtitle:'生态旅途，轻松发现',tag:'生态旅游',image:'/assets/thumbs/scenic-docx/beiwudang-eco.jpg',description:'联名视觉提案，详情以官方信息核验为准。',source:'word'},
  {id:'word-helan-ecology',title:'贺兰有灵 × 贺兰山自然生态保护区',scenicName:'贺兰山自然生态保护区',subtitle:'山河有灵，生态共生',tag:'贺兰山生态',image:'/assets/thumbs/scenic-docx/helan-ecology.jpg',description:'联名视觉提案，展示三只萌宠与贺兰山生态主题。',source:'word'},
  {id:'word-tiange-lake',title:'贺兰有灵 × 天鹅湖',scenicName:'天鹅湖',subtitle:'湖畔相逢，温柔宁夏',tag:'湖泊生态',image:'/assets/thumbs/scenic-docx/tiange-lake.jpg',description:'联名视觉提案，详情以官方信息核验为准。',source:'word'},
  {id:'word-tengger-desert',title:'贺兰有灵 × 腾格里沙漠',scenicName:'腾格里沙漠',subtitle:'大漠之上，开启灵游',tag:'沙漠风景',image:'/assets/thumbs/scenic-docx/tengger-desert.jpg',description:'联名视觉提案，展示萌宠与沙漠旅行的联名想象。',source:'word'},
  {id:'word-xige-winery',title:'贺兰有灵 × 西鸽酒庄',scenicName:'西鸽酒庄',subtitle:'葡萄园里的文化新表达',tag:'葡萄酒文化',image:'/assets/thumbs/scenic-docx/xige-winery.jpg',description:'联名视觉提案，详情以官方信息核验为准。',source:'word'},
  {id:'word-lanshan-park',title:'贺兰有灵 × 览山公园',scenicName:'览山公园',subtitle:'城市风景，夜色有灵',tag:'城市风景',image:'/assets/thumbs/scenic-docx/lanshan-park.jpg',description:'联名视觉提案，展示萌宠与城市景观的联名表达。',source:'word'}
]

// Remove any accidental duplicate entry before the data reaches the page.
const scenicEntityAliases={'shapotou-camel-collab':'shapotou','zhenbeibao-fox-collab':'zhenbeibao','huanghe-grand-canyon':'yellow-river-canyon'}
const scenicCollabs = Array.from(new Map(scenicCollabSources.map(item=>[
  item.id+'|'+item.image,
  {
    ...item,
    entityType:item.source?'concept':'attraction',
    entityId:item.source?'concept-'+item.id:(scenicEntityAliases[item.id]||item.id),
    route:item.source?'preview':'/feature/attraction/detail',
    displayMode:item.source?'aspectFit':'aspectFill',
    fallbackImage:'/assets/thumbs/scenic-collab/helan_mountain_banner.jpg',
    focus:['shapotou-camel-collab','zhenbeibao-fox-collab'].includes(item.id)?'35% center':'center center'
  }
])).values())
const foodCollabs = [
  {id:'hand-grabbed-lamb',foodId:'hand-grabbed-lamb',title:'手抓羊肉',subtitle:'鲜香醇厚 · 银川 / 吴忠',image:'/assets/thumbs/food-collab/wuzhong.jpg'},
  {id:'lamb-noodles',foodId:'lamb-noodles',title:'羊肉臊子面',subtitle:'汤香面韧 · 银川日常风味',image:'/assets/thumbs/food-collab/yinchuan.jpg'},
  {id:'eight-treasure-tea',foodId:'eight-treasure-tea',title:'八宝茶',subtitle:'甜润有层次 · 宁夏待客味道',image:'/assets/thumbs/food-collab/overview_ip_showcase.jpg'},
  {id:'wu-zhong-noodles',foodId:'wu-zhong-noodles',title:'羊肉老搓面',subtitle:'筋道咸鲜 · 吴忠地方风味',image:'/assets/thumbs/food-collab/wuzhong.jpg'},
  {id:'zhongwei-haozimian',foodId:'zhongwei-haozimian',title:'中卫蒿子面',subtitle:'面香家常 · 中卫地方味道',image:'/assets/thumbs/food-collab/zhongwei.jpg'},
  {id:'yinchuan-spicy-paste',foodId:'yinchuan-spicy-paste',title:'辣糊糊',subtitle:'香辣浓郁 · 银川街巷风味',image:'/assets/thumbs/food-collab/yinchuan.jpg'},
  {id:'shizuishan-food',foodId:'dawukou-tofu',title:'大武口凉皮',subtitle:'酸香清爽 · 石嘴山轻食',image:'/assets/thumbs/food-collab/wuzhong.jpg'},
  {id:'lingwu-food',foodId:'lingwu-stewed-chicken',title:'灵武清炖土鸡',subtitle:'鲜香清润 · 灵武家常菜',image:'/assets/thumbs/food-collab/wuzhong.jpg'},
  {id:'zhongwei-roasted-lamb-ribs',foodId:'zhongwei-roasted-lamb-ribs',title:'沙坡头烤羊排',subtitle:'焦香鲜嫩 · 中卫多人餐',image:'/assets/thumbs/food-collab/zhongwei.jpg'},
  {id:'guyuan-food',foodId:'guyuan-qiaomian',title:'固原荞面饸饹',subtitle:'麦香筋道 · 固原山地风味',image:'/assets/thumbs/food-collab/overview_food_map.jpg'},
  {id:'ningxia-food-map',foodId:'ningxia-food-map',title:'宁夏美食地图',subtitle:'五市分类 · 按路线选择不重复',image:'/assets/thumbs/food-collab/overview_food_map.jpg'}
]
const languageTexts = {zh:'贺兰有灵以宁夏知识库与原创萌宠智能体，帮助游客规划、理解和记录宁夏旅行。',en:'Helan Youling uses a Ningxia knowledge base and original mascot agents to help visitors plan, understand and remember their journey.'}
const optionLists = {userTypes:['学生','游客','留学生','老师 / 家长','企业客户'],budgets:['轻巧便携','日常陪伴','文化纪念','组合展示','不限范围'],purposes:['自用陪伴','生日礼物','旅游纪念','校园文创','跨文化礼物','企业定制'],recipients:['自己','同学 / 朋友','老师','家人','留学生朋友','客户 / 合作方'],styles:['可爱治愈','高级简约','民族风','实用型','文化纪念型'],needs:['想了解宁夏文化','想收藏原创设计','想看组合展示','想要双语祝福卡','想看风格推荐'],surveyUserTypes:['学生','游客','留学生','老师','其他'],knowledge:['了解','听过','不了解'],priceRanges:['轻巧便携','日常陪伴','文化纪念','组合展示','不限范围'],productTypes:['抱枕','钥匙扣','冰箱贴','明信片','帆布包','食品礼盒','文旅礼盒'],yesNo:['愿意','不确定','不愿意']}
module.exports = {ipRoles,products,conceptCollabProducts,creativeProducts,languageTexts,optionLists,productVisuals,scenicCollabs,foodCollabs}

