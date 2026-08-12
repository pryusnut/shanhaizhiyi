# 更新日志

本扩展所有重要变更记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

本扩展在原作者「浪琴婊」v1.108 基础上进行现代化适配，兼容新版无名杀引擎。

## [1.20] - 2026-08-13

### 修复

- **修复索穴（boss_suoxue）技能报错与卡死**：旧语音播放 API `game.playMY` 在现代无名杀中已删除，技能内两处调用导致 `TypeError: game.playMY is not a function` 并使游戏卡死；替换为现代 API `game.playSkillAudio('new_jiangchi')`。
- **修复断厄（boss_duane）技能报错与卡死**：`get.color(card, 'black')` 将颜色字符串误传为第二参数（应为 `player`），进入 `checkMod` 后因最后参数非 Player 抛出 `skills.forEach is not a function`；改为单参数 `get.color(card)`。
- **修复灵（boss_ling）灭吴（boss_miewua）不发动**：现代无名杀将内置「不屈」重做，"创"的存储由 `player.storage.buqu` 改为武将牌上的 expansion（`addToExpansion` + `gaintag:"buqu"`，读取用 `getExpansions("buqu")`）；灭吴仍读取旧 `storage.buqu` 导致 filter 恒假、技能永不发动。已改为 `getExpansions("buqu")` 读取，弃"创"改用 `loseToDiscardpile`，移除 `syncStorage/unmarkSkill/updateMarks` 旧存储操作。
- **修复浪琴婊（boss_langqinbiao）喵呜（boss_miaowu）无法猜中类型**：step 机制下每一步结束后子事件结果会写入 `_result`，喵呜 step 1 的 `player.gain(card,'draw2')` 覆盖了 `_result`，step 2 读取 `result.control` 时已为 `undefined`，判定恒失败导致必然死亡。修复：step 1 开头将选择保存为 `event.choice`，step 2 改用 `event.choice` 判定。
- **修复浪琴婊（boss_langqinbiao）嘤嘤（boss_yingying）单牌时技能报错**：当置牌堆底仅一张牌时，step 2 的 `while(cards.length)` 在 `cards` 未初始化的情况下执行导致 ReferenceError；修复为 `var cards=result.links||[];` 初始化。
- **修复浪琴婊（boss_langqinbiao）嘤嘤（boss_yingying）单张牌置底失效**：嘤嘤一次处理一张牌时（最常见场景），step 2 读取 `result.links` 取到的是 step 0 的结果——非浪琴婊回合为 `chooseToDiscard` 结果（`links` 为空数组）、浪琴婊回合为 `chooseControl` 结果（无 `links` 键）——均无实际选择值，导致牌从未置入牌堆底、记忆栈从未入栈，连带喵呜 AI 因栈空而随机猜测（人机"猜错类型"）。修复：step 2 改为 `var cards=(result.links&&result.links.length)?result.links:(event.cards||[]);`——单张牌时回退使用 step 1 已筛选的 `event.cards` 置底入栈，多张牌仍按玩家选择顺序。
- **修复浪琴婊（boss_langqinbiao）AI 开卷问题**：原喵呜 AI 直接读取牌堆底第一张牌的真实类型再"猜中"，配合嘤嘤置底，AI 必中且无限复活，玩家无解。新增"记忆栈"机制（`player.storage.boss_miaowu_stack`，栈深上限 160、满时 FIFO 淘汰），AI 只能按记忆猜测：
  - 入栈：嘤嘤成功置牌堆底时按放置顺序记录牌名（栈顶即当前最底牌）；
  - 出栈：阿巴翻底、喵呜取底后各出栈一条；新增全局监听技能 `boss_langqinbiao_draw`（`trigger:{global:["draw","washCard"]}`）——任何角色从牌堆底摸牌（draw 事件 `bottom` 标记）时按摸牌张数出栈，洗牌（washCard 时机）时清空栈；
  - 随机分支：栈空时喵呜 AI 在 `['basic','trick','equip']` 中等概率随机猜测（忽略"其他"）；
  - 防御：出栈前判空，栈空不报错。
  - 玩家破局路径：压牌断供（栈趋空后 AI 随机）或主动摸空牌堆触发洗牌清栈。
- **修复朱雀/玄武复活后名称横排**：复活分支原硬编码 `'朱<br>雀<br>法<br>相'` 手动换行，而现代引擎名称节点为 CSS 竖排（writing-mode），`<br>` 在竖排模式下转为横向换行，导致"法相/真身"名称从右往左横排；改为纯文本 `'朱雀法相'` 等（竖排由引擎 CSS 自动处理，与出场时一致）。
- **修复朱雀/玄武复活后死亡音效/立绘资源报错**：复活时原代码将 `playerx.name` 改为 `boss_zhuquefaxiang` 等**未定义的角色名**（`lib.character` 中无这些角色），引擎解析死亡音效时抛 `ReferenceError: Cannot find ... when parsing die audio`，并产生 `image/character/boss_zhuquefaxiang.jpg`、`audio/die/boss_zhuquefaxiang.mp3` 等 404。修复：复活不再改名（角色名保持 `boss_zhuquejiangling`/`boss_xuanwujiangling`），改用 `player.storage.zhuque_fuhuo`/`xuanwu_fuhuo` 复活计数区分阶段（1=法相、2=真身、≥3 保持），显示名与插画仍照常切换；"进入修整"的双真身联动判断同步改为计数比较。注：`extension/山海志异/boss_zhuquejiangling.mp3` 404 为扩展无死亡音效文件的既有问题（引擎自动注册 die 标记），不影响游戏运行。

### 新增

- **浪琴婊新增调试技能"记牌"（boss_yingying_check）**：出牌阶段点击"记牌"按钮，弹出对话框显示当前记忆栈顶牌名（含翻译与牌名 ID）及栈内记录数（`n/160`），点确定或取消退出。用于调试验证记忆栈与牌堆底的对应关系。
- **扩展菜单新增关卡显示开关**：在"启用手气卡"下方按分组显示（分组标题居中显示，参考将灵扩展"玩家设置"样式；开关行样式与"启用手气卡"一致，长按显示"在挑战模式列表中显示该关卡"）：
  - "山海志异"组：驱鬼辟邪、荡邪庆新、将魂觉醒、虎虎生威、瑞麟降世；
  - "作者原创"组：奥利哈刚、浪琴婊、十常侍张让、永远的神、灵；
  - "其他关卡"组：地狱判官、青青子衿。
  - 关闭某开关后，content 启动时从该角色定义标记中移除 `boss`（`isBoss` 不再成立），挑战模式 boss 列表（遍历 `lib.character` 中 `isBoss` 角色）即不再显示该关卡；默认全部开启。
  - 修复开关不生效问题：扩展配置在 `lib.config` 中的存储键名带 `extension_山海志异_` 前缀（引擎 loadExtension 处理），content 内直接读 `lib.config[配置键]` 恒为 `undefined` 导致永不隐藏；改为读取 content 函数的 `config` 参数（引擎已剥前缀后传入），与引擎官方机制一致。
- **虎虎生威小虎升级改名**：小虎（boss_xiaohu1）发动威虎（boss_weihu）升级（插画由 `boss_xiaohu1.jpg` 切换为 `boss_xiaohu2.jpg`）时，名称同步由"小虎"改为"大虎"（直接更新名称节点并保持竖排格式，不修改翻译表以免影响后续对局）。
- **虎虎生威朱雀/玄武复活换插画**：朱雀降灵（boss_zhuquejiangling）出生时使用 `boss_zhuque_1.jpg`，复活依次切换为 `boss_zhuque_2.jpg`（法相）、`boss_zhuque_3.jpg`（真身，此后保持）；玄武降灵（boss_xuanwujiangling）同理依次使用 `boss_xuanwu_1/2/3.jpg`。插画在复活分支（法相/真身切换）与出生处（init/addFellow 后）直接设置，与既有小虎升级换图写法一致。
- **朱雀/玄武默认插画改用 3 号图**：`boss_zhuquejiangling` / `boss_xuanwujiangling` 角色定义显式添加 `img:` 标记指向 `boss_zhuque_3.jpg` / `boss_xuanwu_3.jpg`（原 jiangling 图即将废弃），避免引擎自动注册默认 ext 路径。

### 重构

- **山海志异关卡拆分重构**（参考官方捉鬼驱邪关卡设计）。
  - 原方案为单个 `boss_shanhaizhiyi` 关卡壳 + 配置项切换 5 种流程；现拆分为 5 个独立 boss 关卡（`boss_shzy_<关卡拼音>`），直接在挑战模式 boss 列表中展示，删除"山海关卡切换"配置项：
    - a) 每个关卡一个主 boss 壳（hp 0），技能 = 开场技能（gameStart 时 init 第一阶段角色，参考官方 `boss_bianshen` 写法）+ "第一关/第二关/第三关"展示技能（nobracket，翻译静态化），虎虎生威仅第一关；
    - b) 阶段切换沿用 `boss_shanhai2x/3x`（阶段角色身上的 `dieBegin` 隐藏 + global `dieAfter` 链），目标选择由 `pian` 配置判断改为读取 `game.shzy_guanka`（开场技能写入的关卡标记），解决荡邪/驱鬼共用阶段角色的目标歧义；
    - c) 翻译/称号全部静态化到包 translate 与 characterTitle，删除 content 中按 `pian` 的动态覆盖块；
    - d) 5 个关卡使用独立封面（`resources/image/cover/` 下 4 张新封面，瑞麟降世复用 `boss_qilin1.jpg`），删除原 `boss_shanhaizhiyi` 封面。
- **素材存放结构整理**：美术素材统一移入扩展内 `resources/image/character/` 子目录，寻址统一改为 `ext:` 前缀；地狱判官封面 `boss_diyvpanguan` 改为直接复用 `boss_yanluowanga` 素材并删除重复文件。
- **变更记录迁移**：新增本 CHANGELOG，重要修改说明从 extension.js 文件头注释迁移至此。

### 优化

- 优化了大量素材表现

## [1.113] - 2026-08-08

### 新增

- 添加更新地址：`info.json` 与 `package` 的 `diskURL` 指向 GitHub Releases 页面。
- 版本号 1.11 → 1.113（含菜单 author 栏中的版本显示同步）。
- 新增武将包菜单名称翻译：武将包 translate 中新增 `山海志异` 键，用于武将包菜单显示。

### 优化
- 关卡名称调整："驱逐年兽"关卡更名为"荡邪庆新"（含标识符 `dangxieqingxin`）。
- 优化了素材表现

## [1.11] - 现代化适配版（首个发布版本）

### 修复

- **`lib.boss` 兜底初始化**：修复非挑战模式启动时报 `Cannot set properties of undefined` 的问题。
  - 原扩展的 boss 定义（`lib.boss.boss_xxx = {...}`）位于 `if(get.mode()=='boss')` 分支之外、content 顶层无条件执行，而 `lib.boss` 表仅由挑战模式在 `loadMode()` 时经 `mixinLibrary` 创建；因此在身份等非挑战模式启动时访问 `lib.boss` 会抛出该异常。
  - 修复：content 顶层新增
    ```js
    lib.boss = lib.boss || {};
    lib.boss.global = lib.boss.global || {loopType:1, chongzheng:6};
    ```
    任意模式下先确保 `lib.boss` 存在（挑战模式下保留原表内容）。
- **武将包改由 `package.character` 加载**：修复 64 个武将从未加载的问题。
  - 原 precontent 以 `if(qinyin.enable)` 门控 + `game.import('character')` 导入武将包，但扩展配置中不存在 `qinyin` 键，门控恒为假，64 个武将从未注册；且新版引擎 `loadCharacter` 仅合并 `lib.config.characters` 中的武将包。
  - 修复：将武将包整体置于 `package.character`，由游戏本体加载扩展时自动注册武将包、合并角色/技能/翻译、补充图片路径并处理 `forbidai`；precontent 仅保留原画路径写入逻辑。
- **修复关卡翻译覆盖失效**：消除 duplicated translate 警告。
  - content 在 package 合并前执行，此时 `lib.translate` 尚无包翻译，`get.translation` 找不到翻译时返回原样键，导致关卡覆盖写入 `boss_shanhaizhiyiE` 之类的字面量，且 `loadCharacter` 合并时因键已存在而跳过，翻译永久停留在字面量。
  - 修复：
    - a) content 中 14 处关卡翻译覆盖改为直接引用包翻译对象 `qinyin.translate['boss_xxx']`（不再依赖加载顺序）；
    - b) 被关卡覆盖的 6 个翻译键（`boss_shanhaizhiyi` / `boss_shanhai_info` / `boss_shanhaif_info` / `boss_shanhaif1_info` / `boss_shanhaif` / `boss_shanhaif1`）从包翻译表移除，改由 content 无条件设置默认值后再按关卡覆盖，避免 `loadCharacter` 合并时重复冲突。

### 重构

- **移除失效代码**：
  - content 末尾依赖 `lib.characterPack['qinyin']` 的 config.qinyin 死代码块（`forbidai` 标记已由引擎自动处理）；
  - precontent 中失效的 `lib.config.all.characters.push('qinyin')`、`lib.config.characters.remove('qinyin')` 旧式注册语句。
- **扩展更名**：扩展名由「浪吟(挑战)」更改为「山海志异」（原「山海志异挑战」6 字名称对菜单支持较差，改为 4 字），同步更新配置键、图片路径与菜单翻译。

### 新增

- 菜单呈现调整：author 栏显示作者/原作者/版本三行信息；扩展介绍顶部添加开源声明；配置项更名（山海模式挑战→朱果发放方式、减员挑战→我方登场人数、山海志异→山海关卡切换，后已随关卡拆分删除）；"启用手气卡"默认开启；新增"扩展说明"点击展开交互项。
- 开源配套：添加 GPL-3.0 LICENSE 与 README（功能简介、安装方法、素材版权声明）。

### 优化

- **部分角色美术改用无名杀内置素材**（避免重复打包素材，缺失时显示空白立绘，不影响功能）：

| 角色 ID | 素材路径 |
| --- | --- |
| boss_baiwuchang1 | image/mode/boss/character/boss_baiwuchang.jpg |
| boss_caocao_hun | image/character/re_caocao.jpg |
| boss_chi1 | image/mode/boss/character/boss_chi.jpg |
| boss_diaochan_hun | image/character/re_diaochan.jpg |
| boss_ganning_hun | image/character/re_ganning.jpg |
| boss_guanyv_hun | image/character/re_guanyu.jpg |
| boss_heiwuchang1 | image/mode/boss/character/boss_heiwuchang.jpg |
| boss_hundun1 | image/mode/boss/character/boss_hundun.jpg |
| boss_liang1 | image/mode/boss/character/boss_liang.jpg |
| boss_liubei_hun | image/character/re_liubei.jpg |
| boss_luocha1 | image/mode/boss/character/boss_luocha.jpg |
| boss_lvbu_hun | image/character/shen_lvbu.jpg |
| boss_mamian1 | image/mode/boss/character/boss_mamian.jpg |
| boss_mei1 | image/mode/boss/character/boss_mo.jpg |
| boss_mengpoa | image/mode/boss/character/boss_mengpo.jpg |
| boss_niutou1 | image/mode/boss/character/boss_niutou.jpg |
| boss_qiongqi1 | image/mode/boss/character/boss_qiongqi.jpg |
| boss_simayi_hun | image/character/re_simayi.jpg |
| boss_sunquan_hun | image/character/re_sunquan.jpg |
| boss_taotie1 | image/mode/boss/character/boss_taotie.jpg |
| boss_taowu1 | image/mode/boss/character/boss_taowu.jpg |
| boss_wang1 | image/mode/boss/character/boss_wang.jpg |
| boss_yecha1 | image/mode/boss/character/boss_yecha.jpg |
| boss_zhugeliang_hun | image/character/re_zhugeliang.jpg |
| boss_zhuyin1 | image/mode/boss/character/boss_zhuyin.jpg |
| boss_zhouyv_hun | image/character/re_zhouyu.jpg |
| boss_xvzhu_hun | image/character/re_xuzhu.jpg |


## 格式约定

- 每次发版时在顶部新增版本小节，并在 git 中打 tag（如 `git tag v1.113`）。
- 更细粒度的变更请查阅 git 提交记录。
