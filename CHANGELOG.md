# 更新日志

本扩展所有重要变更记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

本扩展在原作者「浪琴婊」v1.108 基础上进行现代化适配，兼容新版无名杀引擎。

## [1.11] - 现代化适配版

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

- **山海志异关卡拆分重构**（参考官方捉鬼驱邪关卡设计）。
  - 原方案为单个 `boss_shanhaizhiyi` 关卡壳 + 配置项切换 5 种流程；现拆分为 5 个独立 boss 关卡（`boss_shzy_<关卡拼音>`），直接在挑战模式 boss 列表中展示，删除"山海关卡切换"配置项：
    - a) 每个关卡一个主 boss 壳（hp 0），技能 = 开场技能（gameStart 时 init 第一阶段角色，参考官方 `boss_bianshen` 写法）+ "第一关/第二关/第三关"展示技能（nobracket，翻译静态化），虎虎生威仅第一关；
    - b) 阶段切换沿用 `boss_shanhai2x/3x`（阶段角色身上的 `dieBegin` 隐藏 + global `dieAfter` 链），目标选择由 `pian` 配置判断改为读取 `game.shzy_guanka`（开场技能写入的关卡标记）；
    - c) 翻译/称号全部静态化到包 translate 与 characterTitle，删除 content 中按 `pian` 的动态覆盖块；
    - d) 5 个关卡使用独立封面（`resources/image/cover/` 下 4 张新封面，瑞麟降世复用 `boss_qilin1.jpg`），删除原 `boss_shanhaizhiyi` 封面。
- **移除失效代码**：
  - content 末尾依赖 `lib.characterPack['qinyin']` 的 config.qinyin 死代码块（`forbidai` 标记已由引擎自动处理）；
  - precontent 中失效的 `lib.config.all.characters.push('qinyin')`、`lib.config.characters.remove('qinyin')` 旧式注册语句。

### 新增

- 新增武将包菜单名称翻译：武将包 translate 中新增 `山海志异` 键，用于武将包菜单显示。

### 优化

- **部分角色美术改用无名杀内置素材**（避免重复打包素材，缺失时显示空白立绘，不影响功能）：

| 角色 ID | 素材路径 |
| --- | --- |
| boss_baiwuchang1 | image/mode/boss/character/boss_baiwuchang.jpg |
| boss_caocao_hun | image/character/re_caocao.jpg |
| boss_chi1 | image/mode/boss/character/boss_chi.jpg |
| boss_diyvpanguan | extension/山海志异/resources/image/character/boss_yanluowanga.jpg |
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

- 每次发版时在顶部新增版本小节，并在 git 中打 tag（如 `git tag v1.12`）
- 更细粒度的变更请查阅 git 提交记录
