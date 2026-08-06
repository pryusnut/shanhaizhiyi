// ============================================================
// 《山海志异挑战》现代化适配说明
// ------------------------------------------------------------
// 本扩展在原作者「浪琴婊」版本基础上进行了以下修改，以兼容新版无名杀：
//
// 1. lib.boss 兜底初始化（修复非挑战模式启动报错）
//    原扩展的 boss 定义（lib.boss.boss_xxx = {...}）位于
//    if(get.mode()=='boss') 分支之外、content 顶层无条件执行，而
//    lib.boss 表仅由挑战模式在 loadMode() 时经 mixinLibrary 创建；
//    因此在身份等非挑战模式启动时访问 lib.boss 会抛出
//    "Cannot set properties of undefined (setting 'boss_shanhaizhiyi')"。
//    修复：content 顶层新增
//      lib.boss = lib.boss || {};
//      lib.boss.global = lib.boss.global || {loopType:1, chongzheng:6};
//    任意模式下先确保 lib.boss 存在（挑战模式下保留原表内容）。
//
// 2. 武将包改由 package.character 加载（修复武将包从未加载问题）
//    原 precontent 以 if(qinyin.enable) 门控 + game.import('character')
//    导入武将包，但扩展配置中不存在 qinyin 键，门控恒为假，64 个武将
//    从未注册；且新版引擎 loadCharacter 仅合并 lib.config.characters
//    中的武将包。现改为将武将包整体置于 package.character，由游戏本体
//    加载扩展时自动注册武将包、合并角色/技能/翻译、补充图片路径并处理
//    forbidai；precontent 仅保留原画路径写入逻辑。
//
// 3. 移除失效代码
//    - content 末尾依赖 lib.characterPack['qinyin'] 的 config.qinyin
//      死代码块（forbidai 标记已由引擎自动处理）；
//    - precontent 中失效的 lib.config.all.characters.push('qinyin')、
//      lib.config.characters.remove('qinyin') 旧式注册语句。
//
// 4. 新增武将包菜单名称翻译
//    武将包 translate 中新增 "山海志异挑战" 键，用于武将包菜单显示。
//
// 5. 部分角色美术改用无名杀内置素材
//    经原作者授权开源并核对外观后，以下 18 个角色的原画不再随扩展分发，
//    改为通过 img: 前缀直接引用游戏本体内置素材（缺失时自动回退默认剪影，
//    不影响游玩）：
//      boss_baiwuchang1 -> image/mode/boss/character/boss_baiwuchang.jpg
//      boss_caocao_hun  -> image/mode/boss/character/boss_caocao.jpg
//      boss_chi1        -> image/mode/boss/character/boss_chi.jpg
//      boss_heiwuchang1 -> image/mode/boss/character/boss_heiwuchang.jpg
//      boss_hundun1     -> image/mode/boss/character/boss_hundun.jpg
//      boss_liang1      -> image/mode/boss/character/boss_liang.jpg
//      boss_luocha1     -> image/mode/boss/character/boss_luocha.jpg
//      boss_mamian1     -> image/mode/boss/character/boss_mamian.jpg
//      boss_mei1        -> image/mode/boss/character/boss_mo.jpg
//      boss_mengpoa     -> image/mode/boss/character/boss_mengpo.jpg
//      boss_niutou1     -> image/mode/boss/character/boss_niutou.jpg
//      boss_qiongqi1    -> image/mode/boss/character/boss_qiongqi.jpg
//      boss_taotie1     -> image/mode/boss/character/boss_taotie.jpg
//      boss_taowu1      -> image/mode/boss/character/boss_taowu.jpg
//      boss_wang1       -> image/mode/boss/character/boss_wang.jpg
//      boss_yecha1      -> image/mode/boss/character/boss_yecha.jpg
//      boss_zhuyin1     -> image/mode/boss/character/boss_zhuyin.jpg
//      boss_xvzhu_hun   -> image/character/re_xuzhu.jpg
// ============================================================
game.import("extension",function(lib,game,ui,get,ai,_status){
var qinyin={
	name:'qinyin',
	connect:true,
	characterSort:{
	// --------------------------------------武将分类------------------------------------------//
	qinyin:{
	"lljs":["boss_langqinbiao"],
	"shzy":["boss_xvzhu_hun","boss_simayi_hun","boss_caocao_hun","boss_sunquan_hun","boss_zhouyv_hun","boss_guanyv_hun","boss_zhugeliang_hun","boss_liubei_hun","boss_diaochan_hun","boss_lvbu_hun","boss_ganning_hun",
	"boss_chi1","boss_mei1","boss_wang1","boss_liang1","boss_niutou1","boss_mamian1","boss_nianshou1","boss_luocha1","boss_yecha1","boss_heiwuchang1","boss_baiwuchang1","boss_qiongqi1","boss_hundun1","boss_taowu1",
	"boss_taotie1","boss_zhuyin1","boss_zhuquejiangling","boss_xuanwujiangling","boss_qilin1","boss_xiaohu1"],
	"dypg":["boss_yanluowanga","boss_guiwang","boss_riyeyoushen","boss_niutoumamian","boss_heibaiwuchang","boss_huangfeng","boss_baowei","boss_yvsai","boss_niaozui","boss_mengpoa"],
	"alhg":["boss_alhg_qidala","boss_alhg_qijiasi","boss_alhg_jingzishibing","boss_alhg_xiruonuosi","boss_alhg_xiruonuosizuoshou","boss_alhg_xiruonuosiyoushou","boss_alhg_sheshenyi","boss_alhg_dazi","boss_alhg_zhishen"],
	"qqzj":["boss_caocao_qqzj","boss_simayi_qqzj","boss_lvbu_qqzj","boss_dongzhuo_qqzj","boss_zhangjiao_qqzj","boss_yuanshu_qqzj"],
	"djbs":["boss_zhangrang1","boss_machao1","boss_ling"],
	
	},
	},
	// --------------------------------------武将资料--------浪琴婊----------------------------------//
	character:{
	"boss_shanhaizhiyi":['male','',0,["boss_shanhaif2","boss_shanhai","boss_shanhaif","boss_shanhaif1"],['boss','unseen'],'qun'],
	"boss_diyvpanguan":["male","",0,["boss_yvguan","boss_yvguanf","boss_yvguanf1","boss_yvguanf2"],['boss','unseen'],'wei'],
	"boss_aolihagang":["male","",0,["boss_aogang","boss_aogangf","boss_aogangf1","boss_aogangf2"],['boss','unseen'],'shu'],
	"boss_qingqingzijin":["male","",0,["boss_qqzijin","boss_qqzijinf"],['boss','unseen'],'qun'],
	
	"boss_xvzhu_hun":["male","wei",11,["mengjin","mashu","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_simayi_hun":["male","wei",12,["mingzhe","xinleiji","boss_shanhai3"],['qun','hiddenboss','bossallowed']],
	"boss_caocao_hun":["male","wei",13,["shuimeng","tianbian","xinjyzongshi","gushe"],['qun','hiddenboss','bossallowed']],
	"boss_ganning_hun":["male","wu",11,["retiaoxin","qianxun","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_zhouyv_hun":["male","wu",12,["yingjian","xiangle","boss_shanhai3"],['qun','hiddenboss','bossallowed']],
	"boss_sunquan_hun":["male","wu",13,["xinfu_langxi","xiansi","yuce","reyingzi"],['qun','hiddenboss','bossallowed']],
	"boss_guanyv_hun":["male","shu",11,["boss_guihuoa","feiying","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_zhugeliang_hun":["male","shu",12,["xinjushou","niluan","boss_shanhai3"],['qun','hiddenboss','bossallowed']],
	"boss_liubei_hun":["male","shu",13,["refankui","xinkuanggu","xiaoguo","luoying"],['qun','hiddenboss','bossallowed']],
	"boss_diaochan_hun":["female","qun",11,["oltianxiang","boss_guimeia","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_lvbu_hun":["male","qun",13,["qingxi","rezhiyi","moukui","boss_modaoa"],['qun','hiddenboss','bossallowed']],
	"boss_chi1":["male","qun",6,["boss_guimeia","junxing","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_mei1":["female","qun",6,["boss_guimeia","enyuan","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_wang1":["male","qun",6,["boss_guimeia","new_retuxi","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_liang1":["female","qun",6,["boss_guimeia","qiangxix","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_niutou1":["male","qun",7,["boss_guimeia","mingzhe","xiangle","boss_shanhai3"],['qun','hiddenboss','bossallowed']],
	"boss_mamian1":["male","qun",7,["boss_guimeia","xinjuece","xiansi","boss_shanhai3"],['qun','hiddenboss','bossallowed']],
	"boss_nianshou1":["male","qun",11,["boss_jvhuo","boss_zhennu","hanyong1","reyingzi"],['qun','hiddenboss','bossallowed']],
	"boss_luocha1":["male","qun",8,["biyue","boss_qvshoua","reganglie","boss_guimeia"],['qun','hiddenboss','bossallowed']],
	"boss_yecha1":["male","qun",8,["yingzi","boss_mojiana","boss_danshua","boss_guimeia"],['qun','hiddenboss','bossallowed']],
	"boss_heiwuchang1":["male","qun",8,["wushuang","boss_leilia","xinkuanggu","boss_guimeia"],['qun','hiddenboss','bossallowed']],
	"boss_baiwuchang1":["male","qun",8,["boss_modaoa","boss_zuijiua","xinshensu","boss_guimeia"],['qun','hiddenboss','bossallowed']],
	"boss_qiongqi1":["male","qun",11,["boss_xiemei","retuxi","boss_shanhai2"],['wei','hiddenboss','bossallowed']],
	"boss_hundun1":["male","qun",11,["boss_xiemei","boss_guihuoa","boss_shanhai2"],['qun','hiddenboss','bossallowed']],
	"boss_taowu1":["male","qun",13,["boss_xiemei","boss_shehun","boss_lingsi","boss_shanhai3"],['qun','hiddenboss','bossallowed']],
	"boss_taotie1":["male","qun",13,["boss_xiemei","boss_taoyuan","boss_duoling","boss_shanhai3"],['qun','hiddenboss','bossallowed']],
	"boss_zhuyin1":["male","qun",15,["xinjushou","boss_jingxin","rezhiyi","boss_yazi"],['qun','hiddenboss','bossallowed']],
	"boss_qilin1":["male","qun",3,["boss_xiangruia"],['qun','hiddenboss','bossallowed']],
	"boss_zhuquejiangling":["male","qun",8,["boss_xiongqv","boss_lihuo","boss_fengxinga","boss_beiminga"],['qun','hiddenboss','bossallowed']],
	"boss_xuanwujiangling":["female","qun",8,["boss_xiongqv","boss_zhenlei","boss_leilia","boss_lingsia"],['qun','hiddenboss','bossallowed']],
	"boss_xiaohu1":["male","qun",6,["boss_yvtu","boss_wuyou","boss_xiongqv","boss_weihu"],['qun','hiddenboss','bossallowed']],
	
	"boss_yanluowanga":["male","qun",18,["boss_tiemianhong","boss_difua","boss_zhennub","boss_xingpan","boss_dianwei","boss_xuanpan"],['qun','hiddenboss','bossallowed']],
	"boss_riyeyoushen":["male","qun",10,["boss_zhoucha","boss_yezhong","boss_huiyun","boss_duane","boss_yvguan3"],['qun','hiddenboss','bossallowed']],
	"boss_niutoumamian":["male","qun",12,["boss_xiaoshoua","boss_manji","boss_shiyv","boss_guizhao","boss_yvguan3"],['qun','hiddenboss','bossallowed']],
	"boss_heibaiwuchang":["male","qun",12,["boss_xixinga","boss_taipinga","boss_mizuia","boss_qiangzhenga","boss_yvguan3"],['qun','hiddenboss','bossallowed']],
	"boss_mengpoa":["female","qun",12,["boss_aotang","boss_yunjv","boss_guimeib","boss_yvguan2"],['qun','hiddenboss','bossallowed']],
	"boss_yvsai":["female","qun",12,["boss_guixi","boss_anchao","boss_guimeib","boss_yvguan3"],['qun','hiddenboss','bossallowed']],
	"boss_niaozui":["male","qun",10,["boss_bingyi","boss_suoxue","boss_guimeib","boss_yvguan3"],['qun','hiddenboss','bossallowed']],
	"boss_huangfeng":["male","qun",7,["boss_duzhen","boss_mingchong","boss_guimeib","boss_yvguan3"],['qun','hiddenboss','bossallowed']],
	"boss_baowei":["male","qun",9,["boss_yinsha","boss_eli","boss_guimeib","boss_yvguan3"],['qun','hiddenboss','bossallowed']],
	"boss_guiwang":["male","qun",30,["boss_jizhou1","boss_danshi","boss_tiemianhong","boss_chihu","boss_yvguan4"],['qun','hiddenboss','bossallowed']],
	
	"boss_langqinbiao":["female","shen",2,["boss_yingying","boss_abaaba","boss_miaowu","boss_chiliu"],['shen','boss','bossallowed'],'zhu'],
	
	"boss_zhangrang1":["male","qun",80,["boss_guanshi","boss_huoluan","boss_xvmou","boss_jiquan","boss_luanzheng"],['qun','boss','bossallowed'],'qun'],
	"boss_machao1":["male","shen",25,["boss_tieji1","boss_xiongshi","boss_mashu1","boss_qianji"],['shen','boss','bossallowed'],'zhu'],
	"boss_ling":["male","qun","0/4",["xinjuejing","buqu","boss_fanshia","boss_miewua"],['shen','boss','bossallowed'],'zhu'],
	//"boss_sanguoliemaren":["male","qun",10,["boss_majuna","boss_malianga","boss_machaoa","boss_mazhonga"],['shen','boss','bossallowed'],'shen'],
	
	"boss_alhg_qidala":["male","qun",6,["boss_qida","boss_aogang2"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_jingzishibing":["male","qun",3,["boss_jingying"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_qijiasi":["male","qun",2,["boss_qijia"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_xiruonuosi":["male","qun",1,["boss_shenou","boss_baoxing","boss_aogang3"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_xiruonuosizuoshou":["male","qun",5,["boss_zuidun"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_xiruonuosiyoushou":["male","qun",5,["boss_zuiren"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_sheshenyi":["male","qun",Infinity,["boss_shenhuang","boss_pangqv"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_dazi":["male","qun",10,["boss_anxi","boss_xieqv","boss_aogang4"],['qun','hiddenboss','bossallowed']],
	"boss_alhg_zhishen":["male","qun",18,["boss_shenzong","boss_shenyia","boss_shenpo","boss_shenyan"],['qun','hiddenboss','bossallowed']],
	
	"boss_caocao_qqzj":["male","wei",30,["rejianxiong","boss_lingba","boss_yishen"],['wei','hiddenboss','bossallowed']],
	"boss_simayi_qqzj":["male","wei",30,["refankui","reguicai","boss_langgu","boss_yuanlv"],['wei','hiddenboss','bossallowed']],
	"boss_lvbu_qqzj":["male","qun",30,["mashu","wushuang","boss_shenji","boss_zhankai"],['qun','hiddenboss','bossallowed']],
	"boss_dongzhuo_qqzj":["male","qun",30,["jiuchi","roulin","boss_baonue","boss_qvbu"],['qun','hiddenboss','bossallowed']],
	"boss_zhangjiao_qqzj":["male","qun",24,["guidao","releiji","boss_jianzheng","boss_yinlei"],['qun','hiddenboss','bossallowed']],
	"boss_yuanshu_qqzj":["male","qun",30,["drlt_yongsi","boss_wangzun","boss_duoxi"],['qun','hiddenboss','bossallowed']],
	
	},
	// --------------------------------------武将简介------------------------------------------//
	characterIntro:{
	"boss_machao1":"永远的神为某千面猫大佬遗弃的随笔作品，多处代码由我的喵腿千面猫大佬亲手完成。此boss技能紧密度极高，以【铁骑】为中心展开强力的输出与控场能力。",
	"boss_langqinbiao":"作者的本命武将，浪琴婊天下第一。偷偷告诉你，浪琴婊的技能是不会被抹去和失效的喔。",
	"boss_zhuquejiangling":"朱雀，是中国古代神话中的天之四灵之一，于五行主火，象征四象中的老阳。朱雀玄武命脉相连，当一方受到伤害，另一方将会摸牌。两者拥有不死之身，其阵亡后，经历短暂休整便会复活并变得更加强大。只有让两者同时阵亡才能获得胜利。",
	"boss_xuanwujiangling":"玄武，是中国古代神话中的天之四灵之一，于五行主水，象征四象中的老阴。朱雀玄武命脉相连，当一方受到伤害，另一方将会摸牌。两者拥有不死之身，其阵亡后，经历短暂休整便会复活并变得更加强大。只有让两者同时阵亡才能获得胜利。",
	},
	// --------------------------------------武将称号------------------------------------------//
	characterTitle:{
	"boss_langqinbiao":"#r作者的本命武将，浪琴婊天下第一。偷偷告诉你，浪琴婊的技能是不会被抹去和失效的喔。",
	"boss_machao1":"#b千面猫设计",
	"boss_zhuquejiangling":"#b朱雀，是中国古代神话中的天之四灵之一，于五行主火，象征四象中的老阳。朱雀玄武命脉相连，当一方受到伤害，另一方将会摸牌。两者拥有不死之身，其阵亡后，经历短暂休整便会复活并变得更加强大。只有让两者同时阵亡才能获得胜利。",
	"boss_xuanwujiangling":"#b玄武，是中国古代神话中的天之四灵之一，于五行主水，象征四象中的老阴。朱雀玄武命脉相连，当一方受到伤害，另一方将会摸牌。两者拥有不死之身，其阵亡后，经历短暂休整便会复活并变得更加强大。只有让两者同时阵亡才能获得胜利。",
	
	
	},
	// --------------------------------------武将技能------------------------------------------//
	skill:{
	boss_shanhaif:{nobracket:true},
	boss_shanhaif1:{nobracket:true},
	boss_shanhaif2:{nobracket:true},
	boss_yvguanf:{nobracket:true},
	boss_yvguanf1:{nobracket:true},
	boss_yvguanf2:{nobracket:true},
	boss_aogangf:{nobracket:true},
	boss_aogangf1:{nobracket:true},
	boss_aogangf2:{nobracket:true},
	boss_kongbai:{},
	boss_qqzijinf:{},
	
	boss_fanshia:{
	audio:"renjie2",
	group:["boss_fanshib","boss_fanshic"],
	trigger:{player:'phaseEnd'},
	forced:true,
	content:function(){
	player.loseHp();
	}
	},
	boss_fanshib:{
	trigger:{global:'phaseBefore'},
	forced:true,
	popup:false,
	filter:function(event,player){
	return player.hp<1
	},
	content:function(){
	player.dying({});
	}
	},
	boss_fanshic:{
	init:function(player){
	if(player.identity=='zhu'){
	player.maxHp--
	player.hp--;
	player.update();
	}
	},
	},
	boss_mojiana:{
	trigger:{
	player:"phaseBegin",
	},
	audio:"olluanji",
	forced:true,
	content:function (){
	var list=game.filterPlayer(function(current){
	return player.canUse('wanjian',current)&&current.isEnemyOf(player);
	});
	list.sort(lib.sort.seat);
	player.useCard({name:'wanjian'},list);
	},
	},
	boss_qvshoua:{
	trigger:{
	player:"phaseBegin",
	},
	audio:"manyi",
	forced:true,
	content:function (){
	var list=game.filterPlayer(function(current){
	return player.canUse('nanman',current)&&current.isEnemyOf(player);
	});
	list.sort(lib.sort.seat);
	player.useCard({name:'nanman'},list);
	},
	},
	"boss_guihuoa":{
	trigger:{
	player:"phaseJieshuBegin",
	},
	audio:"xintan",
	direct:true,
	content:function (){
	"step 0"
	player.chooseTarget(get.prompt("boss_guihuoa"),function(card,player,target){
	return player!=target;
	}).ai=function(target){
	return get.damageEffect(target,player,player,'fire');
	}
	"step 1"
	if(result.bool){
	player.logSkill("boss_guihuoa",result.targets);
	result.targets[0].damage('fire');
	}
	},
	},
	"boss_modaoa":{
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	//audio:"rebiyue",
	forced:true,
	content:function (){
	player.draw(2);
	},
	},
	"boss_guimeia":{
	mod:{
	maxHandcardBase:function (player,num){
	return num+=4;
	},
	},
	},
	"boss_shanhai":{
	nobracket:true,
	trigger:{global:'gameStart'},
	forced:true,
	popup:false,
	priority:-20,
	content:function(){
	'step 0'
	var boss=game.findPlayer(function(current){
	return current.name=="boss_xiaohu1"||current.name=="boss_qilin1"
	});
	if(boss){
	if(boss.getFriends().contains(boss.nextSeat.nextSeat)) boss.nextSeat.nextSeat.storage.weizhi=4
	if(boss.getFriends().contains(boss.nextSeat)) boss.nextSeat.storage.weizhi=3
	boss.storage.weizhi=2
	if(boss.getFriends().contains(boss.previousSeat)) boss.previousSeat.storage.weizhi=1
	}
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if((pian=="boss_ruilinjiangshi"&&!game.hasPlayer(function(current){
	return current.name=="boss_qilin1"
	}))||(pian=="boss_huhushengwei"&&!game.hasPlayer(function(current){
	return current.name=="boss_xiaohu1"
	}))){
	if(player.nextSeat==player.previousSeat){
	player.nextSeat.storage.weizhi=1
	} else if(player.nextSeat.nextSeat.nextSeat!=player){
	player.nextSeat.nextSeat.nextSeat.storage.weizhi=4
	player.nextSeat.nextSeat.nextSeat.changeSeat(game.me==game.boss?6:4);
	player.nextSeat.nextSeat.storage.weizhi=3
	player.nextSeat.nextSeat.changeSeat(game.me==game.boss?4:3);
	player.nextSeat.storage.weizhi=1
	} else if(player.nextSeat.nextSeat!=player){
	player.nextSeat.nextSeat.storage.weizhi=3
	player.nextSeat.nextSeat.changeSeat(game.me==game.boss?4:3);
	player.nextSeat.storage.weizhi=1
	}
	}else event.goto(2)
	'step 1'
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	var zhao
	if(pian=="boss_ruilinjiangshi") zhao="boss_qilin1"
	if(pian=="boss_huhushengwei") zhao="boss_xiaohu1"
	var fellow=game.addFellow(game.me==game.boss?3:2,zhao,'zoominanim');
	fellow.storage.weizhi=2
	fellow.side=false;
	fellow.identity='zhong';
	fellow.setIdentity('盟');
	game.addVideo('setIdentity',fellow,'zhong');
	"step 2"
	player.smoothAvatar();
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if(pian=="boss_jianghunjuexing"){
	player.init(['boss_xvzhu_hun','boss_ganning_hun','boss_guanyv_hun','boss_diaochan_hun'].randomGet());
	game.addVideo('reinit2',player,player.name);
	}
	if(pian=="boss_qvzhunianshou"||pian=="boss_qvguibixie"){
	player.init(['boss_chi1','boss_mei1','boss_wang1','boss_liang1'].randomGet());
	game.addVideo('reinit2',player,player.name);
	}
	if(pian=="boss_ruilinjiangshi"){
	player.init(['boss_qiongqi1','boss_hundun1'].randomGet());
	game.addVideo('reinit2',player,player.name);
	if(game.me==game.boss) game.boss.previousSeat.changeSeat(5);
	}
	if(pian=="boss_huhushengwei"){
	player.init("boss_xuanwujiangling");
	player.clearSkills();
	player.addSkill("boss_xiongqv2")
	if(game.me==game.boss){
	//game.boss.nextSeat.changeSeat(2);
	game.boss.previousSeat.changeSeat(5);
	}
	var fellow=game.addFellow(game.me==game.boss?7:6,"boss_zhuquejiangling",'zoominanim');
	fellow.clearSkills();
	fellow.addSkill("boss_xiongqv1")
	fellow.side=true;
	fellow.identity='zhong';
	fellow.setIdentity('zhu');
	game.addVideo('setIdentity',fellow,'zhong');
	}
	}
	},
	boss_shanhai2:{
	mode:['boss'],
	fixed:true,
	global:'boss_shanhai2x',
	trigger:{player:'dieBegin'},
	silent:true,
	content:function(){
	player.hide();
	game.addVideo('hidePlayer',player);
	}
	},
	boss_shanhai2x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-20,
	fixed:true,
	globalFixed:true,
	filter:function(event){
	if(lib.config.mode!='boss') return false;
	return event.player==game.boss&&event.player.hasSkill('boss_shanhai2');
	},
	content:function(){
	'step 0'
	game.delay();
	'step 1'
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if(pian=="boss_jianghunjuexing"){
	game.changeBoss(['boss_simayi_hun','boss_zhouyv_hun','boss_zhugeliang_hun'].randomGet());
	}
	if(pian=="boss_qvzhunianshou"||pian=="boss_qvguibixie"){
	game.changeBoss(['boss_mamian1','boss_niutou1'].randomGet());
	}
	if(pian=="boss_ruilinjiangshi"){
	game.changeBoss(['boss_taowu1','boss_taotie1'].randomGet());
	}
	}
	},
	boss_shanhai3:{
	mode:['boss'],
	fixed:true,
	global:'boss_shanhai3x',
	trigger:{player:'dieBegin'},
	silent:true,
	content:function(){
	player.hide();
	game.addVideo('hidePlayer',player);
	}
	},
	boss_shanhai3x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-20,
	fixed:true,
	globalFixed:true,
	filter:function(event){
	if(lib.config.mode!='boss') return false;
	return event.player==game.boss&&event.player.hasSkill('boss_shanhai3');
	},
	content:function(){
	'step 0'
	game.delay();
	'step 1'
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if(pian=="boss_jianghunjuexing"){
	game.changeBoss(['boss_caocao_hun','boss_sunquan_hun','boss_liubei_hun','boss_lvbu_hun'].randomGet());
	}
	if(pian=="boss_qvzhunianshou"){
	game.changeBoss('boss_nianshou1');
	}
	if(pian=="boss_qvguibixie"){
	game.changeBoss(['boss_luocha1','boss_yecha1','boss_heiwuchang1','boss_baiwuchang1'].randomGet());
	}
	if(pian=="boss_ruilinjiangshi"){
	game.changeBoss('boss_zhuyin1');
	}
	}
	},
	boss_aogang:{
	nobracket:true,
	trigger:{global:'gameStart'},
	forced:true,
	popup:false,
	priority:-20,
	content:function(){
	player.smoothAvatar();
	player.init('boss_alhg_qidala');
	game.addVideo('reinit2',player,player.name);
	}
	},
	boss_aogang2:{
	mode:['boss'],
	fixed:true,
	global:'boss_aogang2x',
	trigger:{player:'dieBegin'},
	silent:true,
	nobracket:true,
	content:function(){
	'step 0'
	player.hide();
	player.nextSeat.hide();
	player.previousSeat.hide();
	game.addVideo('hidePlayer',player);
	game.addVideo('hidePlayer',player.nextSeat);
	game.addVideo('hidePlayer',player.previousSeat);
	}
	},
	boss_aogang2x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-20,
	fixed:true,
	filter:function(event){
	if(lib.config.mode!='boss') return false;
	return event.player==game.boss&&event.player.hasSkill('boss_aogang2');
	},
	content:function(){
	'step 0'
	game.delay();
	'step 1'
	game.changeBoss('boss_alhg_xiruonuosi');
	'step 2'
	var num=trigger.player.storage.boss_qida
	if(num>0){
	game.boss.maxHp=num;
	game.boss.hp=num;
	game.boss.update();
	}else{
	game.boss.maxHp=Infinity
	game.boss.hp=Infinity;
	game.boss.update();
	}
	game.delay(0.5);
	'step 3'
	game.changeBoss('boss_alhg_xiruonuosizuoshou',game.boss.previousSeat);
	game.changeBoss('boss_alhg_xiruonuosiyoushou',game.boss.nextSeat);
	'step 4'
	while(_status.event.name!='phaseLoop'){
	_status.event=_status.event.parent;
	}
	game.resetSkills();
	_status.paused=false;
	_status.event.player=game.boss;
	_status.event.step=0;
	_status.roundStart=game.boss;
	game.phaseNumber=0;
	game.roundNumber=0;
	}
	},
	boss_aogang3:{
	mode:['boss'],
	fixed:true,
	global:'boss_aogang3x',
	trigger:{player:'dieBegin'},
	silent:true,
	content:function(){
	'step 0'
	player.hide();
	player.nextSeat.hide();
	//player.previousSeat.hide();
	game.addVideo('hidePlayer',player);
	game.addVideo('hidePlayer',player.nextSeat);
	//game.addVideo('hidePlayer',player.previousSeat);
	"step 1"
	game.countPlayer2(function(current){
	if(current.name=='boss_alhg_xiruonuosizuoshou'){
	current.removed=true;
	current.classList.add('dead');
	current.remove();
	game.players.remove(current);
	}
	});
	}
	},
	boss_aogang3x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-20,
	fixed:true,
	globalFixed:true,
	filter:function(event){
	if(lib.config.mode!='boss') return false;
	return event.player==game.boss&&event.player.hasSkill('boss_aogang3');
	},
	content:function(){
	'step 0'
	game.delay();
	'step 1'
	game.changeBoss('boss_alhg_dazi');
	game.delay(0.5);
	'step 2'
	game.changeBoss('boss_alhg_sheshenyi',game.boss.nextSeat);
	'step 3'
	while(_status.event.name!='phaseLoop'){
	_status.event=_status.event.parent;
	}
	game.resetSkills();
	_status.paused=false;
	_status.event.player=game.boss;
	_status.event.step=0;
	_status.roundStart=game.boss;
	game.phaseNumber=0;
	game.roundNumber=0;
	}
	},
	boss_aogang4:{
	mode:['boss'],
	fixed:true,
	global:'boss_aogang4x',
	trigger:{player:'dieBegin'},
	silent:true,
	content:function(){
	'step 0'
	player.hide();
	game.addVideo('hidePlayer',player);
	'step 1'
	game.countPlayer2(function(current){
	if(current.name=='boss_alhg_sheshenyi'){
	current.removed=true;
	current.classList.add('dead');
	current.remove();
	game.players.remove(current);
	}
	});
	}
	},
	boss_aogang4x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-20,
	fixed:true,
	filter:function(event){
	if(lib.config.mode!='boss') return false;
	return event.player==game.boss&&event.player.hasSkill('boss_aogang4');
	},
	content:function(){
	'step 0'
	game.delay();
	'step 1'
	game.changeBoss('boss_alhg_zhishen');
	game.delay(0.5);
	'step 2'
	while(_status.event.name!='phaseLoop'){
	_status.event=_status.event.parent;
	}
	game.resetSkills();
	_status.paused=false;
	_status.event.player=game.boss;
	_status.event.step=0;
	_status.roundStart=game.boss;
	game.phaseNumber=0;
	game.roundNumber=0;
	}
	},
	"boss_yvguan":{
	nobracket:true,
	trigger:{
	global:"gameStart",
	},
	popup:false,
	priority:200,
	forced:true,
	content:function (){
	'step 0'
	player.smoothAvatar();
	player.init('boss_mengpoa');
	},
	},
	boss_yvguan2:{
	mode:['boss'],
	global:'boss_yvguan2x',
	trigger:{player:'dieBegin'},
	silent:true,
	unique:true,
	fixed:true,
	filter:function(event,player){
	return player==game.boss;
	},
	content:function(){
	player.hide();
	game.addVideo('hidePlayer',player);
	}
	},
	boss_yvguan2x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-10,
	globalFixed:true,
	unique:true,
	fixed:true,
	filter:function(event){
	if(lib.config.mode!='boss') return false;
	return event.player==game.boss&&event.player.hasSkill('boss_yvguan2');
	},
	content:function(){
	'step 0'
	game.delay();
	'step 1'
	if(game.me!=game.boss){
	game.boss.changeSeat(6);
	}
	else{
	game.boss.nextSeat.changeSeat(3);
	game.boss.previousSeat.changeSeat(5);
	}
	game.changeBoss(['boss_heibaiwuchang','boss_riyeyoushen','boss_niutoumamian'].randomGet());
	game.delay(0.5);
	'step 2'
	game.addBossFellow(game.me==game.boss?1:7,['boss_niaozui','boss_huangfeng','boss_yvsai','boss_baowei'].randomGet());
	game.delay(0.5);
	}
	},
	boss_yvguan3:{
	mode:['boss'],
	fixed:true,
	global:'boss_yvguan3x',
	trigger:{player:'dieBegin'},
	silent:true,
	content:function(){
	player.hide();
	game.addVideo('hidePlayer',player);
	}
	},
	boss_yvguan3x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-20,
	fixed:true,
	globalFixed:true,
	filter:function(event,player){
	if(lib.config.mode!='boss') return false;
	return event.player.hasSkill('boss_yvguan3')&&!game.hasPlayer(function(current){
	return current.name=="boss_riyeyoushen"||current.name=="boss_niutoumamian"||current.name=="boss_heibaiwuchang"
	})&&!game.hasPlayer(function(current){
	return current.name=="boss_baowei"||current.name=="boss_yvsai"||current.name=="boss_huangfeng"||current.name=="boss_niaozui"
	})
	},
	content:function(){
	game.changeBoss('boss_guiwang');
	game.delay(0.5);
	}
	},
	boss_yvguan4:{
	mode:['boss'],
	fixed:true,
	global:'boss_yvguan4x',
	trigger:{player:'dieBegin'},
	silent:true,
	content:function(){
	player.hide();
	game.addVideo('hidePlayer',player);
	}
	},
	boss_yvguan4x:{
	trigger:{global:'dieAfter'},
	forced:true,
	priority:-20,
	fixed:true,
	globalFixed:true,
	filter:function(event,player){
	if(lib.config.mode!='boss') return false;
	return event.player==game.boss&&event.player.hasSkill('boss_yvguan4');
	},
	content:function(){
	'step 0'
	game.delay();
	'step 1'
	game.changeBoss('boss_yanluowanga');
	game.delay(0.5);
	}
	},
	boss_qqzijin:{
	trigger:{global:'gameStart'},
	popup:false,
	forced:true,
	superCharlotte:true,
	charlotte:true,
	fixed:true,
	content:function(){
	player.smoothAvatar();
	player.init(["boss_caocao_qqzj","boss_simayi_qqzj","boss_lvbu_qqzj","boss_dongzhuo_qqzj","boss_zhangjiao_qqzj","boss_yuanshu_qqzj"].randomGet());
	if(game.me!=game.boss){
	game.boss.changeSeat(6);
	}
	else{
	game.boss.nextSeat.changeSeat(3);
	game.boss.previousSeat.changeSeat(5);
	}
	var qqzj=["boss_caocao_qqzj","boss_simayi_qqzj","boss_lvbu_qqzj","boss_dongzhuo_qqzj","boss_zhangjiao_qqzj","boss_yuanshu_qqzj"]
	qqzj.remove(player.name)
	var fellow=game.addFellow(game.me==game.boss?1:7,qqzj.randomGet(),'zoominanim');
	fellow.directgain(get.cards(6));
	fellow.side=true;
	fellow.identity='zhong';
	fellow.setIdentity('zhu');
	game.addVideo('setIdentity',fellow,'zhong');
	},
	},
	boss_qqzijinx:{
	trigger:{global:'die'},
	forced:true,
	priority:-20,
	globalFixed:true,
	popup:false,
	filter:function(event,player){
	if(lib.config.mode!='boss') return false;
	if(game.hasPlayer(function(current){
	return event.player!=current&&player.getEnemies().contains(current)
	})) return false
	return true
	},
	content:function (){
	var bool=false;
	if(player==game.me) bool=true;
	else switch(get.mode()){
	case 'identity':{
	game.showIdentity();
	var id1=player.identity;
	var id2=game.me.identity;
	if(['zhu','zhong','mingzhong'].contains(id1)){
	if(['zhu','zhong','mingzhong'].contains(id2)) bool=true;
	break;
	}
	else if(id1=='fan'){
	if(id2=='fan') bool=true;
	break;
	}
	break;
	}
	case 'guozhan':{
	if(game.me.isFriendOf(player)) bool=true;
	break;
	}
	case 'versus':{
	if(player.side==game.me.side) bool=true;
	break;
	}
	case 'boss':{
	if(player.side==game.me.side) bool=true;
	break;
	}
	default:{}
	}
	game.over(bool);
	},
	},
	boss_hhshengweix:{
	trigger:{global:'dieAfter'},
	forced:true,
	popup:false,
	globalFixed:true,
	priority:-30,
	filter:function(event,player){
	if(lib.config.mode!='boss') return false;
	if(player.side==game.boss.side) return false
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if(pian!="boss_huhushengwei") return false;
	if(!game.hasPlayer(function(current){
	return !current.classList.contains('out')&&event.player!=current&&player.getEnemies().contains(current)
	})) return true
	return false
	},
	content:function (){
	var bool=false;
	if(player==game.me) bool=true;
	else switch(get.mode()){
	case 'identity':{
	game.showIdentity();
	var id1=player.identity;
	var id2=game.me.identity;
	if(['zhu','zhong','mingzhong'].contains(id1)){
	if(['zhu','zhong','mingzhong'].contains(id2)) bool=true;
	break;
	}
	else if(id1=='fan'){
	if(id2=='fan') bool=true;
	break;
	}
	break;
	}
	case 'guozhan':{
	if(game.me.isFriendOf(player)) bool=true;
	break;
	}
	case 'versus':{
	if(player.side==game.me.side) bool=true;
	break;
	}
	case 'boss':{
	if(player.side==game.me.side) bool=true;
	break;
	}
	default:{}
	}
	game.over(bool);
	},
	},
	"hanyong1":{
	trigger:{
	player:"useCard",
	},
	audio:"hanyong",
	filter:function (event,player){
	return game.roundNumber>=player.hp&&event.card&&(event.card.name=='nanman'||event.card.name=='wanjian'||(event.card.name=='sha'&&get.color(event.card)=='black'));
	},
	content:function (){
	trigger.baseDamage++;
	},
	},
	"boss_jvhuo":{
	audio:"ranshang",
	trigger:{
	player:"damageBegin",
	},
	filter:function (event){
	return event.nature=='fire';
	},
	forced:true,
	content:function (){
	trigger.num+=2
	},
	},
	"boss_zhennu":{
	//audio:"hanyong",
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	forced:true,
	unique:true,
	content:function (){
	"step 0"
	event.players=get.players(player);
	event.players.remove(player);
	"step 1"
	if(event.players.length){
	event.players.shift().damage();
	event.redo();
	}
	},
	},
	"boss_aotang":{
	trigger:{
	player:"phaseBegin",
	},
	audio:"boss_wanghun",
	forced:true,
	content:function (){
	var list=game.players.slice(0);
	list.remove(player);
	var target=list.randomGet();
	player.line(target);
	target.addSkill('boss_aotang_2');
},
	group:"boss_aotang_1",
	subSkill:{
	"1":{
	trigger:{
	player:["phaseBegin","dieBegin"],
	},
	direct:true,
	priority:20,
	forced:true,
	content:function (){
	game.countPlayer(function(current){
	if(current.hasSkill('boss_aotang_2')){
	current.removeSkill('boss_aotang_2');
	}
	});
	},
	sub:true,
	},
	"2":{
	init:function (player,skill){
	var skills=player.getSkills(true,false);
	skills.remove('boss_aotang_2')
	for(var i=0;i<skills.length;i++){
	if(get.skills[i]){
	skills.splice(i--,1);
	} 
	}
	player.disableSkill(skill,skills);
	},
	onremove:function (player,skill){
	player.enableSkill(skill);
	},
	mark:true,
	marktext:"遗",
	intro:{
	name:"遗忘",
	content:function (storage,player,skill){
	var list=[];
	for(var i in player.disabledSkills){
	if(player.disabledSkills[i].contains(skill)){
	list.push(i)
	}
	}
	if(list.length){
	var str='遗忘技能：';
	for(var i=0;i<list.length;i++){
	if(lib.translate[list[i]+'_info']){
	str+=get.translation(list[i])+'/';
	}
	}
	return str.slice(0,str.length-1);
	}
	},
	},
	sub:true,
	forced:true,
	popup:false,
	},
	},
	},
	"boss_yunjv":{
	trigger:{
	global:"phaseAfter",
	},
	audio:"boss_shiyou",
	forced:true,
	filter:function (event,player,target){
	return player.getEnemies().contains(event.player)&&player!=event.player&&event.player.countCards("h");
	},
	content:function (){
	var hs=trigger.player.getCards('h');
	if(hs.length){
	trigger.player.discard(hs.randomGet());
	}
	},
	},
	"boss_guimeib":{
	group:["boss_guimeib_fanmian","boss_guimeib_begin","boss_guimeib_draw","boss_guimeib_use","boss_guimeib_discard","boss_guimeib_end"],
	subSkill:{
	begin:{
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	forced:true,
	popup:false,
	content:function (){
	player.storage.boss_guimeib_draw=true;
	player.storage.boss_guimeib_use=true;
	},
	sub:true,
	},
	draw:{
	trigger:{
	player:"phaseDrawBegin",
	},
	forced:true,
	popup:false,
	content:function (){
	player.storage.boss_guimeib_draw=false;
	},
	sub:true,
	},
	use:{
	trigger:{
	player:"phaseUseBegin",
	},
	forced:true,
	popup:false,
	content:function (){
	player.storage.boss_guimeib_use=false;
	},
	sub:true,
	},
	discard:{
	trigger:{
	player:"phaseDiscardBefore",
	},
	forced:true,
	filter:function (event,player){
	if(player.storage.boss_guimeib_use) return true;
	return false;
	},
	content:function (){
	trigger.cancel();
	},
	sub:true,
	},
	end:{
	trigger:{
	player:"phaseUseBegin",
	},
	forced:true,
	filter:function (event,player){
	if(player.storage.boss_guimeib_draw) return true;
	return false;
	},
	content:function (){
	player.draw();
	},
	sub:true,
	},
	fanmian:{
	trigger:{
	player:"turnOverBefore",
	},
	priority:20,
	forced:true,
	filter:function (event,player){
	return !player.isTurnedOver();
	},
	content:function (){
	trigger.cancel();
	game.log(player,'取消了翻面');
	},
	sub:true,
	},
	},
	},
	"boss_xixinga":{
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	audio:"xinleiji",
	forceDie:true,
	forced:true,
	content:function (){
	var list=game.filterPlayer(function(current){
	return player.getEnemies().contains(current)&&!game.hasPlayer(function(target){
	return player.getEnemies().contains(target)&&target.hp>current.hp;
	});
	});
	if(list.length&&player.storage.boss_yvguan=='休闲'){
	var target=list.randomGet()
	player.line(target);
	target.damage('thunder')
	}
	else if(list.length&&player.storage.boss_yvguan=='普通'){
	var target=list.randomGet()
	player.line(target);
	target.damage([1,2].randomGet(),'thunder')
	}
	else{
	game.countPlayer(function(current2){
	if(current2!=player&&player.getEnemies().contains(current2)){
	current2.damage('thunder')
	}
	});
	}
	player.recover()
	},
	},
	"boss_taipinga":{
	trigger:{
	player:"damageEnd",
	},
	//audio:"refankui",
	forced:true,
	filter:function (event,player){
	return event.source&&event.source.countGainableCards(player,'h')&&event.num>0&&event.source!=player
	},
	content:function (){
	"step 0"
	event.count=trigger.num;
	if(player.storage.boss_yvguan=='休闲'||player.storage.boss_yvguan=='普通') event.count=1;
	"step 1"
	event.count--;
	var next=trigger.source.chooseToDiscard('h',2,'弃置两张花色不同的手牌',function(card){
	if(ui.selected.cards.length){
	return get.suit(card)!=get.suit(ui.selected.cards[0]);
	}
	return trigger.source.countCards('h')
	}).set('complexCard',true);
	next.ai=function(card){
	return 7-get.value(card);
	};
	"step 2"
	if(result.bool==false) trigger.source.loseHp()
	if(event.count) event.goto(1)
	},
	},
	"boss_mizuia":{
	trigger:{
	source:"damageEnd",
	},
	audio:"oljiuchi",
	check:function (event,player){
	return get.attitude(player,event.player)<0;
	},
	filter:function (event,player){
	return event.card&&event.card.name=='sha'&&(event.nature||get.color(event.card)=='red');
	},
	content:function (){
	var num=[]
	if(player.storage.boss_yvguan=='休闲') num=1
	else num=2
	player.discardPlayerCard('he',trigger.player,num,true)
	},
	},
	"boss_qiangzhenga":{
	audio:"hengzheng",
	trigger:{
	player:"phaseJieshuBegin",
	},
	direct:true,
	forced:true,
	unique:true,
	filter:function (event,player){
	return game.hasPlayer(function(current){
	return player.getEnemies().contains(current)&&current.countCards('h');
	});
	},
	content:function (){
	if(player.storage.boss_yvguan=='普通'){
	game.countPlayer(function(current2){
	if(current2.countCards('h')==1&&player.getEnemies().contains(current2)){
	var card=current2.getCards('h').randomGet();
	player.gain(card,current2);
	current2.$giveAuto(card,player);
	player.logSkill('boss_qiangzhenga')
	}
	});
	}
	else{
	game.countPlayer(function(current3){
	if(current3.countCards('h')<3&&player.getEnemies().contains(current3)){
	var card1=current3.getCards('h').randomGet();
	player.gain(card1,current3);
	current3.$giveAuto(card1,player);
	player.logSkill('boss_qiangzhenga')
	}
	});
	}
	},
	},
	"boss_xiaoshoua":{
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	audio:"liewei",
	forced:true,
	filter:function (event,player,target){
	
	return game.hasPlayer(function(current){
	var n=[]
	if(player.storage.boss_yvguan=='休闲'||player.storage.boss_yvguan=='普通') n=current.hp>player.hp
	else n=current.hp>=player.hp
	return player!=current&&n&&player.getEnemies().contains(current)
	})
	},
	content:function (){
	"step 0"
	player.chooseTarget('对一名敌人造成伤害。',function(card,player,target){
	var n=[]
	if(player.storage.boss_yvguan=='休闲'||player.storage.boss_yvguan=='普通') n=target.hp>player.hp
	else n=target.hp>=player.hp
	return player!=target&&n&&player.getEnemies().contains(target);
	},function(target){
	var att=get.attitude(player,target);
	return -att;
	});
	"step 1"
	if(result.bool){
	 if(player.storage.boss_yvguan=='休闲'){
	result.targets[0].damage();
	}
	else result.targets[0].damage(2);
	}
	
	},
	},
	"boss_manji":{
	shaRelated:true,
	audioname:["re_pangde"],
	trigger:{
	player:"useCardToBefore",
	},
	audio:"cuorui",
	filter:function (event,player){
	return event.card.name=='sha'&&event.target.countDiscardableCards(player,'he')>0;
	},
	direct:true,
	content:function (){
	'step 0'
	player.discardPlayerCard(trigger.target,get.prompt('boss_manji',trigger.target)).set('ai',function(button){
	if(!_status.event.att) return 0;
	return 1;
	}).set('logSkill',['boss_manji',trigger.target]).set('att',get.attitude(player,trigger.target)<=0);
	'step 1'
	if(result.bool&&result.links&&result.links.length){
	if(result.links[0].name=='sha'){
	trigger.baseDamage++
	}
	else if(player.storage.boss_yvguan!='休闲'){
	player.gain(result.links[0],'gain2','log');
	}
	}
	},
	},
	"boss_shiyv":{
	trigger:{
	player:"phaseDrawBegin1",
	},
	//audio:"nzry_chenglve",
	forced:true,
	filter:function (event,player){
	return !event.numFixed;
	},
	content:function (){
	trigger.changeToZero();
	var list=[];
	var list0=[];
	var list1=[];
	var list2=[];
	get.cardPile(function(card){
	if(get.suit(card)=='spade') list.push(card);
	});
	get.cardPile(function(card2){
	if(get.suit(card2)=='heart') list2.push(card2);
	});
	get.cardPile(function(card1){
	if(get.suit(card1)=='club') list1.push(card1);
	});
	get.cardPile(function(card0){
	if(get.suit(card0)=='diamond') list0.push(card0);
	});
	var card=[]
	var cards=[]
	card.push(list.randomGet())
	card.push(list2.randomGet())
	card.push(list1.randomGet())
	card.push(list0.randomGet())
	for(var i=0;i<card.length;i++){
	cards.push(card[i]);
	};
	if(cards.length){
	player.gain(cards,'draw2');
	}
	},
	},
	"boss_guizhao":{
	trigger:{
	player:"useCard",
	},
	// audio:"nzry_shicai_2",
	init:function (player){
	player.storage.yyy=true;
	player.storage.ababab=true;
	player.storage.biubiubiu=true;
	},
	forced:true,
	direct:true,
	filter:function (event,player){
	if(player.storage.yyy==false&&player.storage.ababab==false&&player.storage.biubiubiu==false) return false;
	return true
	},
	content:function (){
	if(player.storage.yyy==true&&get.type(trigger.card)=='basic'){
	player.draw()
	player.storage.yyy=false
	player.logSkill('boss_guizhao')
	}
	if(player.storage.ababab==true&&get.type(trigger.card)=='trick'){
	player.draw()
	player.storage.ababab=false
	player.logSkill('boss_guizhao')
	}
	if(player.storage.biubiubiu==true&&get.type(trigger.card)=='equip'){
	player.draw()
	player.storage.biubiubiu=false
	player.logSkill('boss_guizhao')
	}
	},
	group:"boss_guizhao_1",
	subSkill:{
	"1":{
	trigger:{
	global:"phaseAfter",
	},
	silent:true,
	content:function (){
	player.storage.yyy=true;
	player.storage.ababab=true;
	player.storage.biubiubiu=true;
	},
	sub:true,
	forced:true,
	popup:false,
	},
	},
	},
	"boss_zhoucha":{
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	// audio:"decadepojun",
	forced:true,
	unique:true,
	content:function (){
	"step 0"
	player.judge(function(card){
	return get.color(card)=='red'?1:0;
	});
	"step 1"
	player.gain(result.card);
	player.$gain2(result.card);
	if(result.color=='red'){
	player.addTempSkill('boss_zhoucha_1');
	}
	},
	subSkill:{
	"1":{
	mod:{
	cardUsable:function (card,player,num){
	if(card.name=='sha') return num+=2;
	},
	},
	sub:true,
	},
	},
	},
	"boss_yezhong":{
	trigger:{
	player:"phaseJieshuBegin",
	},
	//audio:"decadepojun",
	forced:true,
	unique:true,
	content:function (){
	"step 0"
	player.judge(function(card){
	return get.color(card)=='black'?1:0;
	});
	"step 1"
	player.gain(result.card);
	player.$gain2(result.card);
	if(result.color=='black'){
	game.countPlayer(function(current){
	if(current!=player&&player.getEnemies().contains(current)){
	var hs=current.getCards('h');
	if(hs.length){
	current.discard(hs.randomGet());
	}
	}
	})
	}
	},
	},
	"boss_duane":{
	trigger:{
	global:"phaseDiscardAfter",
	},
	//audio:"rejuece",
	filter:function (event,player){
	if(player==event.player) return false;
	if(player.getFriends().contains(event.player)) return false;
	if(event.cards){
	for(var i=0;i<event.cards.length;i++){
	if(get.color(event.cards[i],'black')=='black') return true;
	}
	}
	return false;
	},
	forced:true,
	content:function (){
	trigger.player.loseHp()
	},
	},
	"boss_huiyun":{
	enable:"phaseUse",
	usable:1,
	//audio:"kuiji",
	filterTarget:function (card,player,target){
	return player!=target&&target.countCards('h');
	},
	content:function (){
	"step 0"
	player.chooseCardButton(true,target,target.getCards('h'),[1,2]).set('ai',function(card){
	return get.value(card);
	});
	"step 1"
	if(result.bool){
	target.discard(result.links.slice(0));
	var qbx=[]
	if(result.links.slice(0).length>1) qbx='或与'+get.translation(result.links[1])
	player.chooseToDiscard('弃置一张与'+get.translation(result.links[0])+qbx+'同名的牌对'+get.translation(target)+'造成两点伤害',function(card){
	var abc=card.name==result.links[0].name
	if(result.links.slice(0).length>1) abc=card.name==result.links[0].name||card.name==result.links[1].name;
	return abc
	}).set('ai',function(card){
	if(get.attitude(player,target)<0){
	return 10-get.value(card);
	}
	return 0;
	})
	}
	"step 2"
	if(result.bool) target.damage(2)
	},
	ai:{
	order:11,
	result:{
	target:function (player,target){
	return -target.countCards('h');
	},
	},
	threaten:1.1,
	},
	},
	"boss_yinsha":{
	trigger:{
	global:"phaseUseBegin",
	},
	// audio:"biluan",
	forced:true,
	filter:function (event,player,target){
	return event.player.countCards("h")>event.player.maxHp;
	},
	content:function (){
	player.addTempSkill('boss_yinsha_1')
	},
	subSkill:{
	"1":{
	mod:{
	targetEnabled:function (card,player,target,now){
	if(card.name=='sha') return false;
	},
	},
	sub:true,
	},
	},
	},
	"boss_eli":{
	trigger:{
	source:"damageBegin",
	},
	//audio:"oldqianxi",
	usable:1,
	forced:true,
	unique:true,
	content:function (){
	"step 0"
	player.judge(function(card){
	return get.color(card)=='red'?1:0;
	});
	"step 1"
	if(result.color=='red'){
	trigger.num++
	}
	if(result.color=='black'){
	player.addTempSkill('wansha');
	}
	},
	},
	"boss_bingyi":{
	trigger:{
	player:"loseAfter",
	global:["equipAfter","addJudgeAfter","gainAfter","loseAsyncAfter"],
	},
	// audio:"chulao",
	usable:1,
	forced:true,
	filter:function (event,player){
	if(player.countCards('h')) return false;
	var evt=event.getl(player);
	return evt&&evt.player==player&&evt.hs&&evt.hs.length>0;
	},
	content:function (){
	player.draw(6);
	},
	ai:{
	threaten:0.8,
	effect:{
	target:function (card){
	if(card.name=='guohe'||card.name=='liuxinghuoyu') return 0.5;
	},
	},
	noh:true,
	skillTagFilter:function (player,tag){
	if(tag=='noh'){
	if(player.countCards('h')!=1) return false;
	}
	},
	},
	},
	"boss_suoxue":{
	shaRelated:true,
	trigger:{
	player:"useCardToBefore",
	},
	direct:true,
	filter:function (event,player){
	return event.card.name=='sha'&&event.target.countDiscardableCards(player,'h')!=player.countCards('h');
	},
	// audio:"new_jiangchi",
	content:function (){
	"step 0"
	var num1=player.countCards('h');
	var num2=trigger.target.countCards('h');
	if(num1>num2){
	player.chooseToDiscard('h')
	trigger.directHit=true;
	player.logSkill('boss_suoxue');
	game.playMY('new_jiangchi');
	}
	else{
	event.draw=true;
	event.num=Math.min(num2)-num1;
	player.chooseBool(get.prompt2('boss_suoxue'));
	}
	"step 1"
	if(result.bool){
	if(event.draw){
	game.playMY('new_jiangchi');//语音
	player.logSkill('boss_suoxue',trigger.target);
	player.draw(event.num);
	}
	}
	},
	},
	"boss_duzhen":{
	trigger:{
	player:"useCardToPlayered",
	},
	// audio:"remieji",
	forced:true,
	filter:function (event,player){
	return player.getEnemies().contains(event.target)&&player==_status.currentPhase&&event.targets.length==1&&event.target.countCards('he')>0&&event.target!=player;
	},
	content:function (){
	var yyy='h'
	if(trigger.target.countCards('e')>0) yyy='e'
	var hs=trigger.target.getCards(yyy);
	if(hs.length){
	trigger.target.discard(hs.randomGet());
	}
	},
	},
	"boss_mingchong":{
	trigger:{
	player:"dieBegin",
	},
	// audio:"yechou",
	forced:true,
	filter:function (event,player,target){
	return game.hasPlayer(function(current){
	return current!=player&&player.getFriends().contains(current)
	})
	},
	content:function (){
	game.countPlayer(function(current1){
	if(current1!=player&&player.getFriends().contains(current1)){
	current1.addSkill('boss_duzhen');
	}
	})
	},
	},
	"boss_guixi":{
	trigger:{
	player:"damageEnd",
	},
	//audio:"renshi",
	forced:true,
	content:function (){
	"step 0"
	player.judge(function(card){
	return get.suit(card)=='heart'?1:-1;
	});
	"step 1"
	if(result.suit=='heart'){
	player.recover();
	}else{
	player.loseHp();
	}
	},
	},
	"boss_anchaoa":{
	trigger:{
	global:"phaseAfter",
	},
	//audio:"rechanhui",
	direct:true,
	forced:true,
	filter:function (event,player,target){
	return (event.player==player||player.getFriends().contains(event.player));
	},
	content:function (){
	var stat=trigger.player.getStat();
	var num=trigger.player.storage.boss_anchaoa_1
	if(!stat.damage){
	trigger.player.addMark('boss_anchaoa_1',1);
	player.logSkill('boss_anchao')
	}
	if(stat.damage&&stat.damage>0&&num>0){//stat=trigger.player.getStat();
	trigger.player.removeMark('boss_anchaoa_1',num);
	player.logSkill('boss_anchao')
	}
	},
	subSkill:{
	"1":{
	init:function (player){
	player.storage.boss_anchaoa_1=0;
	},
	marktext:"潮",
	intro:{
	name:"暗潮",
	content:"当前有#个暗潮",
	},
	sub:true,
	},
	"2":{
	trigger:{
	player:"dieBegin",
	},
	direct:true,
	forced:true,
	filter:function (event,player,target){
	return game.hasPlayer(function(current){
	return current!=player&&current.storage.boss_anchaoa_1>0
	})
	},
	content:function (){
	game.countPlayer(function(current1){
	if(current1!=player&&current1.storage.boss_anchaoa_1>0){
	var num=current1.storage.boss_anchaoa_1
	current1.removeMark('boss_anchaoa_1',num);
	}
	})
	},
	sub:true,
	},
	},
	},
	"boss_anchao":{
	trigger:{
	global:["damageBegin4","phaseDrawBegin2"],
	},
	group:["boss_anchaoa_2","boss_anchaoa"],
	// audio:"rechanhui",
	forced:true,
	filter:function (event,player,name){
	if(name=='damageBegin4') return event.source.hasMark('boss_anchaoa_1')
	else return event.player.hasMark('boss_anchaoa_1')&&!event.numFixed;
	},
	content:function (){
	if(event.triggername=='damageBegin4'){
	var sh=trigger.source.storage.boss_anchaoa_1
	player.line(trigger.source,'green');
	trigger.num+=sh;
	}
	else{
	var cp=trigger.player.storage.boss_anchaoa_1 
	player.line(trigger.player,'green');
	trigger.num+=cp;
	}
	},
	},
	"boss_tiemianhong":{
	trigger:{
	target:"useCardToTargeted",
	},
	audio:"yizhong",
	forced:true,
	filter:function (event,player){
	if(event.card.name!='sha') return false;
	if(get.color(event.card)!='red') return false;
	if(Math.random()>75/100) return false;
	return true;
	},
	content:function (){
	trigger.getParent().excluded.add(player); 
	},
	},
	"boss_jizhou1":{
	init:function (player){
	player.storage.boss_jizhou1=0;
	},
	intro:{
	content:"当前有#枚标记",
	},
	trigger:{
	global:"phaseUseAfter",
	},
	//audio:"zhoufu",
	forced:true,
	filter:function (event,player,target){
	return player.getEnemies().contains(event.player)
	},
	content:function (){
	'step 0'
	player.judge();
	'step 1'
	var num=result.number;
	var next=trigger.player.chooseToDiscard('弃置任意张点数之和大于'+get.cnNumber(num)+'的牌',function(card){
	var num=0;
	for(var i=0;i<ui.selected.cards.length;i++){
	num+=get.number(ui.selected.cards[i]);
	}
	return get.number(card)+num<Infinity;
	},'he');
	next.set('num',num);
	next.set('complexCard',true);
	next.set('selectCard',function(){
	var num=0;
	for(var i=0;i<ui.selected.cards.length;i++){
	num+=get.number(ui.selected.cards[i]);
	}
	if(num>_status.event.num) return ui.selected.cards.length;
	return ui.selected.cards.length+2;
	});
	next.set('cardResult',function(){
	var cards=trigger.player.getCards('he');
	var l=cards.length;
	var all=Math.pow(l,2);
	var list=[];
	for(var i=1;i<all;i++){
	var array=[];
	for(var j=0;j<l;j++){
	if(Math.floor((i%Math.pow(2,j+1))/Math.pow(2,j))>0) array.push(cards[j])
	}
	var numx=0;
	for(var k of array){
	numx+=get.number(k);
	}
	if(numx>num) list.push(array);
	}
	if(list.length){
	list.sort(function(a,b){
	return get.value(a)-get.value(b);
	});
	return list[0];
	}
	return list;
	}());
	next.set('ai',function(card){
	if(!_status.event.cardResult.contains(card)) return 0;
	return 6-get.value(card);
	});
	'step 2'
	if(result.bool){
	var pooo=2
	if(player.storage.boss_yvguan=='休闲') pooo=1
	if(result.cards.length>pooo){
	player.storage.boss_jizhou1++;
	player.markSkill('boss_jizhou1');
	}
	}else trigger.player.loseHp()
	},
	},
	"boss_danshi":{
	trigger:{
	player:"damageBegin",
	},
	//audio:"new_reyaowu",
	forced:true,
	filter:function (event,player,target){
	return player.storage.boss_jizhou1>0;
	},
	content:function (){
	var rbq=player.storage.boss_jizhou1
	trigger.num+=rbq
	player.storage.boss_jizhou1--
	},
	},
	"boss_chihu":{
	trigger:{
	player:"phaseDrawBegin2",
	},
	//audio:"xinfu_yisuan",
	forced:true,
	filter:function (event,player){
	return game.hasPlayer(function(current){
	return player.countCards('h')<current.countCards('h')&&!event.numFixed;
	})
	},
	content:function (){
	trigger.num+=2;
	},
	group:"boss_chihu_1",
	subSkill:{
	"1":{
	trigger:{
	source:"damageBegin",
	},
	audio:"xinfu_langxi",
	forced:true,
	filter:function (event,player){
	return game.hasPlayer(function(current1){
	return player.hp<current1.hp
	})
	},
	content:function (){
	trigger.num++;
	},
	sub:true,
	},
	},
	},
	"boss_difua":{
	trigger:{
	global:"phaseUseBegin",
	},
	// audio:"drlt_zhenggu",
	filter:function (event,player,target){
	return player.getEnemies().contains(event.player)&&event.player.countCards("h")>event.player.maxHp;
	},
	forced:true,
	content:function (){
	var num=trigger.player.countCards("h")-trigger.player.maxHp
	trigger.player.chooseToDiscard('h',num,true)
	},
	},
	"boss_zhennub":{
	init:function (player){
	player.storage.boss_zhennub=true;
	},
	trigger:{
	player:"changeHp",
	},
	audio:"boss_baonu",
	forced:true,
	filter:function (event,player){
	return player.hp<=8&&player.storage.boss_zhennub==true;;
	},
	content:function (){
	'step 0'
	player.draw(4)
	player.storage.boss_zhennub=false;
	'step 1'
	while(_status.event.name!='phaseLoop'){
	_status.event=_status.event.parent;
	}
	game.resetSkills();
	_status.paused=false;
	_status.event.player=player;
	_status.event.step=0;
	if(game.bossinfo){
	game.bossinfo.loopType=1;
	_status.roundStart=game.boss;
	}
	},
	},
	"boss_xingpan":{
	trigger:{
	player:"phaseUseBegin",
	},
	//audio:"ziqu",
	forced:true,
	unique:true,
	content:function (){
	"step 0"
	player.judge();
	"step 1"
	if(result.color=='red'){
	var list=game.filterPlayer(function(current){
	return player.getEnemies().contains(current)&&!game.hasPlayer(function(target){
	return player.getEnemies().contains(target)&&target.countCards('h')>current.countCards('h')
	});
	});
	if(list.length==1){
	var target=list.randomGet()
	player.line(target,'green')
	target.chooseCard('h',Math.floor(target.countCards('h')/2),true,'将'+get.translation(Math.floor(target.countCards('h')/2))+'张手牌交给'+get.translation(player));
	event.target=target
	} 
	else event.finish()
	}
	if(result.color=='black'){
	var list1=game.filterPlayer(function(current1){
	return player.getEnemies().contains(current1)&&!game.hasPlayer(function(target1){
	return player.getEnemies().contains(target1)&&target1.hp>current1.hp
	});
	});
	if(list1.length==1){
	var targets=list1.randomGet()
	player.line(targets,'green')
	targets.loseHp();
	event.finish();
	}else event.finish()
	}
	"step 2"
	if(result.bool){
	event.target.give(result.cards,player,true);
	}
	},
	},
	"boss_dianwei":{
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	//audio:"xiuluo",
	forced:true,
	content:function (){
	game.countPlayer(function(current){
	if(player.getEnemies().contains(current)&&!current.countCards("e")){
	player.useCard({name:'sha'},current,false)
	}
	if(player.getEnemies().contains(current)&&current.countCards("e")){
	var eq=current.getCards('e');
	if(eq.length){
	current.discard(eq.randomGet());
	}
	}
	});
	},
	},
	"boss_xuanpan":{
	mark:true,
	marktext:"宣",
	init:function (player){
	player.storage.xuanpandamage=0
	player.storage.xuanpandiscard=0
	player.storage.xuanpandraw=0
	player.storage.xuanpanrecover=0
	},
	intro:{
	name:"宣判",
	mark:function (dialog,content,player){
	if(player.storage.xuanpandamage>0) dialog.addText('你已累计受到'+player.storage.xuanpandamage+'点伤害');
	if(player.storage.xuanpandiscard>0) dialog.addText('你已累计弃置'+player.storage.xuanpandiscard+'张牌');
	if(player.storage.xuanpandraw>0) dialog.addText(get.translation(_status.currentPhase)+'已累计摸了'+player.storage.xuanpandraw+'张牌');
	if(player.storage.xuanpanrecover>0) dialog.addText(get.translation(_status.currentPhase)+'已累计回复了'+player.storage.xuanpanrecover+'点体力');
	},
	},
	trigger:{
	player:["damageEnd","discardEnd"],
	global:["drawEnd","recoverEnd","phaseAfter"],
	},
	priority:2021,
	filter:function (event,player,name){
	if(player.getFriends().contains(_status.currentPhase)||_status.currentPhase==player) return false;
	if(name=='damageEnd') return _status.currentPhase==event.source&&event.num>0;
	if(name=='drawEnd'||name=='recoverEnd') return _status.currentPhase==event.player;
	return name=='discardEnd'||name=='phaseAfter';
	},
	direct:true,
	forced:true,
	//	audio:"shanzhuan",
	content:function (){
	var name=event.triggername
	if(name=='damageEnd') player.storage.xuanpandamage+=trigger.num;
	if(name=='discardEnd') player.storage.xuanpandiscard+=trigger.cards.length;
	if(name=='drawEnd') player.storage.xuanpandraw+=trigger.num;
	if(name=='recoverEnd') player.storage.xuanpanrecover+=trigger.num;
	if(name=='phaseAfter'){
	player.logSkill('boss_xuanpan')
	if(player.storage.xuanpandamage>3) trigger.player.damage([1,2,3,4].randomGet());
	if(player.storage.xuanpandamage>0) player.storage.xuanpandamage=0;
	if(player.storage.xuanpandiscard>3){
	var num=[999,1000,1000,1000].randomGet();
	if(num==999) trigger.player.discard('h',trigger.player.getCards('h').randomGet(),true);
	else trigger.player.discard('h',trigger.player.getCards('h').randomGets([2,3,4].randomGet()),true);
	}
	if(player.storage.xuanpandiscard>0) player.storage.xuanpandiscard=0
	if(player.storage.xuanpandraw>7) player.draw([1,2,3,4].randomGet())
	if(player.storage.xuanpandraw>0) player.storage.xuanpandraw=0;
	if(player.storage.xuanpanrecover>2) player.recover([1,2,3,4].randomGet())
	if(player.storage.xuanpanrecover>0) player.storage.xuanpanrecover=0;
	}
	},
	},
	boss_manjiab:{
	trigger:{target:['useCardToBefore','shaBegin']},
	forced:true,
	priority:6,
	group:'boss_manjia2',
	filter:function(event,player,name){
	if(player.getEquip(2)) return false;
	if(name=='shaBegin') return lib.skill.tengjia3.filter(event,player);
	return lib.skill.tengjia1.filter(event,player);
	},
	content:function(){
	trigger.cancel();
	},
	ai:{
	effect:{
	target:function(card,player,target,current){
	if(target.getEquip(2)) return;
	return lib.skill.tengjia1.ai.effect.target.apply(this,arguments);
	}
	}
	}
	},
	boss_manjiab2:{
	trigger:{player:'damageBegin3'},
	filter:function(event,player){
	if(player.getEquip(2)) return false;
	if(event.nature=='fire') return true;
	},
	forced:true,
	check:function(){
	return false;
	},
	content:function(){
	trigger.num++;
	},
	ai:{
	effect:{
	target:function(card,player,target,current){
	if(target.getEquip(2)) return;
	return lib.skill.tengjia2.ai.effect.target.apply(this,arguments);
	}
	}
	}
	},
	"boss_shanbeng1":{
	global:"boss_shanbeng2x",
	trigger:{
	player:"dieBegin",
	},
	forced:true,
	logv:false,
	content:function (){
	var targets=game.filterPlayer(function(current){
	return current.countCards('e');
	});
	player.line(targets,'green');
	game.delay();
	game.logv(player,'boss_shanbeng1',targets,null,true);
	},
	},
	boss_shanbeng2x:{
	trigger:{global:'dieAfter'},
	forced:true,
	globalFixed:true,
	filter:function(event,player){
	return player.countCards('e')>0&&event.player.hasSkill('boss_shanbeng1')&&event.player.isDead();
	},
	content:function(){
	player.discard(player.getCards('e'));
	}
	},
	"boss_beiminga":{
	trigger:{
	player:"dieBegin",
	},
	forced:true,
	filter:function (event){
	return event.source!=undefined;
	},
	content:function (){
	trigger.source.discard(trigger.source.getCards('h'));
	},
	ai:{
	threaten:0.7,
	},
	},
	"boss_qida":{
	marktext:"奇达",
	intro:{
	name:"奇达",
	content:"当前有#个“奇达”标记",
	},
	trigger:{
	global:"damageBefore",
	},
	forced:true,
	filter:function (event,player,target){
	return event.player==player&&game.hasPlayer(function(current){
	return player.getFriends().contains(current);
	})
	},
	content:function (){
	'step 0'
	player.draw(trigger.num)
	trigger.cancel()
	player.chooseTarget('将伤害转移给一名其他友方角色',true,function(card,player,target){
	return target!=player&&player.getFriends().contains(target);
	}).set('ai',function(target){
	if(target.name=="boss_alhg_qijiasi") return 10
	return 1
	})
	'step 1'
	if(result.bool){
	if(trigger.source) result.targets[0].damage(trigger.num,trigger.source)
	else result.targets[0].damage(trigger.num,"nosource")
	}
	},
	group:"boss_qida_1",
	subSkill:{
	"1":{
	trigger:{
	global:"damageBegin",
	},
	forced:true,
	filter:function (event,player,target){
	return event.num>0&&(event.player==player||player.getFriends().contains(event.player));
	},
	content:function (){
	player.addMark('boss_qida',trigger.num); 
	},
	sub:true,
	},
	},
	},
	"boss_qijia":{
	trigger:{
	player:"phaseDrawBegin",
	},
	forced:true,
	content:function (){
	trigger.num=player.maxHp
	},
	ai:{
	revertsave:true,
	effect:{
	target:function(card,player,target){
	if(!game.boss) return;
	if(card.name=='tiesuo'){
	if(_status.event.player==game.boss) return 'zeroplayertarget';
	return 0.5;
	}
	if(get.tag(card,'damage')||get.tag(card,'recover')){
	if(game.boss.isLinked()&&get.damageEffect(game.boss,player,game.boss,'fire')<0){
	if(game.hasPlayer(function(current){
	return current.isEnemyOf(game.boss)&&current.isLinked();
	})){
	return;
	}
	if(get.tag(card,'natureDamage')&&target.isLinked()){
	return;
	}
	}
	if(target.isDying()){
	if(player.isEnemyOf(target)&&player.hp>=-1) return [0,0,0,1];
	return 'zeroplayertarget';
	}
	return -0.5;
	}
	}
	}
	}
	},
	"boss_jingying":{
	trigger:{
	player:"damageEnd",
	},
	filter:function (event,player){
	return event.num>0
	},
	forced:true,
	usable:1,
	content:function (){
	'step 0'
	player.recover(trigger.num)
	player.draw()
	if(trigger.source&&player.getEnemies().contains(trigger.source)){
	var d=[]
	var b=trigger.source.getSkills(true,false);
	for(var l=0;l<b.length;l++){
	if(!lib.translate[b[l]]||!lib.translate[b[l]+'_info']) continue;
	d.push(b[l]);
	}
	d=d.randomGet()
	player.addTempSkill(d,{player:"phaseAfter"})
	}
	},
	},
	"boss_zuidun":{
	global:"boss_zuidun1",
	trigger:{
	player:"damageBegin4",
	},
	forced:true,
	priority:-1842044323,
	filter:function (event,player,target){
	return event.num>1
	},
	content:function (){
	if(trigger.source&&player.getEnemies().contains(trigger.source)){
	trigger.source.damage(trigger.num-1)
	}
	trigger.num=1
	game.log(player,"将伤害变成1")
	},
	},
	"boss_zuidun1":{
	mod:{
	targetEnabled:function (card,player,target){
	var boss=game.findPlayer(function(current){
	return current.hasSkill("boss_zuidun");
	});
	if(boss&&player.getEnemies().contains(boss)&&player.getEnemies().contains(target)&&!target.hasSkill("boss_zuidun")) return false;
	},
	},
	},
	"boss_zuiren":{
	trigger:{
	player:"damageEnd",
	},
	group:"boss_zuiren_1",
	forced:true,
	filter:function (event,player){
	return event.num>0
	},
	content:function (){
	'step 0'
	var list=get.inpile('trick').randomGets(3);
	var dialog=ui.create.dialog('使用一张锦囊牌',[list,'vcard'],'hidden');
	player.chooseButton(dialog,true).set('ai',function(button){
	var card={name:button.link[2]};
	var value=get.value(card);
	return value;
	});
	'step 1'
	if(result.bool){
	event.card=result.buttons[0].link[2]
	if(game.findPlayer(function(target){
	return player.canUse(event.card,target);
	})){
	player.chooseUseTarget(event.card,true);
	}
	else player.gain(game.createCard(event.card),'draw2');
	}
	},
	subSkill:{
	"1":{
	trigger:{
	source:"damageBegin",
	},
	forced:true,
	filter:function (event,player){
	return player.getEnemies().contains(event.player)
	},
	content:function (){
	'step 0'
	player.judge(function(card){
	var type=get.type(card);
	return type=='equip';
	switch(type){
	case 'equip': return 2;
	default: return 0;
	}
	});
	'step 1'
	if(result.bool===true){
	trigger.num+=2
	}
	},
	sub:true,
	},
	},
	},
	boss_shenou:{
	trigger:{
	global:"damageEnd",
	},
	forced:true,
	filter:function (event,player){
	return event.num>0&&event.source&&(event.source.name=='boss_alhg_xiruonuosiyoushou'||event.source.name=='boss_alhg_xiruonuosizuoshou')
	},
	content:function (){
	player.damage(trigger.num)
	},
	},
	"boss_baoxing":{
	trigger:{
	player:"damageEnd",
	},
	filter:function (event,player){
	return event.num>0
	},
	forced:true,
	content:function (){
	'step 0'
	player.draw(trigger.num)
	event.count=trigger.num;
	"step 1"
	event.count--;
	player.judge()
	'step 2'
	if(result.suit=='spade') event.goto(5)
	if(result.suit=='heart') event.goto(4)
	if(result.suit=='club') event.goto(3)
	if(result.suit=='diamond') event.goto(7)
	"step 3"
	game.countPlayer(function(current){
	if(!current.isLinked()&&player.getEnemies().contains(current)){
	current.link()
	}
	if(current.isLinked()&&player.getEnemies().contains(current)){
	var hs=current.getCards('he');
	if(hs.length){
	current.discard(hs.randomGet());
	}
	}
	})
	event.goto(9)
	"step 4"
	player.draw()
	player.recover()
	event.goto(9)
	"step 5"
	player.chooseTarget(true,'对一名敌方角色造成一点雷电伤害。',function(card,player,target){
	return player.getEnemies().contains(target);
	}).ai=function(target){
	return get.attitude(player,target)<0
	}
	"step 6"
	if(result.bool){
	result.targets[0].damage('thunder');
	}
	event.goto(9)
	"step 7"
	player.chooseTarget(true,'获得一名敌方角色区域内各一张牌。',function(card,player,target){
	return player.getEnemies().contains(target)&&(target.countCards('h')||target.countCards('e')||target.countCards('j'))
	}).ai=function(target){
	if(get.attitude(player,target)<0) return -target.countCards('e');
	return get.attitude(player,target)<0
	}
	"step 8"
	if(result.bool){
	var num=0;
	if(result.targets[0].countCards('h')) num++;
	if(result.targets[0].countCards('e')) num++;
	if(result.targets[0].countCards('j')) num++;
	if(num){
	player.gainPlayerCard(result.targets[0],num,'hej',true).set('filterButton',function(button){
	for(var i=0;i<ui.selected.buttons.length;i++){
	if(get.position(button.link)==get.position(ui.selected.buttons[i].link)) return false;
	}
	return true;
	});
	}
	}
	"step 9"
	if(event.count>0) event.goto(1)
	}
	},
	"boss_shenhuang":{
	shaRelated:true,
	trigger:{
	player:"useCardToBefore",
	},
	forced:true,
	filter:function (event,player){
	return event.card.name=='sha';
	},
	content:function (){
	'step 0'
	event.cards=get.cards(10);
	'step 1'
	game.log(player,'观看了牌堆顶10张牌')
	var chooseButton=player.chooseButton(['弃置一张杀',event.cards])
	chooseButton.set('ai',function(button){
	var card=button.link;
	return get.number(card);
	});
	chooseButton.set('filterButton',function(button){
	var card=button.link;
	return card.name=='sha';
	});
	'step 2'
	if(result.bool){
	result.links[0].discard();
	game.log(player,'弃置了',result.links[0])
	var card=result.links[0]
	trigger.baseDamage=get.number(card)
	}else{
	trigger.cancel();
	player.addMark('boss_pangqv',1);
	}
	'step 3'
	while(event.cards.length){
	ui.cardPile.insertBefore(event.cards.pop(),ui.cardPile.firstChild);
	}
	},
	},
	"boss_pangqv":{
	marktext:"暗",
	intro:{
	name:"暗黑",
	content:"当前标记#",
	},
	trigger:{
	player:"phaseAfter",
	},
	group:["boss_pangqv1","boss_pangqv2","boss_pangqv3"],
	forced:true,
	filter:function (event,player){
	return !player.getStat().damage
	},
	content:function (){
	player.addMark('boss_pangqv',1);
	},
	},
	"boss_pangqv1":{
	marktext:"亡",
	intro:{
	name:"死亡",
	content:"受到了#点伤害",
	},
	trigger:{
	player:"damageEnd",
	},
	forced:true,
	filter:function (event,player){
	return event.num>0
	},
	content:function (){
	player.addMark('boss_pangqv1',trigger.num);
	},
	},
	"boss_pangqv2":{
	trigger:{
	player:"damageEnd",
	},
	forced:true,
	filter:function (event,player){
	return player.storage.boss_pangqv1>=10
	},
	content:function (){
	player.storage.boss_pangqv1=0
	player.update();
	player.addMark('boss_pangqv',1);
	},
	},
	"boss_pangqv3":{
	trigger:{
	player:["boss_shenhuangEnd","boss_pangqv2End","boss_pangqvEnd"],
	},
	forced:true,
	filter:function (event,player){
	return player.storage.boss_pangqv>=4
	},
	content:function (){
	player.die();
	},
	},
	"boss_anxi":{
	trigger:{
	player:["damageEnd","loseHpEnd"],
	},
	filter:function (event,player){
	return event.num>0
	},
	forced:true,
	content:function (){
	'step 0'
	player.draw(3)
	"step 1"
	if(Array.isArray(result)&&result.length){
	var eve=[]
	for(var i=0;i<result.length;i++){
	if(player.hasUseTarget(result[i])) eve.push(result[i])
	}
	if(!eve.length) event.finish()
	else{
	event.card=eve
	}}
	"step 2"
	var next=player.chooseToUse();
	next.filterCard=function(card){
	return event.card.contains(card);
	}
	next.prompt='是否使用'+get.translation(event.card)+'？';
	"step 3"
	if(result.bool){
	event.card.remove(result.cards)
	}
	},
	},
	"boss_xieqv":{
	trigger:{
	player:"dieBefore",
	},
	fixed:true,
	forced:true,
	filter:function (event,player){
	return player.countCards('he')>1
	},
	content:function (){
	'step 0'
	player.chooseToDiscard(2,true,'he')
	if(player.hp<2) player.hp=2
	player.update();//刷新
	'step 1'
	while(_status.event.name!='phaseLoop'){
	_status.event=_status.event.parent;
	}
	game.resetSkills();
	_status.paused=false;
	_status.event.player=player;
	_status.event.step=0;
	if(game.bossinfo){
	game.bossinfo.loopType=1;
	_status.roundStart=game.boss;
	}
	},
	},
	"boss_shenzong":{
	enable:"phaseUse",
	selectCard:1,
	filterCard:function(card){
	return card.name=='wuzhong'||card.name=='shunshou'||card.name=='guohe'||card.name=='huogong'||card.name=='nanman'||card.name=='tiesuo'||card.name=='jiedao'||card.name=='juedou'||card.name=='taoyuan'||card.name=='wugu'||card.name=='wanjian'
	},
	prompt:'选择一张手牌弃置',
	position:"h",
	filter:function (event,player){
	return player.countCards("h")>0;
	},
	check:function (card){
	if(_status.event.player.countCards('h')>0){
	return 2000-get.value(card);
	}
	},
	content:function (){
	"step 0"
	event.count=1
	if(cards[0].name=='shunshou') event.count=2
	"step 1"
	if(cards[0].name=='wuzhong'){player.draw(4);event.finish();}
	if(cards[0].name=='nanman'){player.chooseUseTarget('视为使用一张【惊雷闪】',{name:'jingleishan'},true);event.finish();}
	if(cards[0].name=='wanjian'){player.chooseUseTarget('视为使用一张【炽羽袭】',{name:'chiyuxi'},true);event.finish();}
	if(cards[0].name=='wugu') event.goto(5)
	if(cards[0].name=='jiedao') event.goto(2)
	if(cards[0].name=='juedou') event.goto(2)
	if(cards[0].name=='huogong') event.goto(2)
	if(cards[0].name=='guohe') event.goto(2)
	if(cards[0].name=='shunshou') event.goto(2)
	if(cards[0].name=='taoyuan'&&player.maxHp-player.hp>=2){player.recover(2);event.finish();}
	if(cards[0].name=='taoyuan'&&player.maxHp-player.hp==1){player.recover();player.changeHujia();event.finish();}
	if(cards[0].name=='taoyuan'&&player.maxHp==player.hp){player.changeHujia(2);event.finish();}
	if(cards[0].name=='tiesuo'){
	if(!game.hasPlayer(function(current){
	return current!=player&&!current.isLinked()
	})){
	player.draw(2)
	}
	if(player.isLinked()){
	player.link();
	event.goto(2);
	}
	}
	"step 2"
	event.count--
	var yy=true
	if(cards[0].name=='guohe'||cards[0].name=='shunshou'||cards[0].name=='jiedao') yy=[]
	var yyy=1
	if(cards[0].name=='guohe'||cards[0].name=='tiesuo') yyy=[1,Infinity]
	var yyyy=[]
	if(cards[0].name=='guohe') yyyy='弃置任意名其他角色各一张牌。'
	if(cards[0].name=='tiesuo') yyyy='选择任意名未横置的其他角色，这些角色横置。'
	if(cards[0].name=='juedou') yyyy='对一名其他角色造成一点雷电伤害。'
	if(cards[0].name=='shunshou') yyyy='获得1~2名其他角色各一张手牌。'
	if(cards[0].name=='huogong') yyyy='对一名其他角色造成一点火焰伤害。'
	if(cards[0].name=='jiedao') yyyy='获得一名其他角色装备区内的一张装备牌。'
	if(cards[0].name=='tiesuo'&&!game.hasPlayer(function(current){
	return current!=player&&!current.isLinked()
	})){
	event.finish()
	}else player.chooseTarget(yy,yyy,yyyy,function(card,player,target){
	if(cards[0].name=='guohe'||cards[0].name=='shunshou') return player!=target&&target.countCards("hej")
	if(cards[0].name=='tiesuo') return player!=target&&!target.isLinked()
	if(cards[0].name=='jiedao') return player!=target&&target.countCards("e")
	if(cards[0].name=='juedou'||cards[0].name=='huogong') return player!=target;
	}).ai=function(target){
	return get.attitude(player,target)<0
	}	
	"step 3"
	if(result.bool){
	if(cards[0].name=='guohe'){for(var i=0;i<result.targets.length;i++){player.discardPlayerCard('hej',result.targets[i],true)}}
	if(cards[0].name=='tiesuo'){for(var i=0;i<result.targets.length;i++){result.targets[i].link()}}
	if(cards[0].name=='juedou') result.targets[0].damage('thunder');
	if(cards[0].name=='huogong') result.targets[0].damage('fire');
	if(cards[0].name=='jiedao') player.gainPlayerCard(true,result.targets[0],'e');
	if(cards[0].name=='shunshou') player.gainPlayerCard(true,result.targets[0],'he');
	}
	"step 4"
	if(event.count>0){event.goto(2);}else event.finish()
	'step 5'
	event.cards=get.cards(4);
	'step 6'
	game.log(player,'观看了牌堆顶四张牌')
	player.chooseButton(['选择两张牌获得',event.cards],2,true).set('ai',function(button){
	var card=button.link;
	return get.value(card);
	});
	'step 7'
	if(result.bool){
	player.gain(result.links,'gain2')
	event.cards.remove(result.links);
	}
	'step 8'
	while(event.cards.length){
	ui.cardPile.insertBefore(event.cards.pop(),ui.cardPile.firstChild);
	}
	},
	ai:{
	order:999999,
	result:{
	player:2,
	},
	},
	},
	"boss_shenyia":{
	trigger:{
	global:["useCard","respond"],
	},
	forced:true,
	filter:function (event,player){
	if(player.getFriends().contains(event.player)) return false;
	if(player==event.player) return false;
	if(Math.random()>75/100) return false;
	return event.card.name=='shan'||event.card.name=='wuxie';
	},
	content:function (){
	trigger.player.damage('fire')
	},
	},
	"boss_shenpo":{
	trigger:{
	player:"turnOverBefore",
	},
	group:"boss_shenpo1",
	priority:20,
	forced:true,
	filter:function (event,player){
	return !player.isTurnedOver();
	},
	content:function (){
	trigger.cancel();
	game.log(player,'取消了翻面');
	player.draw(2)
	},
	},
	"boss_shenpo1":{
	trigger:{
	player:"phaseJudgeBegin",
	},
	priority:20,
	forced:true,
	content:function (){
	trigger.cancel();
	player.logSkill('boss_shenpo');
	player.draw(2)
	},
	},
	"boss_shenyan":{
	trigger:{
	global:"useCardAfter",
	},
	forced:true,
	filter:function (event,player){
	if(Math.random()>57/100) return false;
	return player!=event.player&&get.type(event.card)!='equip';
	},
	content:function (){
	"step 0"
	var cards=game.createCard(trigger.card);
	player.gain(cards,'gain2');
	"step 1"
	player.chooseToUse(function(card){
	if(!lib.filter.cardEnabled(card,_status.event.player,_status.event)){
	return false;
	}
	return true;
	},'是否使用一张牌？')
	},
	},
	"boss_zuijiua":{
	trigger:{
	source:"damageBegin1",
	},
	filter:function (event){
	return event.card&&event.card.name=='sha'
	},
	audio:"oljiuchi",
	forced:true,
	content:function (){
	trigger.num++;
	},
	},
	"boss_leilia":{
	audio:"xuanfeng_xin_lingtong2",
	trigger:{
	source:"damageEnd",
	},
	direct:true,
	filter:function (event){
	return event.card&&event.card.name=='sha';
	},
	content:function (){
	"step 0"
	player.chooseTarget(get.prompt('boss_leilia'),function(card,player,target){
	if(target==trigger.player) return false;
	return target.isEnemyOf(player);
	}).ai=function(target){
	return get.damageEffect(target,player,player,'thunder');
	}
	"step 1"
	if(result.bool){
	player.logSkill('boss_leilia',result.targets);
	result.targets[0].damage('thunder');
	}
	},
	ai:{
	expose:0.2,
	threaten:1.3,
	},
	},
	"boss_danshua":{
	trigger:{
	player:"loseEnd",
	},
	audio:"mingzhe",
	forced:true,
	unique:true,
	filter:function (event,player){
	return _status.currentPhase!=player&&player.hp<player.maxHp;
	},
	content:function (){
	"step 0"
	player.judge(function(card){
	return get.color(card)=='red'?1:0;
	});
	"step 1"
	if(result.color=='red'){
	player.recover();
	}
	},
	ai:{
	effect:{
	target:function (card){
	if(get.tag(card,'loseCard')){
	return [0.5,1];
	}
	},
	},
	},
	},
	"boss_guanshi":{
	trigger:{
	player:"turnOverBefore",
	},
	priority:20,
	forced:true,
	filter:function (event,player){
	return !player.isTurnedOver();
	},
	content:function (){
	"step 0"
	player.judge(function(card){
	return get.suit(card)=='diamond'?0:1;
	});
	"step 1"
	if(result.color=='black'){
	trigger.cancel();
	event.finish()
	}
	if(result.suit=='heart'){
	player.chooseTarget('是否令一名其他角色翻面',function(card,player,target){
	return target!=player
	}).set('ai',function(target){
	return -get.attitude(_status.event.player,target)
	});
	}
	"step 2"
	if(result.bool){
	result.targets[0].turnOver()
	}
	},
	group:["boss_guanshi_1"],
	subSkill:{
	"1":{
	trigger:{
	target:"useCardToTargeted",
	},
	priority:20,
	forced:true,
	filter:function (event,player){
	return get.type(event.card)=='delay'
	},
	content:function (){
	"step 0"
	player.judge(function(card){
	return get.suit(card)=='diamond'?0:1;
	});
	"step 1"
	if(result.color=='black'){
	trigger.cancel()
	event.finish()
	}
	if(result.suit=='heart'){
	player.chooseTarget('是否将'+get.translation(event.card)+'转移给其他角色',function(card,player,target){
	return target!=player
	}).set('ai',function(target){
	return -get.attitude(_status.event.player,target)
	});
	}
	"step 2"
	if(result.bool){
	trigger.targets.push(result.targets[0]);
	trigger.getParent().excluded.add(player);	 
	}
	},
	sub:true,
	},
	},
	},
	"boss_huoluan":{
	trigger:{
	player:"phaseUseBegin",
	},
	forced:true,
	audio:"taoluan",
	content:function (){
	"step 0"
	event.count=4
	"step 1"
	event.count--
	var list=[];
	get.cardPile(function(card){
	if(get.color(card)=='black'&&get.type(card)=='trick'&&card.name!='wuxie') list.push(card);
	});
	var card=list.randomGet()
	player.gain(card,'draw2');
	if(!player.hasUseTarget(card)){
	player.discard(card)
	event.goto(4)
	}
	else{
	event.card=card
	}
	"step 2"
	var next=player.chooseToUse();
	next.filterCard=function(car){
	return car==event.card;
	}
	next.prompt='是否使用'+get.translation(event.card)+'？';
	"step 3"
	if(!result.bool){
	player.discard(event.card)
	}
	"step 4"
	if(event.count) event.goto(1)
	},
	},
	"boss_xvmou":{
	marktext:"蓄",
	intro:{
	name:"蓄谋",
	content:"你下次对敌方角色造成的伤害+#",
	},
	trigger:{
	player:"damageBegin",
	},
	forced:true,
	filter:function (event,player){
	return player.countMark('boss_xvmou')<4
	},
	content:function (){
	player.addMark('boss_xvmou',1);
	},
	group:"boss_xvmou_1",
	subSkill:{
	"1":{
	trigger:{
	source:"damageBegin",
	},
	forced:true,
	filter:function (event,player){
	return player.countMark('boss_xvmou')&&player.getEnemies().contains(event.player)
	},
	content:function (){
	trigger.num+=player.storage.boss_xvmou
	player.removeMark('boss_xvmou',player.storage.boss_xvmou)
	},
	sub:true,
	},
	},
	},
	"boss_jiquan":{
	trigger:{
	player:"phaseBegin",
	},
	forced:true,
	content:function (){
	player.drawTo(8)
	},
	},
	"boss_luanzheng":{
	trigger:{
	global:"damageEnd",
	},
	forced:true,
	filter:function (event,player){
	if(player.getEnemies().contains(event.source)&&event.source!=player&&event.source==_status.currentPhase&&event.source.getStat().damage&&event.source.getStat().damage>5) return true;
	return false;
	},
	content:function (){
	trigger.source.addTempSkill('boss_luanzheng_2');
	},
	group:"boss_luanzheng_1",
	subSkill:{
	"1":{
	trigger:{
	global:"gainEnd",
	},
	filter:function (event,player){
	if(player.getEnemies().contains(event.player)&&event.player!=player&&event.player==_status.currentPhase&&event.player.countCards('h')>10) return true;
	return false;
	},
	content:function (){
	trigger.player.addTempSkill('boss_luanzheng_2');
	},
	sub:true,
	},
	"2":{
	mark:true,
	mod:{
	"cardEnabled2":function (card){
	if(get.position(card)=='h') return false;
	},
	},
	intro:{
	content:"不能使用或打出手牌",
	},
	sub:true,
	},
	},
	},
	"boss_tieji1":{
	mod:{
	aiOrder:function (player,card,num){
	if(card.name=='sha') return 20;
	},
	},
	shaRelated:true,
	audio:"retieji",
	trigger:{
	player:"useCardToPlayered",
	},
	check:function (event,player){
	return get.attitude(player,event.target)<=0;
	},
	filter:function (event,player){
	return event.card.name=='sha';
	},
	logTarget:"target",
	content:function (){
	"step 0"
	trigger.target.addTempSkill('boss_tieji1_1')
	player.judge();
	"step 1"
	if(result.color=='red'){
	if(trigger.target.countCards('he',{color:'red'})){
	trigger.target.chooseToDiscard('he',true,'弃置一张红色牌',function(card){
	return get.color(card)=='red'
	})
	}
	trigger.getParent().directHit.add(trigger.target); 
	}
	if(result.color=='black'){
	trigger.target.chooseToDiscard('he',2,'弃置两张黑色牌，否则此杀你不能闪避',function(card){
	return get.color(card)=='black'
	})
	}
	"step 2"
	if(!result.bool){
	trigger.getParent().directHit.add(trigger.target);
	}
	},
	ai:{
	"directHit_ai":true,
	skillTagFilter:function (player,tag,arg){
	if(get.attitude(player,arg.target)>0||arg.card.name!='sha'||!ui.cardPile.firstChild||get.color(ui.cardPile.firstChild,player)!='red') return false;
	},
	},
	subSkill:{
	"1":{
	init:function (player,skill){
	var skills=player.getSkills(true,false);
	skills.remove('boss_tieji1_1')
	skills.remove('boss_qianji_1')
	for(var i=0;i<skills.length;i++){
	if(get.skills[i]){
	skills.splice(i--,1);
	} 
	}
	player.disableSkill(skill,skills);
	},
	onremove:function (player,skill){
	player.enableSkill(skill);
	},
	mark:true,
	marktext:"铁",
	intro:{
	name:"铁骑",
	content:function (storage,player,skill){
	var list=[];
	for(var i in player.disabledSkills){
	if(player.disabledSkills[i].contains(skill)){
	list.push(i)
	}
	}
	if(list.length){
	var str='铁骑技能：';
	for(var i=0;i<list.length;i++){
	if(lib.translate[list[i]+'_info']){
	str+=get.translation(list[i])+'/';
	}
	}
	return str.slice(0,str.length-1);
	}
	},
	},
	sub:true,
	forced:true,
	popup:false,
	},
	},
	"audioname2":{
	"key_shiki":"shiki_omusubi",
	},
	},
	"boss_xiongshi":{
	audio:"ext:制作点:2",
	enable:"phaseUse",
	audio:"tieji",
	group:"boss_xiongshi_1",
	discard:false,
	filter:function (event,player){
	return player.countCards('h')&&!player.countCards('h',{name:'sha'});
	},
	prepare:"throw",
	position:"h",
	filterCard:true,
	filterTarget:function (card,player,target){
	if(player==target) return false;
	return true;//player.canUse({name:'sha',cards:ui.selected.cards},target);
	},
	selectCard:-1,
	content:function (){
	var next=player.useCard({name:'sha'},target,cards,false);
	next.animate=false;
	},
	ai:{
	result:{
	target:function (player,target){
	return get.effect(target,{name:'sha'},player,target);
	},
	},
	order:function (card,player){
	if(player.countCards('h')==1) return 20
	return 1
	},
	},
	subSkill:{
	"1":{
	trigger:{
	player:"useCard",
	},
	silent:true,
	filter:function (event){
	return event.getParent(2).skill=='boss_xiongshi';
	},
	content:function (){
	trigger.baseDamage++
	},
	sub:true,
	forced:true,
	popup:false,
	"audioname2":{
	"key_shiki":"shiki_omusubi",
	},
	},
	},
	"audioname2":{
	"key_shiki":"shiki_omusubi",
	},
	},
	"boss_mashu1":{
	mod:{
	globalFrom:function (from,to,distance){
	return distance-1;
	},
	},
	trigger:{
	player:"drawBegin",
	},
	priority:-100,
	forced:true,
	popup:false,
	content:function (){
	if(ui.cardPile.childElementCount<2) event.finish();
	else if(Math.random()<3/4){
	var list=[];
	get.cardPile(function(card){
	if(card.name!='sha') list.push(card);
	});
	var card=list.randomGet()
	if(list.length>1) card=list.randomGets(2);
	while(card.length){
	ui.cardPile.insertBefore(card.pop(),ui.cardPile.firstChild);
	}
	}
	},
	"audioname2":{
	"key_shiki":"shiki_omusubi",
	},
	group:"boss_mashu1_1",
	subSkill:{
	"1":{
	trigger:{
	player:"phaseEnd",
	},
	forced:true,
	filter:function (event,player){
	return !player.countCards('h',{name:'sha'})&&player.getStat().damage&&player.getStat().damage>0;
	},
	content:function (){
	var num=player.getStat().damage-2
	if(ui.cardPile.childElementCount<num) event.finish();
	else if(Math.random()<3/4){
	var list=[];
	get.cardPile(function(card){
	if(card.name!='sha') list.push(card);
	});
	var card=list.randomGet()
	if(list.length>1) card=list.randomGets(num);
	while(card.length){
	ui.cardPile.insertBefore(card.pop(),ui.cardPile.firstChild);
	}
	}
	player.draw(player.getStat().damage)
	},
	sub:true,
	},
	},
	},
	"boss_qianji":{
	enable:"phaseUse",
	audio:"shichou",
	selectTarget:2,
	filterTarget:function (card,player,target){
	if(player==target) return false;
	if(ui.selected.targets.length){
	if(ui.selected.targets[0].hasSkill('boss_tieji1_1')) return !target.hasSkill('boss_tieji1_1')&&!target.hasSkill('boss_qianji_1')
	else return target.hasSkill('boss_tieji1_1')
	}
	return target.hasSkill('boss_tieji1_1')||!target.hasSkill('boss_qianji_1');
	},
	multitarget:true,
	multiline:true,
	complexSelect:true,
	content:function (){
	if(targets[0].hasSkill('boss_tieji1_1')){
	targets[0].removeSkill('boss_tieji1_1')
	targets[0].addTempSkill('boss_qianji_1')
	targets[1].addTempSkill('boss_tieji1_1');
	player.useCard({name:'sha'},targets[1]);
	}
	else if(targets[1].hasSkill('boss_tieji1_1')){
	targets[1].removeSkill('boss_tieji1_1')
	targets[1].addTempSkill('boss_qianji_1')
	targets[0].addTempSkill('boss_tieji1_1');
	player.useCard({name:'sha'},targets[0]);
	}
	},
	ai:{
	order:20,
	threaten:3,
	expose:0.9,
	result:{
	target:-1,
	},
	},
	subSkill:{
	"1":{
	forced:true,
	sub:true,
	},
	},
	},
	"boss_malianga":{
	trigger:{
	global:["phaseBegin","phaseAfter"],
	},
	forced:true,
	direct:true,
	priority:5,
	audio:"zishu",
	content:function (){
	var e3=player.getEquip(3)
	var e4=player.getEquip(4)
	var ks=event.triggername=='phaseBegin'
	var js=event.triggername=='phaseAfter'
	if(ks&&trigger.player==player&&e4){
	player.logSkill('boss_malianga')
	player.draw(2)
	}
	if(js&&trigger.player==player&&e3){
	player.logSkill('boss_malianga')
	player.draw(2)
	}
	if(ks&&trigger.player!=player&&e3&&e4&&get.color(e3)==get.color(e4)){
	player.logSkill('boss_malianga')
	player.draw(2)
	}
	if(js&&trigger.player!=player&&e3&&e4&&get.number(e3)==get.number(e4)){
	player.logSkill('boss_malianga')
	player.draw(2)
	}
	},
	ai:{
	effect:{
	target:function (card,player,target,current){
	if((get.subtype(card)=='equip3'||get.subtype(card)=='equip4')&&!get.cardtag(card,'gifts')) return [1,3];
	},
	},
	},
	},
	"boss_majuna":{
	mod:{
	canBeDiscarded:function (card){
	if(get.position(card)=='e'&&['equip3','equip4'].contains(get.subtype(card))) return false;
	},
	},
	audio:"xinfu_jingxie",
	group:"boss_majuna1",
	trigger:{
	global:["gameDrawAfter","gainEnd","equipEnd"],
	},
	forced:true,
	filter:function (event,player,name){
	if(name!='gameDrawAfter'&&event.player==player) return false
	return game.hasPlayer(function(current){
	return current!=player&&(current.countCards('he',{subtype:'equip3'})||current.countCards('he',{subtype:'equip4'}));
	});
	},
	content:function (){
	"step 0"
	var players=get.players(player);
	players.remove(player);
	event.players=players;
	//player.line(players,'green');
	"step 1"
	if(event.players.length){
	var current=event.players.shift();
	var hes=current.getCards('he')
	var card=[];
	for(var i=0;i<hes.length;i++){
	if(get.subtype(hes[i])=='equip3'||get.subtype(hes[i])=='equip4') card.push(hes[i])
	}
	if(card.length){
	player.line(current,'green');
	player.gain(card,current);
	current.$giveAuto(card,player);
	}
	event.redo();
	}
	},
	},
	"boss_machaoa":{
	trigger:{
	player:["equipBegin","loseEnd"],
	},
	forced:true,
	audio:"retieji",
	group:"boss_machaoa1",
	filter:function (event,player,name){
	if(name=='equipBegin'){
	if(get.subtype(event.card)=='equip3') return true;
	if(get.subtype(event.card)=='equip4') return true;
	return false;
	}
	if(name=='loseEnd'){
	if(event.es){
	for(var i=0;i<event.es.length;i++){
	if(get.subtype(event.es[i],player)=='equip3'||get.subtype(event.es[i],player)=='equip4') return true
	}
	}
	return false;
	}
	return false;
	},
	content:function (){
	"step 0"
	event.count=1;
	var name=event.triggername
	if(name=='loseEnd'){
	event.count=0;
	for(var i=0;i<trigger.es.length;i++){
	if(get.subtype(trigger.es[i],player)=='equip3'||get.subtype(trigger.es[i],player)=='equip4') event.count++;
	}
	}
	"step 1"
	player.draw();
	event.count--;
	"step 2"
	if(event.count){
	event.goto(1);
	}
	},
	},
	"boss_machaoa1":{
	trigger:{
	global:"useCardAfter",
	},
	audio:"retieji",
	filter:function (event,player,target){
	return player!=_status.currentPhase&&player!=event.player&&player.countCards('h')
	},
	direct:true,
	content:function (){
	"step 0"
	player.chooseToUse(function(card){
	if(!lib.filter.cardEnabled(card,_status.event.player,_status.event)){
	return false;
	}
	return true;
	},'是否使用一张牌？')
	"step 1"
	if(result.bool){
	player.logSkill('boss_machaoa');
	}
	},
	},
	"boss_mazhonga":{
	trigger:{
	player:"useCardToTargeted",
	},
	audio:"fuman",
	filter:function (event,player,target){
	return event.card&&event.card.name=='sha'&&event.target.countCards('he')
	},
	content:function (){
	'step 0'
	player.gainPlayerCard(true,trigger.target,'he');
	'step 1'
	if(result.bool){
	var card=result.cards[0]
	var list=[]
	for(var i=0;i<lib.inpile.length;i++){
	var name=lib.inpile[i];
	if(get.subtype(name)=='equip3'||get.subtype(name)=='equip4') list.push(name);
	}	
	var card1=list.randomGet()
	var card2=game.createCard(card1,card.suit,card.number)
	if(get.subtype(card)!='equip3'&&get.subtype(card)!='equip4'){
	game.log(player,'将',card,'变成了',card2)
	card.init(card2)
	}
	player.equip(card)
	}
	},
	},
	"boss_majuna1":{
	trigger:{
	player:"phaseUseBegin",
	},
	audio:"xinfu_jingxie",
	forced:true,
	usable:1,
	content:function (){
	player.gain(get.cardPile(function(card){
	return (get.subtype(card)=='equip3'||get.subtype(card)=='equip4');
	}),'gain2');
	},
	},
	"boss_yingying":{
	audio:"shiren",
	fixed:true,
	direct:true,
	superCharlotte:true,
	charlotte:true,
	trigger:{
	global:"useCardAfter",
	},
	filter:function (event,player){
	if(player!=_status.currentPhase&&!player.countCards("he")) return false
	return event.cards.length>0&&player.storage.boss_yingying!=true&&get.type(event.card)!='equip'&&get.type(event.card)!='delay'
	},
	check:function (event,player){
	if(event.card.name=='wuxie') return false
	if(get.type(event.card)=='basic'&&(event.card.name!='sha'||event.card.name!='jiu')) return false;
	if(get.type(event.card)=='jiguan'&&(event.card.name=='jiguanshu'||event.card.name=='jiguanyaoshu'||event.card.name=='mujiaren'||event.card.name=='jiguanyuan')) return false;
	if(get.type(event.card)!='trick'||get.type(event.card)=='basic'||get.type(event.card)=='jiguan') return false;
	return true;
	},
	/* prompt:function(event){
	return '【嘤嘤嘤】：是否将'+get.translation(event.card)+'置于牌堆底'
	},*/
	content:function (){
	"step 0"
	if(player!=_status.currentPhase){
	player.chooseToDiscard("he",'###【嘤嘤嘤】###弃置一张牌，将'+get.translation(trigger.card)+'置于牌堆底',function(card){
	return true
	}).set('ai',function(card){
	if(trigger.card.name=='wuxie') return 0
	if(trigger.card.name=='sha'||trigger.card.name=='jiu') return 1000-get.value(card);
	if(get.type(trigger.card)=='trick') return 1000-get.value(card);
	return 0
	})
	}
	if(player==_status.currentPhase){
	player.chooseControl('确定','cancel2').set('ai',function(){ 
	if(trigger.card.name=='wuxie') return 'cancel2'
	if(trigger.card.name=='sha'||trigger.card.name=='jiu') return '确定';
	if(get.type(trigger.card)=='trick') return '确定';
	return 'cancel2';
	}).set('prompt','###【嘤嘤嘤】###是否将'+get.translation(trigger.card)+'置于牌堆底')
	}
	'step 1'
	if((player!=_status.currentPhase&&!result.bool)||(player==_status.currentPhase&&result.control=='cancel2')){
	event.finish();
	}else{
	player.logSkill("boss_yingying")
	event.cards=trigger.cards.filterInD();
	if(event.cards.length>1){
	player.chooseButton(true,event.cards.length,['按顺序将卡牌置于牌堆底（先选择的在上）',event.cards]).set('ai',function(button){
	var value=get.value(button.link);
	if(_status.event.reverse) return value;
	return -value;
	}).set('reverse',((_status.currentPhase&&_status.currentPhase.next)?get.attitude(player,_status.currentPhase.next)>0:false))
	}
	}
	"step 2"
	if(result.bool&&result.links&&result.links.length) cards=result.links.slice(0);
	while(cards.length){
	var card=cards.pop();
	if(get.position(card,true)=='o'){
	card.fix();
	ui.cardPile.appendChild(card,ui.cardPile.firstChild);
	game.log(player,'将',card,'置于牌堆底');
	}
	}
	game.updateRoundNumber();
	},
	group:"boss_yingying_1",
	subSkill:{
	"1":{
	trigger:{
	global:"phaseBefore",
	},
	priority:2,
	forced:true,
	direct:true,
	filter:function (event,player){
	return player.storage.boss_yingying&&player.storage.boss_yingying==true;
	},
	content:function (){
	player.storage.boss_yingying=false;
	},
	sub:true,
	},
	},
	},
	"boss_abaaba":{
	trigger:{
	player:"phaseAfter",
	},
	audio:"zunwei",
	superCharlotte:true,
	charlotte:true,
	fixed:true,
	forced:true,
	content:function (){
	'step 0'
	player.storage.boss_yingying=true;
	'step 1'
	var card=get.bottomCards()[0];
	event.card=card
	player.showCards(card);
	if(!player.hasUseTarget(card)){
	player.gain(card)
	player.storage.boss_yingying=false;
	event.finish();
	}
	'step 2'
	var next=player.chooseUseTarget(card,true,false);
	if(get.info(card).updateUsable=='phaseUse') next.addCount=false;
	'step 3'
	if(result.bool) event.goto(1);
	},
	},
	"boss_miaowu":{
	trigger:{
	player:"dieBefore",
	},
	audio:"rehongyan",
	superCharlotte:true,
	charlotte:true,
	fixed:true,
	forced:true,
	content:function (){
	'step 0'
	var card=get.bottomCards()[0];
	event.card=card;
	player.chooseControl('basic','trick','equip','其他').set('ai',function(){ 
	if(get.type(card)=='basic') return 'basic';
	if(get.type(card,'trick')=='trick') return 'trick';
	if(get.type(card)=='equip') return 'equip';
	return '其他'
	}).set('prompt','###【喵呜】###猜测一种类型，若猜对则你不死亡'); 
	'step 1' 
	game.log(player,'猜测的类型为',get.translation(result.control)||result.control,'牌')
	player.showCards(card);
	player.gain(card,'draw2')
	'step 2' 
	if(result.control=='其他'&&get.type(card,'trick')!='basic'&&get.type(card,'trick')!='trick'&&get.type(card,'trick')!='equip'||get.type(card,'trick')==result.control){
	player.popup('洗具','metal');
	trigger.cancel();
	player.maxHp=2;
	player.update();//刷新
	if(player.hp<2){
	player.recover(2-player.hp);
	}
	player.draw();
	} else event.finish()
	},
	},
	"boss_chiliu":{
	audio:"zhente",
	mod:{
	globalFrom:function (from,to,distance){
	return distance-1;
	},
	maxHandcard:function (player,num){
	return 2+num;
	},
	},
	audio:"zhente",
	trigger:{
	player:"turnOverBefore",
	},
	priority:20,
	forced:true,
	superCharlotte:true,
	charlotte:true,
	fixed:true,
	filter:function (event,player){
	return !player.isTurnedOver()
	},
	content:function (){
	trigger.cancel();
	game.log(player,'取消了翻面');
	},
	group:["boss_chiliu_1","boss_chiliu_2"],
	subSkill:{
	"1":{
	trigger:{
	player:"phaseBegin",
	},
	audio:"zhente",
	forced:true,
	content:function (){
	player.damage('thunder');
	player.gain(player.getCards('j'),'draw2')
	},
	sub:true,
	},
	"2":{
	trigger:{
	player:"dying",
	},
	forced:true,
	content:function (){
	player.die();
	},
	sub:true,
	},
	},
	},
	"boss_lingba":{
	trigger:{
	player:"phaseBegin",
	},
	forced:true,
	filter:function (event,player){
	return !game.hasPlayer(function(current){
	return current.countCards('h')>player.countCards('h')
	});
	},
	content:function (){
	if(player.countCards('h')>=player.hp*2){
	game.countPlayer(function(current2){
	if(current2!=player&&player.getEnemies().contains(current2)){
	current2.damage(2)
	}
	});
	}else{
	var list=game.filterPlayer(function(current){
	return player.getEnemies().contains(current)
	});
	if(list.length){
	var target=list.randomGet()
	player.line(target,'green')
	target.damage(2)
	}
	}
	},
	},
	"boss_yishen":{
	trigger:{
	player:"recoverBegin",
	},
	check:function (event,player){
	return _status.event.player.hp>3;
	},
	filter:function (event,player){
	return game.hasPlayer(function(current){
	return player.getEnemies().contains(current)&&current.countCards('e');	
	});
	},
	content:function (){
	trigger.cancel()
	game.countPlayer(function(current){
	if(current.countCards('e')&&player.getEnemies().contains(current)){
	var card=current.getCards('e').randomGet();
	player.gain(card,current);
	current.$giveAuto(card,player);
	}
	});
	},
	},
	"boss_langgu":{
	trigger:{
	player:'gainEnd',
	},
	filter:function(event,player){
	if(player.hasSkill("boss_langgu2")||!event.source||!event.source.countCards('h')||event.source==player||!event.source.isIn()) return false;
	var evt=event.getl(event.source);
	return evt&&evt.cards2&&evt.cards2.length;
	},
	check:function(event,player){
	return -get.attitude(player,event.source)
	},
	logTarget:'source',
	forced:true,
	content:function(){
	"step 0"
	player.judge(function(card){
	return get.color(card)=='black'?1:0;
	});
	"step 1" 
	if(result.color=='red'){
	player.addTempSkill("boss_langgu2")
	}
	if(result.color=='black'){
	var hs=trigger.source.getCards('h');
	if(hs.length){
	trigger.source.discard(hs.randomGet());
	}
	}
	},
	},
	"boss_langgu2":{},
	"boss_yuanlv":{
	trigger:{
	source:'damageBegin',
	},
	filter:function(event,player){
	return player.getEnemies().contains(event.player)&&event.card&&get.type(event.card)=="trick";
	},
	check:function(event,player){
	return event.player.countCards("h")>1&&event.player.hp>1
	},
	content:function(){
	trigger.cancel()
	player.draw()
	player.damage(trigger.player)
	},
	},
	"boss_shenji":{
	mod:{
	selectTarget:function(card,player,range){
	if(range[1]==-1) return;
	if(card.name=='sha') range[1]+=2;
	},
	cardUsable:function(card,player,num){
	if(card.name=='sha') return num+2;
	}
	},
	group:"boss_shenji_1",
	trigger:{
	player:'phaseJudgeBegin',
	},
	audio:"shenji",
	direct:true,
	filter:function(event,player){
	return player.countCards('j')>0&&player.countCards('h')>1;
	},
	content:function(){
	'step 0'
	player.chooseToDiscard(2,'是否弃置两张手牌来弃置判定区的牌？').set('ai',function(card){
	return 1;
	}).set('logSkill',['boss_shenji',player])
	'step 1'
	if(result.bool){
	player.discard(player.getCards('j'));
	}
	},
	subSkill:{
	"1":{
	trigger:{
	player:"phaseDrawBegin",
	},
	forced:true,
	content:function(){
	trigger.num+=2
	},
	sub:true,
	},
	},
	},
	"boss_zhankai":{
	trigger:{
	player:'damageBegin4',
	},
	filter:function(event,player){
	return event.num>2
	},
	audio:"shenqu",
	forced:true,
	content:function(){
	trigger.num=2
	game.log(player,"将伤害变成2")
	player.draw(2)
	},
	},
	"boss_baonue":{
	trigger:{
	player:'phaseBegin',
	},
	filter:function(event,player){
	return player.hp<player.maxHp
	},
	audio:"olbaonue",
	forced:true,
	content:function(){
	"step 0"
	var num=player.maxHp-player.hp
	if(num>5) num=5
	player.draw(num)
	player.chooseTarget([1,num],'对最多'+get.translation(num)+'名敌方角色造成一点伤害。',function(card,player,target){
	return true
	}).set('ai',function(target){
	return -get.attitude(_status.event.player,target)
	});
	"step 1"
	if(result.bool){
	event.targets=result.targets.slice(0).sortBySeat();
	}
	else{
	event.goto(3);
	}
	'step 2'
	if(event.targets&&event.targets.length){
	event.targets.shift().damage();
	event.redo();
	}
	'step 3'
	player.loseHp()
	},
	},
	"boss_qvbu":{
	trigger:{
	global:'useCard',
	},
	audio:"baonue2",
	filter:function(event,player){
	return (event.player==player||player.getFriends().contains(event.player))&&event.card&&event.card.name=="sha";
	},
	forced:true,
	content:function(){
	"step 0"
	player.judge(function(card){
	return get.color(card)=='black'?1:0;
	});
	"step 1"
	if(result.color=='black') event.targets=trigger.targets.slice(0).sortBySeat();
	"step 2"
	if(event.targets&&event.targets.length){
	event.targets.shift().damage();
	event.redo();
	}
	},
	},
	"boss_jianzheng":{
	audio:"jianzheng",
	trigger:{global:'useCardToPlayer'},
	filter:function(event,player){
	if(!player.countCards('h')) return false;
	return event.player!=player&&event.card.name=='sha'&&!event.targets.contains(player)&&event.player.inRange(player);
	},
	direct:true,
	content:function(){
	"step 0"
	var effect=0;
	for(var i=0;i<trigger.targets.length;i++){
	effect-=get.effect(trigger.targets[i],trigger.card,trigger.player,player);
	}
	if(effect>0){
	if(player.countCards('h','shan')){
	effect=1;
	}
	else{
	effect=0;
	}
	if(trigger.targets.length==1){
	if(trigger.targets[0].hp==1){
	effect++;
	}
	if(effect>0&&player.countCards('h',{color:'black'})){
	effect++;
	}
	}
	if(effect>0){
	effect+=6;
	}
	}
	player.chooseCard('h',get.prompt2('boss_jianzheng',trigger.player)).set('ai',function(card){
	if(_status.event.effect>=0){
	var val=get.value(card);
	if(val<0) return 10-val;
	return _status.event.effect-val;
	}
	return 0;
	}).set('effect',effect).set('logSkill',['boss_jianzheng',trigger.player]);
	"step 1"
	if(result.bool&&result.cards){
	event.card=result.cards[0];
	trigger.targets.length=0;
	trigger.getParent().triggeredTargets1.length=0;
	}
	else{
	event.finish();
	}
	"step 2"
	if(!event.isMine()) game.delayx();
	"step 3"
	if(event.card){
	player.logSkill('boss_jianzheng',trigger.player);
	player.lose(event.card,ui.cardPile,'visible','insert');
	player.$throw(event.card,1000);
	game.log(player,'将',card,'置于牌堆顶');
	}
	"step 4"
	trigger.getParent().targets.push(player);
	trigger.player.line(player);
	game.delay();
	},
	ai:{
	threaten:1.1,
	expose:0.25,
	},
	},
	"boss_yinlei":{
	trigger:{player:'loseBegin'},
	forced:true,
	content:function(){
	var list=game.players.slice(0);
	if(list.length){
	var target=list.randomGet();
	player.line(target);
	target.link();
	}
	}
	},
	"boss_wangzun":{
	trigger:{global:'phaseEnd'},
	forced:true,
	audio:"wangzun",
	filter:function(event,player){
	return event.player!=player&&player.getEnemies().contains(event.player)
	},
	content:function(){
	'step 0'
	if(player.storage.boss_wangzun_damage==true){
	trigger.player.damage()
	player.storage.boss_wangzun_damage=false
	event.finish()
	}
	'step 1'
	trigger.player.chooseToDiscard('he',2,true);
	},
	group:"boss_wangzun_1",
	subSkill:{
	"1":{
	trigger:{player:'damageEnd'},
	direct:true,
	filter:function(event,player){
	return event.num>0&&_status.currentPhase==event.source&&player.getEnemies().contains(event.source)
	},
	content:function(){
	player.storage.boss_wangzun_damage=true
	},
	sub:true,
	},
	},
	},
	"boss_duoxi":{
	trigger:{
	global:"phaseDrawBegin1",
	},
	audio:2,
	audio:"drlt_weidi",
	check:function (event,player){
	return _status.event.player.hp>1&&get.attitude(player,event.player)<=0;
	},
	filter:function (event,player){
	return !event.numFixed&&event.player!=player
	},
	content:function (){
	player.loseHp()
	trigger.cancel()
	player.draw(2)
	},
	},
	"boss_xiemei":{inherit:'mashu',},
	"boss_shehun":{inherit:'rejianxiong',},
	"boss_lingsi":{inherit:'boss_zhennu',},
	"boss_taoyuan":{inherit:'yingjian',},
	"boss_duoling":{inherit:'kuanggu',},
	"boss_jingxin":{inherit:'new_liyu',},
	"boss_yazi":{inherit:'fankui',},
	"boss_lihuo":{inherit:'boss_guihuoa',},
	"boss_yvtu":{
	group:['boss_yvtu_sha','boss_yvtu_shan'],
	subSkill:{
	sha:{
	enable:'chooseToUse',
	viewAs:{name:'sha',isCard:true},
	filterCard:function(){return false},
	viewAsFilter:function(player){
	if(player.hasSkill('boss_yvtu_disable')) return false;
	},
	selectCard:-1,
	mark:false,
	precontent:function(){
	player.addTempSkill('boss_yvtu_disable','roundStart');
	},
	prompt:'视为使用一张杀',
	ai:{
	order:function(){
	var player=_status.event.player;
	if(!player.hasShan()&&!game.hasPlayer(function(current){
	return player.canUse('sha',current)&&current.hp==1&&get.effect(current,{name:'sha'},player,player)>0;
	})){
	return 0;
	}
	return 2.95;
	},
	skillTagFilter:function(player,tag,arg){
	if(player.hasSkill('boss_yvtu_disable')) return false;
	if(arg!='use') return false;
	},
	respondSha:true,
	}
	},
	shan:{
	enable:'chooseToUse',
	viewAs:{name:'shan',isCard:true},
	mark:false,
	filterCard:function(){return false},
	viewAsFilter:function(player){
	if(player.hasSkill('boss_yvtu_disable')) return false;
	return true;
	},
	onuse:function(event,player){
	player.addTempSkill('boss_yvtu_disable','roundStart');
	},
	selectCard:-1,
	prompt:'视为使用一张闪',
	ai:{
	order:function(){
	var player=_status.event.player;
	if(player.hasSkill('qingzhongx_give')) return 2.95;
	return 3.15;
	},
	skillTagFilter:function(player){
	if(player.hasSkill('boss_yvtu_disable')) return false;
	},
	respondShan:true,
	}
	},
	disable:{
	mark:true,
	intro:{
	content:'本轮已发动'
	}
	}
	}
	},
	"boss_leilia":{
	trigger:{source:'damageEnd'},
	direct:true,
	filter:function(event){
	return event.card&&event.card.name=='sha';
	},
	content:function(){
	"step 0"
	player.chooseTarget(get.prompt('boss_leilia'),function(card,player,target){
	if(target==trigger.player) return false;
	return target.isEnemyOf(player);
	}).ai=function(target){
	return get.damageEffect(target,player,player,'thunder');
	}
	"step 1"
	if(result.bool){
	player.logSkill('boss_leilia',result.targets);
	result.targets[0].damage('thunder');
	}
	},
	ai:{
	expose:0.2,
	threaten:1.3
	}
	},
	"boss_fengxinga":{
	trigger:{player:'phaseBegin'},
	direct:true,
	content:function(){
	"step 0"
	player.chooseTarget(get.prompt('boss_fengxinga'),function(card,player,target){
	if(target.isFriendOf(player)) return false;
	return lib.filter.targetEnabled({name:'sha'},player,target);
	}).ai=function(target){
	return get.effect(target,{name:'sha'},player);
	}
	"step 1"
	if(result.bool){
	player.logSkill('boss_fengxinga');
	player.useCard({name:'sha'},result.targets,false);
	}
	},
	ai:{
	expose:0.2,
	threaten:1.3
	}
	},
	"boss_zhenlei":{
	trigger:{player:'phaseZhunbeiBegin'},
	direct:true,
	content:function(){
	"step 0"
	player.chooseTarget(get.prompt('boss_zhenlei'),function(card,player,target){
	return player!=target;
	}).ai=function(target){
	return get.damageEffect(target,player,player,'thunder');
	}
	"step 1"
	if(result.bool){
	player.logSkill('boss_zhenlei',result.targets);
	result.targets[0].damage('thunder');
	}
	},
	},
	"boss_lingsia":{
	trigger:{
	player:"dieBegin",
	},
	forced:true,
	usable:1,
	content:function(){
	"step 0"
	event.players=get.players(player);
	event.players.remove(player);
	"step 1"
	if(event.players.length){
	event.players.shift().damage();
	event.redo();
	}
	},
	},
	"boss_xiangruia":{
	trigger:{
	global:"phaseUseEnd",
	},
	direct:true,
	filter:function (event,player){
	return player.hp!=player.maxHp&&event.player!=player
	},
	content:function (){
	'step 0'
	trigger.player.chooseToDiscard("he",2,'###【祥瑞】###是否弃置两张牌，令'+get.translation(player)+'回复一点血量？').set('ai',function(card){
	if(get.attitude(player,trigger.player)<0) return 0;
	return 1
	})
	'step 1'
	if(result.bool){
	player.logSkill("boss_xiangruia")
	player.recover()
	}
	},
	},
	"boss_xiongqv1":{inherit:'boss_xiongqv',},
	"boss_xiongqv2":{inherit:'boss_xiongqv',},
	"boss_xiongqv":{
	mod:{
	targetEnabled:function(card){
	if(card.name=='toulianghuanzhu'||card.name=='pofuchenzhou') return false;
	}
	}
	},
	"boss_wuyou":{
	trigger:{
	player:["phaseDrawBegin","phaseUseBegin"],
	},
	direct:true,
	forced:true,
	popup:false,
	content:function (){
	trigger.cancel()
	},
	},
	"boss_zhuguozi":{
	marktext:'🍒',
	intro:{
	name:'🍒',
	content:'当前有#颗朱果子',
	},
	},
	"boss_weihu":{
	trigger:{
	player:"phaseZhunbeiBegin",
	},
	filter:function (event,player){
	return player.countMark("boss_zhuguozi")
	},
	forced:true,
	content:function (){
	'step 0'
	if(player.hp!=player.maxHp){
	var num=player.maxHp-player.hp
	if(player.countMark("boss_zhuguozi")<num) num=player.countMark("boss_zhuguozi")
	game.countPlayer(function(current2){
	if(current2.countMark("boss_zhuguozi")){
	current2.removeMark("boss_zhuguozi",num)
	}
	});
	player.recover(num)
	}
	'step 1'
	if(!player.hasSkill('boss_zuoji')&&player.countMark("boss_zhuguozi")>3){
	game.countPlayer(function(current2){
	if(current2.countMark("boss_zhuguozi")){
	current2.removeMark("boss_zhuguozi",4)
	}
	});
	player.node.avatar.setBackgroundImage('extension/山海志异挑战/boss_xiaohu2.jpg');
	player.addSkill('boss_zuoji')
	}
	},
	},
	"boss_zuoji":{
	trigger:{
	global:"damageEnd",
	},
	filter:function (event,player){
	return event.card&&event.card.name=="sha"&&player.getEnemies().contains(event.player)&&player.getFriends().contains(event.source)
	},
	forced:true,
	content:function (){
	trigger.player.damage()
	},
	},
	"boss_miewua":{
	audio:"spmiewu",
	enable:['chooseToUse','chooseToRespond'],
	filter:function(event,player){
	if(!player.storage.buqu||!player.storage.buqu.length||!player.countCards('hse')||player.hasSkill('boss_miewua2')) return false;
	for(var i of lib.inpile){
	var type=get.type2(i);
	if((type=='basic'||type=='trick')&&lib.filter.filterCard({name:i},player,event)) return true;
	}
	return false;
	},
	chooseButton:{
	dialog:function(event,player){
	var list=[];
	for(var i=0;i<lib.inpile.length;i++){
	var name=lib.inpile[i];
	if(name=='sha'){
	if(event.filterCard({name:name},player,event)) list.push(['基本','','sha']);
	for(var j of lib.inpile_nature){
	if(event.filterCard({name:name,nature:j},player,event)) list.push(['基本','','sha',j]);
	}
	}
	else if(get.type2(name)=='trick'&&event.filterCard({name:name},player,event)) list.push(['锦囊','',name]);
	else if(get.type(name)=='basic'&&event.filterCard({name:name},player,event)) list.push(['基本','',name]);
	}
	return ui.create.dialog('灭吴',[list,'vcard']);
	},
	filter:function(button,player){
	return _status.event.getParent().filterCard({name:button.link[2]},player,_status.event.getParent());
	},
	check:function(button){
	var player=_status.event.player;
	if(player.countCards('hs',button.link[2])>0) return 0;
	if(['wugu','zhulu_card'].contains(button.link[2])) return 0;
	var effect=player.getUseValue(button.link[2]);
	if(effect>0) return effect;
	return 0;
	},
	check:function(button){
	if(_status.event.getParent().type!='phase') return 1;
	var player=_status.event.player;
	if(['wugu','zhulu_card','yiyi','lulitongxin','lianjunshengyan','diaohulishan'].contains(button.link[2])) return 0;
	return player.getUseValue({
	name:button.link[2],
	nature:button.link[3],
	});
	},
	backup:function(links,player){
	return {
	filterCard:true,
	audio:'spmiewu',
	popname:true,
	check:function(card){
	return 8-get.value(card);
	},
	position:'hse',
	viewAs:{name:links[0][2],nature:links[0][3]},
	precontent:function(){
	player.addTempSkill('boss_miewua2');
	var carda=player.storage.buqu.randomGet()
	player.$throw(carda);
	player.storage.buqu.remove(carda);
	game.cardsDiscard(player.storage.buqu);
	player.syncStorage('buqu');
	if(!player.storage.buqu.length){
	player.unmarkSkill('buqu');
	}
	else player.updateMarks('buqu');
	},
	}
	},
	prompt:function(links,player){
	return '将一张牌当做'+(get.translation(links[0][3])||'')+get.translation(links[0][2])+'使用';
	}
	},
	hiddenCard:function(player,name){
	var type=get.type2(name);
	return (type=='basic'||type=='trick')&&player.storage.buqu&&player.storage.buqu.length>0&&player.countCards('she')>0&&!player.hasSkill('boss_miewua2');
	},
	ai:{
	fireAttack:true,
	respondSha:true,
	respondShan:true,
	skillTagFilter:function(player){
	if((player.storage.buqu&&!player.storage.buqu.length)||!player.countCards('hse')||player.hasSkill('boss_miewua2')) return false;
	},
	order:1,
	result:{
	player:function(player){
	if(_status.event.dying) return get.attitude(player,_status.event.dying);
	return 1;
	},
	},
	},
	},
	boss_miewua2:{
	trigger:{player:['useCardAfter','respondAfter']},
	forced:true,
	charlotte:true,
	popup:false,
	filter:function(event,player){
	return event.skill=='boss_miewua_backup';
	},
	content:function(){
	player.draw();
	},
	},
	
	
	//浪琴羽	
	},//技能
	// --------------------------------------武将/技能翻译------------------------------------------//
	translate:{
	"山海志异挑战":"<font color=#FFBB00>山海志异</font><font color=#FF3EFF>挑战</font>",
	"shzy":"山海志异",
	"dypg":"地狱判官",
	"sdqy":"圣诞奇遇",
	"tzwl":"挑战无良",
	"yhbz":"烟花爆竹",
	"lljs":"萝莉祭司",
	"alhg":"奥利哈刚",
	"qqzj":"青青子衿",
	"djbs":"单将boss",
	
	"boss_shanhaizhiyi":"驱逐年兽",
	"boss_shanhaizhiyiB":"将魂觉醒",
	"boss_shanhaizhiyiC":"驱鬼辟邪",
	"boss_shanhaizhiyiD":"瑞麟降世",
	"boss_shanhaizhiyiE":"虎虎生威",
	"boss_diyvpanguan":"地狱判官",
	"boss_aolihagang":"奥利哈刚",
	"boss_qingqingzijin":"青青子衿",
	
	"boss_xvzhu_hun":"魂·许褚",
	"boss_simayi_hun":"魂·司马懿",
	"boss_caocao_hun":"魂·曹操",
	"boss_ganning_hun":"魂·甘宁",
	"boss_zhouyv_hun":"魂·周瑜",
	"boss_sunquan_hun":"魂·孙权",
	"boss_guanyv_hun":"魂·关羽",
	"boss_zhugeliang_hun":"魂·诸葛亮",
	"boss_liubei_hun":"魂·刘备",
	"boss_diaochan_hun":"魂·貂蝉",
	"boss_lvbu_hun":"魂·神吕布",
	"boss_zhouyv_hun":"魂·周瑜",
	"boss_chi1":"魑",
	"boss_mei1":"魅",
	"boss_wang1":"魍",
	"boss_liang1":"魉",
	"boss_niutou1":"牛头",
	"boss_mamian1":"马面",
	"boss_nianshou1":"年兽",
	"boss_yanluowanga":"阎罗王",
	"boss_guiwang":"鬼王",
	"boss_riyeyoushen":"日夜游神",
	"boss_niutoumamian":"牛头马面",
	"boss_heibaiwuchang":"黑白无常",
	"boss_mengpoa":"孟婆",
	"boss_yvsai":"鱼鳃",
	"boss_niaozui":"鸟嘴",
	"boss_huangfeng":"黄蜂",
	"boss_baowei":"豹尾",
	"boss_langqinbiao":"浪琴婊",
	"boss_alhg_qidala":"奇达拉",
	"boss_alhg_jingziqishi":"镜子骑士",
	"boss_alhg_jingzishibing":"镜子士兵",
	"boss_alhg_qijiasi":"奇甲斯",
	"boss_alhg_xiruonuosi":"西若诺斯",
	"boss_alhg_xiruonuosizuoshou":"西若诺斯左手",
	"boss_alhg_xiruonuosiyoushou":"西若诺斯右手",
	"boss_alhg_shantongshenou":"山铜神偶",
	"boss_alhg_sheshenyi":"蛇神藝",
	"boss_alhg_dazi":"达姿",
	"boss_alhg_zhishen":"奥利哈刚之神",
	"boss_luocha1":"罗刹",
	"boss_yecha1":"夜叉",
	"boss_heiwuchang1":"黑无常",
	"boss_baiwuchang1":"白无常",
	"boss_zhangrang1":"十常侍张让",
	"boss_machao1":"永远的神",
	"boss_sanguoliemaren":"三国猎马人",
	"boss_caocao_qqzj":"曹操",
	"boss_simayi_qqzj":"司马懿",
	"boss_lvbu_qqzj":"吕布",
	"boss_dongzhuo_qqzj":"董卓",
	"boss_zhangjiao_qqzj":"张角",
	"boss_yuanshu_qqzj":"袁术",
	"boss_qiongqi1":"穷奇",
	"boss_hundun1":"混沌",
	"boss_taowu1":"梼杌",
	"boss_taotie1":"饕餮",
	"boss_zhuyin1":"逐阴",
	"boss_qilin1":"麒麟",
	"boss_zhuquejiangling":"朱雀降灵",
	"boss_xuanwujiangling":"玄武降灵",
	"boss_zhuquefaxiang":"朱雀法相",
	"boss_xuanwufaxiang":"玄武法相",
	"boss_zhuquezhenshen":"朱雀真身",
	"boss_xuanwuzhenshen":"玄武真身",
	"boss_xiaohu1":"小虎",
	"boss_ling":"靈",
	
	boss_kongbai:" ",
	boss_kongbai_info:" ",
	boss_shanhaif2:'&nbsp;选模式',
	boss_shanhaif2_info:'山海志异挑战分三种模式，请打开扩展页面在山海志异的选择中选择自己想要挑战的模式。',
	boss_shanhai:'&nbsp;第一关',//兽1、魂2、鬼3
	boss_shanhai_info:'挑战魑、魅、魍、魉中的随机一个。',
	boss_shanhaiB_info:'挑战魂·许褚、魂·甘宁、魂·关羽、魂·貂蝉中的随机一个。',
	boss_shanhaiC_info:'挑战穷奇、混沌中的随机一个。游戏开始时召唤麒麟为我方助阵，击败敌人的同时也要保护好麒麟，若麒麟阵亡则直接判定挑战方败北。',
	boss_shanhaiD_info:'挑战朱雀、玄武两位神兽，boss阵亡时会进入修整，再度复活变得更加强大，同时击杀两位神兽的真身才能获得胜利。游戏开始时会召唤小虎为我方助阵，击败敌人的同时也要保护好小虎，若小虎阵亡则直接判定挑战方败北。',
	boss_shanhaif:'&nbsp;第二关',
	boss_shanhaif_info:'挑战牛头、马面中的随机一个。',
	boss_shanhaiBf_info:'挑战魂·司马懿、魂·周瑜、魂·诸葛亮中的随机一个。',
	boss_shanhaiCf_info:'挑战饕餮、梼杌中的随机一个。',
	boss_shanhaif1:'&nbsp;第三关',
	boss_shanhaif1yi:'&nbsp;第三关',
	boss_shanhaif1_info:'挑战年兽。',
	boss_shanhaiBf1_info:'挑战魂·曹操、魂·孙权、魂·刘备、魂·神吕布中的随机一个。',
	boss_shanhaiCf1_info:'挑战罗刹、夜叉、黑无常、白无常中的随机一个。',
	boss_shanhaiDf1_info:'挑战逐阴。',
	boss_yvguan:'&nbsp;第一关',
	boss_yvguan_info:'挑战孟婆。',
	boss_yvguanf:'&nbsp;第二关',
	boss_yvguanf_info:'挑战黑白无常、牛头马面、日夜游神随机一个和黄蜂、豹尾、鸟嘴、鱼鳃随机一个。',
	boss_yvguanf1:'&nbsp;第三关',
	boss_yvguanf1_info:'挑战鬼王。',
	boss_yvguanf2:'&nbsp;第四关',
	boss_yvguanf2_info:'挑战阎罗王。',
	boss_aogang:'&nbsp;第一关',
	boss_aogang_info:'挑战奇达拉，随从奇甲斯、镜子士兵。',
	boss_aogangf:'&nbsp;第二关',
	boss_aogangf_info:'挑战西若诺斯，随从西若诺斯左手、西若诺斯右手。',
	boss_aogangf1:'&nbsp;第三关',
	boss_aogangf1_info:'挑战达姿，随从蛇神藝。',
	boss_aogangf2:'&nbsp;第四关',
	boss_aogangf2_info:'挑战奥利哈刚之神。',
	boss_qqzijinf:'子衿',
	boss_qqzijinf_info:'挑战曹操、司马懿、董卓、吕布、袁术、张角中的随机两个。',
	
	"hanyong1":"悍勇",
	"hanyong1_info":"当你使用【南蛮入侵】或【万箭齐发】或黑色【杀】时，若你的体力值不大于游戏轮数，你可以令此牌的伤害值基数+1。",
	"boss_jvhuo":"惧火",
	"boss_jvhuo_info":"锁定技，你受到的火属性伤害始终＋2。",
	"boss_zhennu":"震怒",
	"boss_zhennu_info":"锁定技，准备阶段，你对所有角色造成一点伤害。",
	"boss_aotang":"熬汤",
	"boss_aotang_info":"锁定技，你的回合开始时，令随机一名其他角色遗忘所有技能，直到你的下回合开始。",
	"boss_yunjv":"云飓",
	"boss_yunjv_info":"锁定技，一名其他角色的回合结束时，该角色随机弃置一张手牌。",
	"boss_guimeib":"鬼魅",
	"boss_guimeib_info":"锁定技，你不会被翻面；若你的出牌阶段被跳过，你跳过本回合的弃牌阶段；若你的摸牌阶段被跳过，你摸一张牌。",
	"boss_xixinga":"吸星",
	"boss_xixinga_info":"锁定技，准备阶段，你对所有敌方角色造成一点雷电伤害，然后你回复一点体力。",
	"boss_taipinga":"太平",
	"boss_taipinga_info":"锁定技，当你受到1点伤害后，伤害来源需要弃置两张不同花色的手牌，否则其失去一点体力。",
	"boss_mizuia":"迷醉",
	"boss_mizuia_info":"你使用的红色或属性【杀】造成伤害后，你可以弃置目标两张牌。",
	"boss_qiangzhenga":"强征",
	"boss_qiangzhenga_info":"锁定技，结束阶段，你获得所有手牌不大于2的敌方角色各一张手牌。",
	"boss_xiaoshoua":"枭首",
	"boss_xiaoshoua_info":"锁定技，准备阶段，你对一名体力值大于或等于你的敌方角色造成2点伤害",
	"boss_manji":"蛮击",
	"boss_manji_info":"当你使用【杀】指定一名角色为目标后，你可以弃置其一张牌，若以此法弃置的牌为【杀】，则此【杀】造成的伤害＋1，若不为【杀】，则你获得那张弃置的牌。",
	"boss_shiyv":"施狱",
	"boss_shiyv_info":"锁定技，摸牌阶段你改为从牌堆中获得4张花色各不同的牌。",
	"boss_guizhao":"诡招",
	"boss_guizhao_info":"锁定技，当你于回合内使用一张牌时，若此牌的类别是你本回合第一次使用，则你摸一张牌。",
	"boss_duane":"断恶",
	"boss_duane_info":"锁定技，当敌方角色于其弃牌阶段弃置了黑色牌，该角色失去一点体力值。",
	"boss_zhoucha":"昼刹",
	"boss_zhoucha_info":"锁定技，准备阶段，你进行一次判定并获得该判定牌，若结果为红色，你本回合出杀数量＋2。",
	"boss_yezhong":"夜冢",
	"boss_yezhong_info":"锁定技，结束阶段，你进行一次判定并获得该判定牌，若结果为黑色，你令所有敌方角色随机弃置一张手牌。",
	"boss_huiyun":"晦运",
	"boss_huiyun_info":"出牌阶段限一次，你可以展示一名敌方角色的手牌，并弃置其中至多两张牌。然后你可以弃置一张与该角色弃置的牌牌名相同的牌，对其造成2点伤害。",
	"boss_yinsha":"隐煞",
	"boss_yinsha_info":"锁定技，敌方角色的出牌阶段开始时，若其手牌数大于其体力上限，你本回合不能成为【杀】的目标。",
	"boss_eli":"恶力",
	"boss_eli_info":"锁定技，你每回合第一次对敌方角色造成伤害时，你进行一次判定：若结果为红色，此伤害+1；若结果为黑色，你获得〖完杀〗直到回合结束。",
	"boss_bingyi":"病疑",
	"boss_bingyi_info":"锁定技，每回合限一次，当你失去最后的手牌时，你摸六张牌。",
	"boss_suoxue":"索穴",
	"boss_suoxue_info":"你使用【杀】指定目标后，若其手牌数大于你，你可将手牌摸至与该角色相同；若其手牌数小于你，你可弃置一张手牌令此【杀】不能被闪避。",
	"boss_duzhen":"毒针",
	"boss_duzhen_info":"锁定技，你的回合内，当你使用单体性牌指定一名敌方角色时，该角色随机弃置一张牌（优先弃置装备区内的牌）。",
	"boss_mingchong":"冥虫",
	"boss_mingchong_info":"锁定技，你死亡时，若有其他己方角色存活，那些角色获得〖毒针〗。",
	"boss_guixi":"鬼吸",
	"boss_guixi_info":"锁定技，当你受到伤害后，你进行一次判定：若结果为红桃，你回复一点体力，否则你失去一点体力值。",
	"boss_anchao":"暗潮",
	"boss_anchao_info":"锁定技，己方角色回合结束时，若该角色本回合内未造成过伤害，则其获得一枚“暗潮”标记。若该角色造成过伤害，则其清空所有“暗潮”标记。锁定技，己方角色摸牌阶段多摸X张牌，造成伤害时，伤害＋X。（X为该角色拥有的“暗潮”标记数量）",
	"boss_tiemianhong":"铁面",
	"boss_tiemianhong_info":"锁定技，红色【杀】有75%的概率对你无效。",
	"boss_jizhou1":"疾咒",
	"boss_jizhou1_info":"锁定技，一名敌方角色的出牌阶段结束时，你进行一次判定，然后该角色需要弃置任意张点数之和大于判定结果的牌（若弃置的牌超过两张，你获得一枚“噬”标记），否则该角色失去1点体力值。",
	"boss_danshi":"啖噬",
	"boss_danshi_info":"锁定技，当你受到伤害时，此伤害＋X，然后你失去一枚“噬”标记（X为你拥有的“噬”标记数量）。",
	"boss_chihu":"赤虎",
	"boss_chihu_info":"锁定技，你的手牌不为全场最多的，摸牌阶段你多摸两张牌。你的体力值不为全场最多的，你造成的伤害＋1。",
	"boss_difua":"地府",
	"boss_difua_info":"锁定技，一名敌方角色的出牌阶段开始时，若其手牌数大于其体力值上限，则其将手牌弃置至体力值上限。",
	"boss_zhennub":"震怒",
	"boss_zhennub_info":"锁定技，当你的体力值首次降至8或更低时，你立即开始你的回合，并摸四张牌。",
	"boss_xingpan":"刑判",
	"boss_xingpan_info":"锁定技，出牌阶段开始时，你进行一次判定：若结果为红色，敌方唯一手牌最多的角色将一半（向下取整）手牌交给你；若结果为黑色，敌方唯一体力最多的角色失去一点体力值。",
	"boss_dianwei":"殿威",
	"boss_dianwei_info":"锁定技，准备阶段，你视为对所有装备区内没装备牌的敌方角色使用一张【杀】，且装备区内有牌的角色随机弃置一张装备牌。",
	"boss_xuanpan":"宣判",
	"boss_xuanpan_info":"锁定技，一名敌方角色回合结束时：①若其本回合对你造成过4点或更多的伤害，你随机对其造成1~4点伤害；②若其本回合摸牌数达到8张或更多，你随机摸1~4张牌；③若其本回合回复了3点或更多的体力，你随机回复1~4点体力；④若你本回合弃置了4张或更多的牌，其随机弃置1~4张牌。",
	"boss_qvshoua":"驱兽",
	"boss_qvshoua_info":"锁定技，回合开始时，你视为对所有敌方角色使用一张【南蛮入侵】。",
	"boss_mojiana":"魔箭",
	"boss_mojiana_info":"锁定技，回合开始时，你视为对所有敌方角色使用一张【万箭齐发】。",
	"boss_manjiab":"蛮甲",
	"boss_manjiab_info":"锁定技，若你装备区没有防具牌，则你视为装备了【藤甲】。",
	"boss_shanbeng1":"山崩",
	"boss_shanbeng1_info":"锁定技，当你死亡时，你令所有其他角色弃置其装备区内的所有牌。",
	"boss_beiminga":"悲鸣",
	"boss_beiminga_info":"锁定技，当你死亡时，你令杀死你的角色弃置所有手牌。",
	"boss_yingying":"嘤嘤",
	"boss_yingying_info":"当一名角色使用非装备牌后，你可以将此牌置于牌堆底，若当前回合不为你的回合，则你需要先弃置一张牌。",
	"boss_abaaba":"阿巴",
	"boss_abaaba_info":"锁定技，你的回合结束时，你展示牌堆底的一张牌并使用之。若如此做，你重复此流程，直到你以此法展示的牌无法使用为止，然后你获得那张牌。",
	"boss_miaowu":"喵呜",
	"boss_miaowu_info":"锁定技，当你死亡时，你选择一种类型（基本/锦囊/装备/其他），然后翻开牌堆底的一张牌并获得之，若那张牌的类型和你选择的类型一样，则你不死亡，将体力值上限变成2，体力值回复至2，并摸一张牌。",
	"boss_chiliu":"哧溜",
	"boss_chiliu_info":"锁定技，你进入濒死状态时，立即死亡，你不会被翻面，与其他角色计算的距离-1，手牌上限+2；你的回合开始时，你受到一点雷属性伤害。并获得判定区里的所有牌。",
	"boss_guihuoa":"鬼火",
	"boss_guihuoa_info":"结束阶段，你可以对一名其他角色造成1点火焰伤害",
	"boss_modaoa":"魔道",
	"boss_modaoa_info":"锁定技，准备阶段，你摸两张牌",
	"boss_guimeia":"鬼魅",
	"boss_guimeia_info":"锁定技，你的手牌上限永久+4。",
	"boss_qida":"奇达",
	"boss_qida_info":"锁定技，你受到伤害前，你摸X张牌，然后将伤害转移给其他友方角色。当己方角色受到伤害时，你获得X枚“奇达”标记。（X为受的的伤害数值）",
	"boss_qijia":"奇甲",
	"boss_qijia_info":"锁定技，一名角色回合结束时，若你已经死亡，则你复活，并摸4张牌，然后增加一点体力值上限。你的摸牌阶段改为摸X张牌。（X为你的体力值上限）",
	"boss_jingying":"镜映",
	"boss_jingying_info":"锁定技，每回合限一次，当你受到伤害后，你回复X点体力值，并摸一张牌，若伤害来源为敌方角色，你随机获得来源角色的一个技能直到你的回合结束。",
	"boss_zuidun":"最盾",
	"boss_zuidun_info":"西若诺斯的最强之盾：锁定技，没有技能【最盾】的友方角色不能成为敌方牌的目标，你受的大于1的伤害时，伤害减至1，若伤害来源是敌方角色，则该角色受到超出的伤害。",
	"boss_zuiren":"最刃",
	"boss_zuiren_info":"西若诺斯的最强之刃：锁定技，你受到伤害后，你发现一张普通锦囊牌，并使用那张牌。你对敌方角色造成伤害时，你进行一次判定，若判定结果为装备牌，你令伤害+2。",
	"boss_shenou":"神偶",
	"boss_shenou_info":"锁定技，你作为boss出场时，你的体力值变成“奇达拉”吸收的“奇达”标记数，若无标记则变成无限。当你的双臂造成伤害后，你受到等量的伤害。",
	"boss_baoxing":"暴行",
	"boss_baoxing_info":"锁定技，当你受的伤害后，你摸X张牌，（X为受到的伤害数），然后伤害每有1点，你进行一次判定：黑桃，你对一名敌方角色造成一点雷电伤害；红桃，你摸一张牌并回复一点体力；梅花，你令所有敌方角色进入铁索连环状态，若已被铁索连环的角色改为随机弃置一张牌；方块，你获得一名角色区域内的各一张牌。",
	"boss_shenhuang":"神荒",
	"boss_shenhuang_info":"锁定技，你使用【杀】指定目标时，翻开牌堆顶10张牌，弃置其中一张【杀】，令你使用的【杀】伤害基数变成那张牌的点数，否则你令此【杀】无效并获得一枚“暗黑”标记。",
	"boss_pangqv":"庞躯",
	"boss_pangqv_info":"锁定技，你的回合结束后，若你于回合内没有造成过伤害或你累计受到10点伤害后，你获得一枚“暗黑”标记，当你的“暗黑”标记达到4枚后，你立即死亡。",
	"boss_anxi":"暗袭",
	"boss_anxi_info":"锁定技，当你体力值减少后，你摸三张牌，并且可以使用其中一张牌。",
	"boss_xieqv":"邪躯",
	"boss_xieqv_info":"锁定技，你死亡时，你弃置两张牌，取消之，然后若你的体力值小于2，你将体力值变成2，并立即开始你的回合。",
	"boss_shenzong":"神踪",
	"boss_shenzong_info":"出牌阶段，你可以弃置一张手牌，根据弃置的牌名发动效果：【无中生有】，你摸4张牌；【顺手牵羊】，你获得1~2名其他角色合计2张牌；【过河拆桥】，你弃置任意名其他角色一张牌；【借刀杀人】，你获得一名其他角色装备区里的一张装备牌；【铁索连环】，你令任意名其他角色横置，若其他角色均已横置，则你改为摸两张牌，若你已横置，则你解除横置；【桃园结义】，你回复2点体力值，回复超出的值改为获得等量的护甲；【五谷丰登】，你翻开牌堆顶4张牌，并获得其中两张牌；【南蛮入侵】，你视为使用一张【惊雷闪】；【万箭齐发】，你视为使用一张【炽羽袭】；【决斗】，你对一名其他角色造成一点雷电伤害；【火攻】，你对一名其他角色造成一点火焰伤害。",
	"boss_shenyia":"神意",
	"boss_shenyia_info":"锁定技，敌方角色使用或打出【无懈可击】或【闪】时，你有75%的几率对该角色造成一点火焰伤害。",
	"boss_shenpo":"神魄",
	"boss_shenpo_info":"锁定技，你跳过你的判定阶段改为摸两张牌；你翻面时，取消之，然后摸两张牌。",
	"boss_shenyan":"神焉",
	"boss_shenyan_info":"锁定技，其他角色使用牌后，你有57%的几率获得一张同名牌，然后你可以使用一张牌。",
	"boss_zuijiua":"醉酒",
	"boss_zuijiua_info":"锁定技，你使用的【杀】伤害+1。",
	"boss_leilia":"雷厉",
	"boss_leilia_info":"每当你的【杀】造成伤害后，你可以对另一名敌方角色造成1点雷电伤害。",
	"boss_danshua":"丹术",
	"boss_danshua_info":"锁定技，每当你于回合外失去牌时，你可以进行一次判定，若结果为红色，你回复1点体力。",
	"boss_guanshi":"官势",
	"boss_guanshi_info":"锁定技，当你成为延迟性锦囊牌的目标时/当你翻面时，你进行一次判定，若结果为黑色，你取消之。若结果为红桃，你可以将该牌转移给其他角色/你可以令一名其他角色翻面。",
	"boss_huoluan":"祸乱",
	"boss_huoluan_info":"锁定技，出牌阶段开始时，你从牌堆随机获得的一张黑色的普通锦囊牌，并使用那张牌，否则你弃置那张牌。然后你重复此步骤直到发动了4次。",
	"boss_xvmou":"蓄谋",
	"boss_xvmou_info":"锁定技，当你受到伤害后，你下次对敌方角色造成的伤害基数+1。(最多加4)",
	"boss_jiquan":"集权",
	"boss_jiquan_info":"锁定技，回合开始时，你将手牌摸至8张。",
	"boss_luanzheng":"乱政",
	"boss_luanzheng_info":"锁定技，当一名敌方角色于其的回合内获得牌时/对你造成伤害时，若该角色此时的手牌数大于10张/若该角色本回合对你造成的伤害值合计大于5，你令该角色本回合不能使用或打出牌。",
	"boss_tieji1":"铁骑",
	"boss_tieji1_info":"当你使用【杀】指定目标后，你可以进行判定并令该角色所有技能失效直到回合结束。若结果为红色，目标弃置一张红色牌，且此【杀】不可被闪避。若结果为黑色，目标需弃置两张黑色牌，否则此【杀】不可被闪避。",
	"boss_xiongshi":"雄师",
	"boss_xiongshi_info":"<font color=#FF3333>西凉雄师：</font>出牌阶段，若你手牌上没有【杀】，你可以将所有手牌当做一张无距离与数量限制，且伤害基数+1的【杀】使用。",
	"boss_mashu1":"马术",
	"boss_mashu1_info":"<font color=#FF3333>马氏断杀术：</font>锁定技，你计算与其他角色的距离时-1。你摸牌时有较大的几率断【杀】。你的回合结束后，若你手牌上没有【杀】，则你摸X张牌。(X为你本回合造成的伤害数)",
	"boss_qianji":"千骑",
	"boss_qianji_info":"<font color=#FF3333>一骑当千：</font>出牌阶段，你可以将一名已被〖铁骑〗的角色的〖铁骑〗印转移到一名本回合内未被〖铁骑〗过的角色上，视为对该角色使用一张【杀】。",
	"boss_malianga":"马良",
	"boss_malianga_info":"锁定技，你的回合开始时/回合结束后，若你的装备区内有进攻马/防御马，你摸两张牌；其他角色的回合开始时/回合结束后，若你的装备区内有两只坐骑牌，且颜色相同/点数相同，你摸两张牌。",
	"boss_majuna":"马钧",
	"boss_majuna_info":"锁定技，你装备区内的坐骑牌不会被其他角色弃置，当其他角色有坐骑牌时，你立即获得那些牌；你的出牌阶段开始时，你从牌堆里获得一张随机坐骑牌。",
	"boss_machaoa":"马超",
	"boss_machaoa_info":"锁定技，你装备坐骑牌或失去装备区里的一张坐骑牌时，你摸一张牌。回合外，其他角色使用牌结算后，你可以使用一张牌。",
	"boss_mazhonga":"马忠",
	"boss_mazhonga_info":"你使用杀指定目标时，可以获得目标的一张牌，然后将那张牌变成一张随机坐骑牌置入你的装备区。",
	"boss_lingba":"霸凌",
	"boss_lingba_info":"锁定技，你的回合开始时，若你手牌数为全场最多，则对一名随机敌人造成2点伤害。若你手牌数大于等于你体力值的两倍，则改为对所有敌人造成伤害。",
	"boss_yishen":"疑神",
	"boss_yishen_info":"当你回复体力时，可以改为获得所有敌人各一张随机装备。",
	"boss_langgu":"狼顾",
	"boss_langgu_info":"锁定技，每回合限一次，当你获得其他角色的牌时，进行一次判定：若结果为黑色，随机弃置其1张手牌，且视为此技能本回合未发动过。",
	"boss_yuanlv":"远虑",
	"boss_yuanlv_info":"当你使用锦囊牌对敌方角色造成伤害时，你可以防止该伤害，改为摸一张牌且该敌方角色对你造成1点伤害。",
	"boss_shenji":"神戟",
	"boss_shenji_info":"判定阶段，你可以弃置两张手牌，然后弃置你判定区里的牌；摸牌阶段，你多摸两张牌；出牌阶段，你可以多使用两张【杀】，你的【杀】可以多指定两名角色为目标。",
	"boss_zhankai":"战铠",
	"boss_zhankai_info":"锁定技，每回合限一次，当你受到大于2点的伤害时，将此伤害减至2点，然后摸两张牌。",
	"boss_baonue":"暴虐",
	"boss_baonue_info":"锁定技，回合开始时，你摸X张牌并对至多X名角色造成1点伤害，然后你失去1点体力。（X为你已损失体力且最大为5）",
	"boss_qvbu":"驭布",
	"boss_qvbu_info":"锁定技，当友方角色使用【杀】指定目标时，你进行一次判定：若结果为黑色，你对此【杀】的所有目标造成1点伤害。",
	"boss_jianzheng":"谏征",
	"boss_jianzheng_info":"当一名其他角色使用【杀】指定目标时，若你在其攻击范围内且你不是目标，则你可以将一张手牌置于牌堆顶，取消所有目标，然后你成为目标。",
	"boss_yinlei":"引雷",
	"boss_yinlei_info":"锁定技，当你失去牌时，随机横置或重置一名角色。",
	"boss_wangzun":"妄尊",
	"boss_wangzun_info":"锁定技，其他敌方角色的结束阶段，若其本回合：1.没有对你造成伤害，则其弃置2张牌；2.对你造成过伤害，则你对其造成1点伤害。",
	"boss_duoxi":"夺玺",
	"boss_duoxi_info":"其他角色的摸牌阶段，你可以失去1点体力改为你摸两张牌。",
	"boss_xiemei":"邪魅",
	"boss_xiemei_info":"锁定技，你计算与其他角色的距离时-1。",
	"boss_shehun":"摄魂",
	"boss_shehun_info":'每当你受到伤害后，你可以获得对你造成伤害的牌，然后摸一张牌。',
	"boss_lingsi":"灵嘶",
	"boss_lingsi_info":"锁定技，准备阶段，你对所有角色造成一点伤害。",
	"boss_taoyuan":"饕怨",
	"boss_taoyuan_info":'准备阶段开始时，你可以视为使用一张无距离限制的【杀】。',
	"boss_duoling":"夺灵",
	"boss_duoling_info":'锁定技，当你造成一点伤害后，若受伤角色与你的距离不大于1，你回复一点体力。',
	"boss_jingxin":"惊心",
	"boss_jingxin_info":"当你使用【杀】对一名其他角色造成伤害后，你可以获得其一张牌。若此牌不为装备牌，则其摸一张牌。若此牌为装备牌，则视为你对其选择的另一名角色使用一张【决斗】。",
	"boss_yazi":"睚眦",
	"boss_yazi_info":'当你受到伤害后，你可以获得伤害来源的一张牌。',
	"boss_xiangruia":"祥瑞",
	"boss_xiangruia_info":'其他角色的出牌阶段结束时，其可以弃置两张牌，然后令你回复一点体力值。',
	"boss_lihuo":"离火",
	"boss_lihuo_info":"结束阶段，你可以对一名其他角色造成1点火焰伤害",
	"boss_leilia":'雷厉',
	"boss_leilia_info":'每当你的【杀】造成伤害后，你可以对另一名敌方角色造成1点雷电伤害。',
	"boss_fengxinga":'风行',
	"boss_fengxinga_info":'准备阶段，你可以选择一名敌方角色，若如此做，视为对其使用了一张【杀】。',
	"boss_zhenlei":"震雷",
	"boss_zhenlei_info":'准备阶段，你可以对一名其他角色造成1点雷电伤害。',
	"boss_lingsia":"灵嘶",
	"boss_lingsia_info":'锁定技，当你死亡时，对场上所有其他角色造成1点火焰伤害。',
	"boss_xiongqv":"雄躯",
	"boss_xiongqv_info":"锁定技，你不会成为【偷梁换柱】和【破釜沉舟】的目标。",
	"boss_yvtu":"御兔",
	"boss_yvtu_info":"每轮限一次，你可以视为使用一张【杀】或【闪】。",
	"boss_wuyou":"无忧",
	"boss_wuyou_info":"锁定技，你始终跳过摸牌阶段和出牌阶段。",
	"_boss_lqb_zhuanshuer":"假威",
	"boss_weihu":"威虎",
	"boss_weihu_info":"锁定技，准备阶段，你消耗X颗朱果（X为你已损失的体力值，若不足则消耗全部朱果），并回复等量的体力值。若此时你未升级，且拥有的朱果数量不少于4，则你消耗4颗朱果进行升级。",
	"boss_zuoji":"佐击",
	"boss_zuoji_info":"锁定技，友方角色的【杀】对敌方角色造成伤害后，你对该敌方角色造成一点伤害。",
	"boss_fanshia":"反噬",
	"boss_fanshia_info":"锁定技，结束阶段，你失去一点体力值。",
	"boss_miewua":"灭吴",
	"boss_miewua_backup":"灭吴",
	"boss_miewua_info":'每回合限一次。你可以随机弃置武将牌上的一张“创”，然后将一张牌当做任意基本牌或锦囊牌使用或打出，若如此做，你摸一张牌。',
	
	
	},//翻译
	};
	return {
	name:"山海志异挑战",
	editable:false,
	content:function (config,pack){
	/*神，thunder 魏，water 蜀，soil 吴，wood 群，metal 主，fire
	color/颜色，suit/花色，number/点数，type/类型
	basic/基本，trick/锦囊，equip/装备，delay/延迟锦囊
	black/黑色，red/红色
	heart红桃，spade黑桃，diamond方片，club梅花
	priority，phaseAfter/4，useCard/1，phaseBefore/2
	game.countPlayer(function(current){
	if(player.getEnemies().contains(current)){
	current.update();
	}
	});*/
	lib.boss=lib.boss||{};
	lib.boss.global=lib.boss.global||{loopType:1,chongzheng:6};
	if(get.mode()=='boss'){//减员挑战
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if(pian=="boss_jianghunjuexing"){
	lib.translate['boss_shanhai_info']=get.translation('boss_shanhaiB_info')
	lib.translate['boss_shanhaif_info']=get.translation('boss_shanhaiBf_info')
	lib.translate['boss_shanhaif1_info']=get.translation('boss_shanhaiBf1_info')
	lib.translate['boss_shanhaizhiyi']=get.translation('boss_shanhaizhiyiB')
	}
	if(pian=="boss_qvguibixie"){
	lib.translate['boss_shanhaif1_info']=get.translation('boss_shanhaiCf1_info')
	lib.translate['boss_shanhaizhiyi']=get.translation('boss_shanhaizhiyiC')
	}
	if(pian=="boss_ruilinjiangshi"){
	lib.translate['boss_shanhai_info']=get.translation('boss_shanhaiC_info')
	lib.translate['boss_shanhaif_info']=get.translation('boss_shanhaiCf_info')
	lib.translate['boss_shanhaif1_info']=get.translation('boss_shanhaiDf1_info')
	lib.translate['boss_shanhaizhiyi']=get.translation('boss_shanhaizhiyiD')
	}
	if(pian=="boss_huhushengwei"){
	lib.translate['boss_shanhai_info']=get.translation('boss_shanhaiD_info')
	lib.translate['boss_shanhaif']=get.translation('boss_kongbai')
	lib.translate['boss_shanhaif_info']=get.translation('boss_kongbai_info')
	lib.translate['boss_shanhaif1']=get.translation('boss_kongbai')
	lib.translate['boss_shanhaif1_info']=get.translation('boss_kongbai_info')
	lib.translate['boss_shanhaizhiyi']=get.translation('boss_shanhaizhiyiE')
	}
	lib.game.chooseCharacter=function(func){
	var next=game.createEvent('chooseCharacter',false);
	next.showConfig=true;
	next.customreplacetarget=func;
	next.ai=function(player,list){
	if(get.config('double_character')){
	player.init(list[0],list[1]);
	}
	else{
	player.init(list[0]);
	}
	}
	next.setContent(function(){
	"step 0"
	var i;
	var list=[];
	event.list=list;
	for(i in lib.character){
	if(lib.character[i][4].contains('minskin')) continue;
	if(lib.character[i][4].contains('boss')) continue;
	if(lib.character[i][4].contains('hiddenboss')) continue;
	if(lib.character[i][4]&&lib.character[i][4].contains('forbidai')) continue;
	if(lib.config.forbidboss.contains(i)) continue;
	if(lib.filter.characterDisabled(i)) continue;
	list.push(i);
	}
	list.randomSort();
	var dialog=ui.create.dialog('选择参战角色','hidden');
	dialog.classList.add('fixed');
	ui.window.appendChild(dialog);
	dialog.classList.add('bosscharacter');
	dialog.classList.add('modeshortcutpause');
	dialog.classList.add('withbg');
	// dialog.add('0/3');
	dialog.add([list.slice(0,20),'character']);
	dialog.noopen=true;
	var next=game.me.chooseButton(dialog,true).set('onfree',true);
	next._triggered=null;
	next.custom.replace.target=event.customreplacetarget;
	if(lib.config['extension_'+'山海志异挑战_'+'boss_jianyuantiaozhan']=="1") next.selectButton=[3,3];
	if(lib.config['extension_'+'山海志异挑战_'+'boss_jianyuantiaozhan']=="2") next.selectButton=[2,2];
	if(lib.config['extension_'+'山海志异挑战_'+'boss_jianyuantiaozhan']=="3") next.selectButton=[1,1];
	event.changeDialog=function(){
	if(ui.cheat2&&ui.cheat2.dialog==_status.event.dialog){
	return;
	}
	if(game.changeCoin){
	game.changeCoin(-3);
	}
	list.randomSort();
	var buttons=ui.create.div('.buttons');
	var node=_status.event.dialog.buttons[0].parentNode;
	_status.event.dialog.buttons=ui.create.buttons(list.slice(0,20),'character',buttons);
	_status.event.dialog.content.insertBefore(buttons,node);
	buttons.animate('start');
	node.remove();
	game.uncheck();
	game.check();
	};
	ui.create.cheat=function(){
	_status.createControl=ui.cheat2||event.asboss;
	ui.cheat=ui.create.control('更换',event.changeDialog);
	delete _status.createControl;
	};
	var createCharacterDialog=function(){
	event.dialogxx=ui.create.characterDialog();
	event.dialogxx.classList.add('bosscharacter');
	event.dialogxx.classList.add('withbg');
	event.dialogxx.classList.add('fixed');
	if(ui.cheat2){
	ui.cheat2.animate('controlpressdownx',500);
	ui.cheat2.classList.remove('disabled');
	}
	};
	if(lib.onfree){
	lib.onfree.push(createCharacterDialog);
	}
	else{
	createCharacterDialog();
	}
	ui.create.cheat2=function(){
	_status.createControl=event.asboss;
	ui.cheat2=ui.create.control('自由选将',function(){
	if(this.dialog==_status.event.dialog){
	if(game.changeCoin){
	game.changeCoin(50);
	}
	this.dialog.close();
	_status.event.dialog=this.backup;
	ui.window.appendChild(this.backup);
	delete this.backup;
	game.uncheck();
	game.check();
	if(ui.cheat){
	ui.cheat.animate('controlpressdownx',500);
	ui.cheat.classList.remove('disabled');
	}
	if(_status.bosschoice){
	_status.bosschoice.animate('controlpressdownx',500);
	_status.bosschoice.classList.remove('disabled');
	}
	}
	else{
	if(game.changeCoin){
	game.changeCoin(-10);
	}
	this.backup=_status.event.dialog;
	_status.event.dialog.close();
	_status.event.dialog=_status.event.parent.dialogxx;
	this.dialog=_status.event.dialog;
	ui.window.appendChild(this.dialog);
	game.uncheck();
	game.check();
	if(ui.cheat){
	ui.cheat.classList.add('disabled');
	}
	if(_status.bosschoice){
	_status.bosschoice.classList.add('disabled');
	}
	}
	});
	if(lib.onfree){
	ui.cheat2.classList.add('disabled');
	}
	delete _status.createControl;
	}
	if(!ui.cheat&&get.config('change_choice'))
	ui.create.cheat();
	if(!ui.cheat2&&get.config('free_choose'))
	ui.create.cheat2();
	event.asboss=ui.create.control('应战',function(){
	event.boss=true;
	event.enemy=[];
	for(var i=0;i<ui.selected.buttons.length;i++){
	event.enemy.push(ui.selected.buttons[i].link);
	event.list.remove(ui.selected.buttons[i].link);
	}
	while(event.enemy.length<3){
	var name=event.list.randomRemove();
	if(lib.boss[lib.storage.current]&&lib.boss[lib.storage.current].randchoice){
	name=lib.boss[lib.storage.current].randchoice(name,event.enemy);
	}
	event.enemy.push(name);
	}
	game.uncheck();
	if(ui.confirm){
	ui.confirm.close();
	}
	game.resume();
	});
	"step 1"
	if(ui.cheat){
	ui.cheat.close();
	delete ui.cheat;
	}
	if(ui.cheat2){
	ui.cheat2.close();
	delete ui.cheat2;
	}
	event.asboss.close();
	if(_status.bosschoice){
	_status.bosschoice.close();
	delete _status.bosschoice;
	}
	if(event.boss){
	event.result={
	boss:true,
	links:event.enemy
	};
	}
	else{
	event.result={
	boss:false,
	links:result.links
	};
	_status.coinCoeff=get.coinCoeff(result.links);
	}
	});
	return next;
	}
	};
	lib.boss.boss_shanhaizhiyi={//山海志异
	loopType:1,
	chongzheng:0,
	loopFirst:function(){
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if(pian=="boss_huhushengwei") return game.boss
	return game.boss.nextSeat;
	},
	/*
	gameDraw:function(player){
	return player==game.boss?8:4;
	},
	minion:{
	'2':'xdz_modaohong',
	'8':'xdz_modaolv',
	},*/
	checkResult:function(player){
	if(player==game.boss&&game.boss.name!='boss_nianshou1'&&game.boss.name!='boss_caocao_hun'&&game.boss.name!='boss_sunquan_hun'&&game.boss.name!='boss_liubei_hun'&&game.boss.name!='boss_lvbu_hun'&&
	game.boss.name!='boss_luocha1'&&game.boss.name!='boss_yecha1'&&game.boss.name!='boss_baiwuchang1'&&game.boss.name!='boss_heiwuchang1'&&game.boss.name!='boss_zhuyin1'){
	return false;
	}
	},
	init:function(){
	_status.additionalReward=function(){
	return 500;
	}
	}
	}
	lib.boss.boss_diyvpanguan={//地狱
	loopType:1,
	chongzheng:0,
	gameDraw:function(player){
	return player==game.boss?10:4;
	},
	checkResult:function(player){
	if(player==game.boss&&game.boss.name!='boss_yanluowanga'){
	return false;
	}
	},
	init:function(){
	_status.additionalReward=function(){
	return 500;
	}
	}
	}
	lib.boss.boss_aolihagang={
	loopType:1,
	chongzheng:0,
	minion:{
	'2':'boss_alhg_qijiasi',
	'8':'boss_alhg_jingzishibing',
	},
	checkResult:function(player){
	if(player==game.boss&&game.boss.name!='boss_alhg_zhishen'){
	return false;
	}
	},
	init:function(){
	_status.additionalReward=function(){
	return 500;
	}
	}
	}
	lib.boss.boss_qingqingzijin={//青青子衿
	loopType:1,
	chongzheng:0,
	checkResult:function(player){
	return false;
	},
	gameDraw:function(player){
	return player==game.boss?10:4;
	},
	init:function(){
	game.addGlobalSkill('boss_qqzijinx');
	_status.additionalReward=function(){
	return 500;
	}
	}
	}
	lib.skill._boss_lqb_shouqi={//手气卡
	trigger:{
	global:"gameDrawEnd",
	},
	forced:true,
	popup:false,
	priority:1842044323,
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	if(!config.shouqi_ka) return false;
	return true;
	},
	content:function (){
	'step 0'
	player.chooseControl('确定','取消').set('ai',function(){ 
	return '取消';
	}).set('prompt','是否使用手气卡?');
	'step 1'
	var num=player.getCards('h')
	event.num=num.length
	if(result.control=='取消') event.finish()
	if(result.control=='确定'){
	var hs=game.me.getCards('h');
	game.addVideo('lose',game.me,[get.cardsInfo(hs),[],[]]);
	for(var i=0;i<hs.length;i++){
	hs[i].discard(false);
	}
	game.me.directgain(get.cards(hs.length));
	event.goto(0);
	}
	},
	}
	lib.skill._boss_lqb_zhuanshu={//专属
	trigger:{
	global:"gameStart",
	},
	forced:true,
	popup:false,
	priority:9999,
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	if(!player.getEnemies().contains(game.boss)) return false
	if(player==game.boss) return false;
	if(player.name=="boss_qilin1"||player.name=="boss_xiaohu1") return false
	var moshi=lib.config['extension_'+'山海志异挑战_'+'zhuanshu_moshi']
	if(moshi=="0") return false;
	return true;
	},
	content:function(){
	'step 0'
	player.clearSkills();
	lib.character[player.name][3]=[]
	var pian=lib.config['extension_'+'山海志异挑战_'+'boss_shanhaizhiyipian']
	if(pian=="boss_huhushengwei"&&game.boss.name=='boss_shanhaizhiyi'){
	player.maxHp=6 
	player.hp=6
	}
	else{
	player.maxHp=4
	player.hp=4
	}
	player.update();
	'step 1'
	var skills=[];
	var characters=[];
	for(var i in lib.character){
	if(lib.character[i][4].contains('unseen')) continue;
	if(lib.character[i][4].contains('boss')) continue;
	if(lib.character[i][4].contains('hiddenboss')) continue;
	if(lib.character[i][4].contains('bossallowed')) continue;
	if(lib.character[i][4].contains('minskin')) continue;
	if(lib.config.banned.contains(i)) continue;
	if(lib.config.forbidai.contains(i)) continue;
	characters.push(i);
	}
	for(var i=0;i<characters.length;i++){
	var name=characters[i];
	if(!lib.character[name]) continue;
	var skillsx=lib.character[name][3].slice(0);
	var list=skillsx.slice(0);
	for(var j=0;j<list.length;j++){
	if(list[j].indexOf('rewrite')!=-1||skills.contains(list[j])) continue;
	if(!lib.translate[list[j]]||!lib.translate[list[j]+'_info']) continue;
	var info=get.info(list[j]);
	if(!info||info.zhuSkill||info.charlotte) continue;
	if(game.hasPlayer(function(current){
	return current.hasSkill(list[j])
    })) continue
	skills.push(list[j]);
	lib.card['skillCard_'+list[j]]={
	fullimage:true,
	image:'character:'+name,
	};
	lib.translate['skillCard_'+list[j]]=lib.translate[list[j]];
	lib.translate['skillCard_'+list[j]+'_info']=lib.translate[list[j]+'_info'];
	}
	}
	event.skills=skills;
	'step 2'
	var list=event.skills.randomGets(16);
	for(var i=0;i<list.length;i++){
	list[i]=['','','skillCard_'+list[i]];
	}
	player.chooseButton(['选择要获得的技能',[list,'vcard']],true);
	'step 3'
	for(var i=0;i<result.links.length;i++){
	player.addSkill(result.links[i][2].slice(10));
	if(!player.storage.zhuanshuhz) player.storage.zhuanshuhz=[]
	player.storage.zhuanshuhz.push(result.links[i][2].slice(10));
	}
	},
	}
	lib.skill._boss_lqb_zhuanshuyi={//专属
	trigger:{
	global:"dieEnd",
	},
	forced:true,
	popup:false,
	priority:9999,
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	if(player.name=="boss_qilin1"||player.name=="boss_xiaohu1") return false
	var moshi=lib.config['extension_'+'山海志异挑战_'+'zhuanshu_moshi']
	if(moshi!="1") return false;
	if(player.side==game.boss.side) return false
	return event.player.side!=game.boss.side||event.player==game.boss
	},
	content:function (){
	'step 0'
	var skills=[];
	var characters=[];
	for(var i in lib.character){
	if(lib.character[i][4].contains('unseen')) continue;//隐藏
	if(lib.character[i][4].contains('boss')) continue;//boss
	if(lib.character[i][4].contains('hiddenboss')) continue;//随从
	if(lib.character[i][4].contains('bossallowed')) continue;//boss随从
	if(lib.character[i][4].contains('minskin')) continue;//宠物
	if(lib.config.banned.contains(i)) continue;//禁用
	if(lib.config.forbidai.contains(i)) continue;//禁用
	characters.push(i);
	}
	for(var i=0;i<characters.length;i++){
	var name=characters[i];
	if(!lib.character[name]) continue;
	var skillsx=lib.character[name][3].slice(0);
	var list=skillsx.slice(0);
	for(var j=0;j<list.length;j++){
	if(list[j].indexOf('rewrite')!=-1||skills.contains(list[j])) continue;
	if(!lib.translate[list[j]]||!lib.translate[list[j]+'_info']) continue;
	var info=get.info(list[j]);
	if(!info||info.zhuSkill||info.charlotte) continue;
	if(game.hasPlayer(function(current){
	return current.hasSkill(list[j])
    })) continue
	skills.push(list[j]);
	lib.card['skillCard_'+list[j]]={
	fullimage:true,
	image:'character:'+name,
	};
	lib.translate['skillCard_'+list[j]]=lib.translate[list[j]];
	lib.translate['skillCard_'+list[j]+'_info']=lib.translate[list[j]+'_info'];
	}
	}
	event.skills=skills
	var c=player.getSkills(true,false);
	for(var k=0;k<c.length;k++){
	if(event.skills.contains(c[k])) event.skills.remove(c[k]);
	}
	'step 1'
	var list=event.skills.randomGets(16);
	for(var i=0;i<list.length;i++){
	list[i]=['','','skillCard_'+list[i]];
	}
	player.chooseButton(['选择要获得的技能',[list,'vcard']],true);
	'step 2'
	for(var i=0;i<result.links.length;i++){
	player.addSkill(result.links[i][2].slice(10));
	player.storage.zhuanshuhz.push(result.links[i][2].slice(10));
	}
	'step 3'
	var d=[]
	var a=player.getSkills(true,false).slice(0)
	var b=player.storage.zhuanshuhz
	for(var l=0;l<b.length;l++){
	if(b[l].name==a.name) d.push(b[l]);
	}
	if(d.length>4){
	player.chooseControl(d).set('prompt','请选择一个要失去的技能').set('ai',function (){return 0});
	}
	else event.finish()
	'step 4'
	player.removeSkill(result.control);
	player.storage.zhuanshuhz.remove(result.control);
	},
	}
	lib.skill._boss_lqb_zhuanshuer={//专属
	enable:"phaseUse",
	popup:false,
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	if(player.name=="boss_qilin1"||player.name=="boss_xiaohu1") return false
	var moshi=lib.config['extension_'+'山海志异挑战_'+'zhuanshu_moshi']
	if(moshi!="2") return false;
	if(player.side==game.boss.side) return false
	return player.countMark("boss_zhuguozi")>2
	},
	content:function (){
	'step 0'
	game.countPlayer(function(current2){
	if(current2.countMark("boss_zhuguozi")){
	current2.removeMark("boss_zhuguozi",3)
	}
	});
	var skills=[];
	var characters=[];
	for(var i in lib.character){
	if(lib.character[i][4].contains('unseen')) continue;//隐藏
	if(lib.character[i][4].contains('boss')) continue;//boss
	if(lib.character[i][4].contains('hiddenboss')) continue;//随从
	if(lib.character[i][4].contains('bossallowed')) continue;//boss随从
	if(lib.character[i][4].contains('minskin')) continue;//宠物
	if(lib.config.banned.contains(i)) continue;//禁用
	if(lib.config.forbidai.contains(i)) continue;//禁用
	characters.push(i);
	}
	for(var i=0;i<characters.length;i++){
	var name=characters[i];
	if(!lib.character[name]) continue;
	var skillsx=lib.character[name][3].slice(0);
	var list=skillsx.slice(0);
	for(var j=0;j<list.length;j++){
	if(list[j].indexOf('rewrite')!=-1||skills.contains(list[j])) continue;
	if(!lib.translate[list[j]]||!lib.translate[list[j]+'_info']) continue;
	var info=get.info(list[j]);
	if(!info||info.zhuSkill||info.charlotte) continue;
	if(game.hasPlayer(function(current){
	return current.hasSkill(list[j])
    })) continue
	skills.push(list[j]);
	lib.card['skillCard_'+list[j]]={
	fullimage:true,
	image:'character:'+name,
	};
	lib.translate['skillCard_'+list[j]]=lib.translate[list[j]];
	lib.translate['skillCard_'+list[j]+'_info']=lib.translate[list[j]+'_info'];
	}
	}
	event.skills=skills
	var c=player.getSkills(true,false);
	for(var k=0;k<c.length;k++){
	if(event.skills.contains(c[k])) event.skills.remove(c[k]);
	}
	'step 1'
	var list=event.skills.randomGets(16);
	for(var i=0;i<list.length;i++){
	list[i]=['','','skillCard_'+list[i]];
	}
	player.chooseButton(['选择要获得的技能',[list,'vcard']],true);
	'step 2'
	for(var i=0;i<result.links.length;i++){
	player.addSkill(result.links[i][2].slice(10));
	player.storage.zhuanshuhz.push(result.links[i][2].slice(10));
	}
	'step 3'
	var d=[]
	var a=player.getSkills(true,false).slice(0)
	var b=player.storage.zhuanshuhz
	for(var l=0;l<b.length;l++){
	if(b[l].name==a.name) d.push(b[l]);
	}
	if(d.length>4){
	player.chooseControl(d).set('prompt','请选择一个要失去的技能').set('ai',function (){return 0});
	}
	else event.finish()
	'step 4'
	player.removeSkill(result.control);
	player.storage.zhuanshuhz.remove(result.control);
	},
	}
	lib.skill._boss_qilin2={//上限
	trigger:{
	global:"dieEnd",
	},
	forced:true,
	popup:false,
	priority:99999,
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	if(player.name!="boss_qilin1") return false
	return event.player==game.boss
	},
	content:function (){
	player.gainMaxHp(2)
	},
	}
	lib.skill._boss_lqb_yvguandraw={//狱官出场摸牌
	trigger:{
	global:["boss_yvguan2xEnd","boss_yvguan3xEnd","boss_yvguan4xEnd"],
	},
	forced:true,
	popup:false,
	priority:9999,
	content:function(){
	var d=player.name
	if(d=="boss_heibaiwuchang"||d=="boss_riyeyoushen"||d=="boss_niutoumamian") player.directgain(get.cards(6))
	if(d=="boss_huangfeng"||d=="boss_niaozui"||d=="boss_baowei"||d=="boss_yvsai") player.directgain(get.cards(4))
	if(d=="boss_yanluowanga"||d=="boss_guiwang") player.directgain(get.cards(8))
	},
	}
	lib.skill._boss_alhg_qijia={//奇甲斯复活
	trigger:{
	player:"phaseAfter",
	},
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	return !game.hasPlayer(function(current){
	return current.name=="boss_alhg_qijiasi";
	})
	},
	priority:20,
	forced:true,
	popup:false,
	content:function (){
	var dead=game.dead.slice(0);
	for(var i=0;i<dead.length;i++){
	if(dead[i].parentNode==player.parentNode&&dead[i].name=='boss_alhg_qijiasi'){
	dead[i].revive(Infinity);
	dead[i].draw(4,false);
	dead[i].logSkill('boss_qijia');
	dead[i].gainMaxHp()
	dead[i].hp=2
	dead[i].update();
	}
	}
	},
	}
	lib.skill._boss_xiuzheng={//进入修整
	trigger:{
	global:"dieAfter",
	},
	popup:false,
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	if(player.name!="boss_qilin1"&&player.name!="boss_xiaohu1") return false
	return event.player.name=="boss_zhuquejiangling"||event.player.name=="boss_xuanwujiangling"||event.player.name=="boss_zhuquefaxiang"||
	event.player.name=="boss_xuanwufaxiang"||event.player.name=="boss_zhuquezhenshen"||event.player.name=="boss_xuanwuzhenshen"
	},
	forced:true,
	priority:-20,
	content:function (){
	'step 0'
	if((trigger.player.name=="boss_zhuquezhenshen"&&game.hasPlayer(function(current){
	return current.name=="boss_xuanwuzhenshen"
	}))||(trigger.player.name=="boss_xuanwuzhenshen"&&game.hasPlayer(function(current){
	return current.name=="boss_zhuquezhenshen"
	}))){
	game.addGlobalSkill('boss_hhshengweix');
	}
	'step 1'
	var dead=game.dead.slice(0);
	for(var i=0;i<dead.length;i++){
	if(dead[i].name==trigger.player.name){
	dead[i].revive(Infinity);
	dead[i].maxHp=0
	dead[i].update();
	dead[i].link(false);
	dead[i].classList.add('out');
	}
	}
	},
	}
	lib.skill._boss_xiuzhengyi={//脱离修整
	trigger:{
	player:["phaseAfter","dieBegin"],
	},
	forced:true,
	priority:-12,
	filter:function(event,player){
	if(get.mode()!="boss") return false;
	return player==_status.currentPhase
	},
	content:function (){
	event.count=0
	if(game.hasPlayer(function(current){
	return current.storage.weizhi==4
	})&&player.storage.weizhi==4){
	event.count=1
	} else if(!game.hasPlayer(function(current){
	return current.storage.weizhi==4
	})&&game.hasPlayer(function(current1){
	return current1.storage.weizhi==3
	})&&player.storage.weizhi==3){
	event.count=1
	} else if(!game.hasPlayer(function(current){
	return current.storage.weizhi==4
	})&&!game.hasPlayer(function(current1){
	return current1.storage.weizhi==3
	})&&game.hasPlayer(function(current2){
	return current2.storage.weizhi==2
	})&&player.storage.weizhi==2){
	event.count=1
	} else if(!game.hasPlayer(function(current){
	return current.storage.weizhi==4
	})&&!game.hasPlayer(function(current1){
	return current1.storage.weizhi==3
	})&&!game.hasPlayer(function(current2){
	return current2.storage.weizhi==2
	})&&game.hasPlayer(function(current3){
	return current3.storage.weizhi==1
	})&&player.storage.weizhi==1){
	event.count=1
	}
	for(var x=0;x<game.players.length;x++){
	var playerx=game.players[x];
	if(event.count==1&&playerx.classList.contains('out')&&playerx.hasSkill('boss_xiongqv1')){
	playerx.classList.remove('out');
	playerx.directgain(get.cards(4))
	if(playerx.name=="boss_zhuquejiangling"){
	playerx.name="boss_zhuquefaxiang"
	playerx.node.name.innerHTML='朱<br>雀<br>法<br>相';
	playerx.maxHp=9
	playerx.hp=playerx.maxHp
	playerx.addSkill('boss_lihuo');
	playerx.update();
	}
	else if(playerx.name=="boss_zhuquefaxiang"){
	playerx.name="boss_zhuquezhenshen"
	playerx.node.name.innerHTML='朱<br>雀<br>真<br>身';
	playerx.maxHp=10
	playerx.hp=playerx.maxHp
	playerx.addSkill('boss_fengxinga');
	playerx.addSkill('boss_beiminga');
	playerx.update();
	if(player.name=="boss_xuanwuzhenshen") game.addGlobalSkill('boss_hhshengweix');
	}
	else if(playerx.name=="boss_zhuquezhenshen"){
	playerx.maxHp=10
	playerx.hp=playerx.maxHp
	playerx.update();
	}
	}
	}
	},
	}
	lib.skill._boss_xiuzhenger={//脱离修整
	trigger:{
	player:["phaseAfter","dieBegin"],
	},
	forced:true,
	priority:-12,
	popup:false,
	filter:function(event,player){
	if(get.mode()!="boss") return false;
	return true;
	},
	content:function (){
	if(player==_status.currentPhase&&player.nextSeat.classList.contains('out')&&(player.name=="boss_zhuquejiangling"||player.name=="boss_zhuquefaxiang"||player.name=="boss_zhuquezhenshen")){
	var playerx=player.nextSeat
	playerx.classList.remove('out');
	playerx.directgain(get.cards(4))
	if(playerx.name=="boss_xuanwujiangling"){
	playerx.name="boss_xuanwufaxiang"
	playerx.node.name.innerHTML='玄<br>武<br>法<br>相';
	playerx.maxHp=9
	playerx.hp=playerx.maxHp
	playerx.addSkill('boss_zhenlei');
	playerx.update();
	}
	else if(playerx.name=="boss_xuanwufaxiang"){
	playerx.name="boss_xuanwuzhenshen"
	playerx.node.name.innerHTML='玄<br>武<br>真<br>身';
	playerx.maxHp=10
	playerx.hp=playerx.maxHp
	playerx.addSkill('boss_leilia');
	playerx.addSkill('boss_lingsia');
	playerx.update();
	if(player.name=="boss_zhuquezhenshen") game.addGlobalSkill('boss_hhshengweix');
	}
	else if(playerx.name=="boss_xuanwuzhenshen"){
	playerx.maxHp=10
	playerx.hp=playerx.maxHp
	playerx.update();
	}
	}
	},
	}
	lib.skill._boss_zhuguo={//朱果
	trigger:{
	source:"damageEnd",
	},
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	var moshi=lib.config['extension_'+'山海志异挑战_'+'zhuanshu_moshi']
	if(moshi!="2") return false;
	return player.side!=game.boss.side&&event.player.side==game.boss.side
	},
	forced:true,
	popup:false,
	priority:21,
	content:function (){
	game.countPlayer(function(current2){
	if(current2.side!=game.boss.side){
	current2.addMark("boss_zhuguozi",trigger.num)
	}
	});
	},
	}
	lib.skill._boss_zhuguoyi={//朱果
	trigger:{
	global:"dieBegin",
	},
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	var moshi=lib.config['extension_'+'山海志异挑战_'+'zhuanshu_moshi']
	if(moshi!="2") return false;
	if(player!=event.player) return false
	return event.player.side==game.boss.side
	},
	forced:true,
	popup:false,
	priority:21,
	content:function (){
	game.countPlayer(function(current2){
	if(current2.side!=game.boss.side){
	current2.addMark("boss_zhuguozi",5)
	}
	});
	},
	}
	lib.skill._boss_teshubai={//败北
	trigger:{global:'die'},
	forced:true,
	priority:-20,
	globalFixed:true,
	popup:false,
	filter:function(event,player){
	if(lib.config.mode!='boss') return false
	if(player.side==game.boss.side) return false
	return event.player.name=="boss_qilin1"||event.player.name=="boss_xiaohu1"
	},
	content:function (){
	var bool=true;
	if(player==game.me) bool=false;
	else switch(get.mode()){
	case 'identity':{
	game.showIdentity();
	var id1=player.identity;
	var id2=game.me.identity;
	if(['zhu','zhong','mingzhong'].contains(id1)){
	if(['zhu','zhong','mingzhong'].contains(id2)) bool=false;
	break;
	}
	else if(id1=='fan'){
	if(id2=='fan') bool=false;
	break;
	}
	break;
	}
	case 'guozhan':{
	if(game.me.isFriendOf(player)) bool=false;
	break;
	}
	case 'versus':{
	if(player.side==game.me.side) bool=false;
	break;
	}
	case 'boss':{
	if(player.side==game.me.side) bool=false;
	break;
	}
	default:{}
	}
	game.over(bool);
	},
	}
	lib.skill._boss_teshubaiyi={//败北
	trigger:{global:'die'},
	forced:true,
	priority:-20,
	globalFixed:true,
	popup:false,
	filter:function(event,player){
	if(lib.config.mode!='boss') return false
	if(player.name!="boss_xiaohu1"&&player.name!="boss_qilin1") return false
	return !game.hasPlayer(function(current){
	return current!=player&&player.getFriends().contains(current)
	})
	},
	content:function (){
	var bool=true;
	if(player==game.me) bool=false;
	else switch(get.mode()){
	case 'identity':{
	game.showIdentity();
	var id1=player.identity;
	var id2=game.me.identity;
	if(['zhu','zhong','mingzhong'].contains(id1)){
	if(['zhu','zhong','mingzhong'].contains(id2)) bool=false;
	break;
	}
	else if(id1=='fan'){
	if(id2=='fan') bool=false;
	break;
	}
	break;
	}
	case 'guozhan':{
	if(game.me.isFriendOf(player)) bool=false;
	break;
	}
	case 'versus':{
	if(player.side==game.me.side) bool=false;
	break;
	}
	case 'boss':{
	if(player.side==game.me.side) bool=false;
	break;
	}
	default:{}
	}
	game.over(bool);
	},
	}
	lib.skill._boss_shanhaidraw={//摸牌
	trigger:{
	global:"damageBegin",
	},
	filter:function (event,player){
	if(get.mode()!="boss") return false;
	if(event.player.side!=game.boss.side) return false
	if(event.player==player) return false
	return player.name=="boss_zhuquejiangling"||player.name=="boss_xuanwujiangling"||player.name=="boss_zhuquefaxiang"||
	player.name=="boss_xuanwufaxiang"||player.name=="boss_zhuquezhenshen"||player.name=="boss_xuanwuzhenshen"
	},
	forced:true,
	popup:false,
	priority:21,
	content:function (){
	player.draw()
	},
	}
	
	
	// --------------------------------------武将------------------------------------------//
	},
	// --------------------------------------武将------------------------------------------//

	precontent:function (){
	var bossArt={
	boss_baiwuchang1:'image/mode/boss/character/boss_baiwuchang.jpg',
	boss_caocao_hun:'image/mode/boss/character/boss_caocao.jpg',
	boss_chi1:'image/mode/boss/character/boss_chi.jpg',
	boss_heiwuchang1:'image/mode/boss/character/boss_heiwuchang.jpg',
	boss_hundun1:'image/mode/boss/character/boss_hundun.jpg',
	boss_liang1:'image/mode/boss/character/boss_liang.jpg',
	boss_luocha1:'image/mode/boss/character/boss_luocha.jpg',
	boss_mamian1:'image/mode/boss/character/boss_mamian.jpg',
	boss_mei1:'image/mode/boss/character/boss_mo.jpg',
	boss_mengpoa:'image/mode/boss/character/boss_mengpo.jpg',
	boss_niutou1:'image/mode/boss/character/boss_niutou.jpg',
	boss_qiongqi1:'image/mode/boss/character/boss_qiongqi.jpg',
	boss_taotie1:'image/mode/boss/character/boss_taotie.jpg',
	boss_taowu1:'image/mode/boss/character/boss_taowu.jpg',
	boss_wang1:'image/mode/boss/character/boss_wang.jpg',
	boss_yecha1:'image/mode/boss/character/boss_yecha.jpg',
	boss_zhuyin1:'image/mode/boss/character/boss_zhuyin.jpg',
	boss_xvzhu_hun:'image/character/re_xuzhu.jpg',
	};
	for(var i in qinyin.character){
	if(bossArt[i]){
	qinyin.character[i][4].push('img:'+bossArt[i]);
	}
	else if(lib.device||lib.node){
	qinyin.character[i][4].push('ext:山海志异挑战/'+i+'.jpg');
	}
	else{
	qinyin.character[i][4].push('db:extension-山海志异挑战:'+i+'.jpg');
	}
	}
	// ---------------------------------------卡牌栏------------------------------------------//	
	/*game.import('card',function(){
	var qinyin_equip={
	name:'qinyin_equip',
	connect:true,
	// ---------------------------------------卡牌代码------------------------------------------//	
	card:{
	
	
	},//卡牌
	// ---------------------------------------卡牌技能------------------------------------------//	
	skill:{
	
	},
	// ---------------------------------------卡牌翻译------------------------------------------//	
	translate:{
	
	},//翻译
	// ---------------------------------------牌堆设置------------------------------------------//	
	list:[
	]	
	};
	return qinyin_equip;
	});
	lib.translate['qinyin_equip_card_config']='山海志异挑战';
	lib.config.all.cards.push('qinyin_equip');
	if(!lib.config.cards.contains('qinyin_equip')) lib.config.cards.remove('qinyin_equip'); */
	},
	help:{
	},
	config:{
	"zhuanshu_moshi":{
	"name":"山海模式挑战",
	"intro":"游戏开始时，清空挑战方所有技能，每人从16个系统随机给出的技能中选择1项技能获得。模式①：当boss或队友阵亡时，挑战方每人从16个系统随机给出的技能中选择1项技能获得；模式②，游戏内挑战方对敌方角色造成伤害后可获得1枚“朱果”，boss死亡，挑战方可获得5枚“朱果”，“朱果”为友方共用，出牌阶段，你可以移去三枚“朱果”，从16个系统随机给出的技能中选择1项技能获得。你因此模式而获得的技能大于4个时，你选择一项技能失去。",
	"init":'1',
	"item":{
	"0":'关闭',
	"1":'模式①',
	"2":'模式②',
	},
	},
	"shouqi_ka":{
	"name":"启用手气卡",
	"init":false,
	"intro":"游戏内添加手气卡。"
	},
	"boss_jianyuantiaozhan":{
	"name":'减员挑战',
	"intro":'可改为双人挑战或单人挑战。',
	"init":"1",
	"item":{
	"1":'三人挑战',
	"2":'双人挑战',
	"3":'单人挑战',
	},
	},
	"boss_shanhaizhiyipian":{
	"name":'山海志异',
	"intro":'可更改挑战模式中山海志异的关卡，其他详情请查看挑战模式中的山海志异。',
	"init":'boss_huhushengwei',
	"item":{
	"boss_jianghunjuexing":'将魂觉醒',
	"boss_qvzhunianshou":'驱逐年兽',
	"boss_qvguibixie":'驱鬼辟邪',
	"boss_ruilinjiangshi":'瑞麟降世',
	"boss_huhushengwei":'虎虎生威',
	},
	},
	},
	package:{
	character: qinyin,
	card:{
	card:{
	},
	translate:{
	},
	list:[],
	},
	skill:{
	skill:{
	},
	translate:{
	},
	},
	intro:"<font color=#FF00FF>长按下列功能可查看功能详情</font>",
	author:"浪琴婊",
	diskURL:"",
	forumURL:"",
	version:"1.108",
	},files:{"character":[],"card":[],"skill":[]}}})