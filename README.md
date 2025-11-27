# cybercafe-git
赛博食堂cybercafe前端底层架构，基于uni-app开发，应用于android+sqlite

| 社交渠道 | 链接及说明 |
| ------- | ----------- |
| 小红书   | [不知名剧作家](https://www.xiaohongshu.com/user/profile/609a8cf700000000010004c3)（目前内测0.6版本的操作说明在小红书上） |
| B站     | 搭建中，稍后公布 |
| QQ群    | 42094098（已满）（目前内测的0.6版APK和PC模拟器在群文件夹里） |
| Discord | [https://discord.gg/gSHRgfFP](https://discord.gg/gSHRgfFP) （内测0.6版APK也打了分包提交在社区了） |
| 贴吧    | [赛博食堂](https://tieba.baidu.com/f?kw=赛博食堂) (刚建) |


| 支持平台 |
| ------- |
| 安卓手机 |
| PC（模拟器运行）|

因为改版的改动比较大，目前就我一个人策划开发测试，进度有点慢，欢迎大家关注、参与贡献代码，或者捉虫，或者点菜。

本项目基准为1.0版。

## 安装和运行

### 前置要求
- HBuilderX（推荐用于uni-app开发，下载地址：[https://www.dcloud.io/hbuilderx.html](https://www.dcloud.io/hbuilderx.html)）。HBuilderX会自动安装所需的Node.js和其他依赖。
- 本地安卓测试需要手机模拟器，如雷电模拟器或MuMu模拟器。

### 步骤
1. 克隆仓库：
   ```bash
   git clone https://github.com/marywisher/cybercafe-1.0.git
   cd cybercafe-git
   ```

2. 在HBuilderX中打开项目：
   - 启动HBuilderX，选择“文件” > “打开目录”，选择项目文件夹。

3. 配置修改：
   - 运行前，请根据你的环境修改配置文件（如`config.json`、`manifest.json`中的API地址等）。具体配置请参考项目内的注释或文档。
   - 后端内容需要自备，不包含在本开源项目中。请确保后端服务已配置并运行。

4. 运行项目：
   - 在HBuilderX中，选择“运行” > “运行到手机或模拟器”进行安卓测试（需连接手机或启动模拟器）。
   - 本项目关于H5部分的代码已去除，若想兼容H5，请自行修改添加。

5. 打包：
   - 使用HBuilderX的“发行”功能，选择“原生App-云打包”生成APK。

## 项目结构详解

```
App.vue                 # 主应用入口
config.json             # uni-app配置文件
index.html              # HTML入口
LICENSE.txt             # 许可证文件
main.js                 # 主入口脚本
manifest.json           # 应用清单
package.json            # 项目依赖和脚本
pages.json              # 页面路由配置
README.md               # 项目说明文档
theme.json              # 主题配置
uni.promisify.adaptor.js # uni-app Promise适配器
uni.scss                # 全局样式
_doc/                   # 文档相关
components/             # 自定义组件
  cybercafe-button/     # 按钮组件
  cybercafe-card/       # 卡片组件
  cybercafe-context-menu/ # 上下文菜单组件
  cybercafe-dialogueModal/ # 对话框模态框组件
  cybercafe-draggableList/ # 可拖拽列表组件
  cybercafe-header/     # 头部组件
  cybercafe-menu/       # 菜单组件
  cybercafe-modal/      # 模态框组件
  cybercafe-segmented-control/ # 分段控制组件
  cybercafe-swiper-dot/ # 轮播图指示点组件
  cybercafe-view/       # 视图组件
  image-part/           # 图片部分组件
    water-mark/         # 水印组件
func/                   # 功能模块
  common/               # 公共工具函数
    base64.min.js       # Base64工具
    common.js           # 通用函数
    handleFun.js        # 处理函数
    request.js          # 请求工具
    sqlite.js           # SQLite工具
  dbManager/            # 数据库管理
    baseQuery.js        # 基础查询
    dialogueQuery.js    # 对话查询
  entity/               # 实体类
    characterFun.js     # 角色功能
    entityFun.js        # 实体功能
    messageFun.js       # 消息功能
    promptFun.js        # 提示功能
    responseFun.js      # 响应功能
  incubator/            # 孵化器类
    incubatorFun.js     # 孵化器功能
  setting/              # 设置类
    aiFun.js            # AI功能
    bubbleFun.js        # 气泡功能
  user/                 # 用户类
    userFun.js          # 用户功能
modules/                # 模块化组件
  account/              # 账户相关
    adPart.vue          # 广告部分
    checkinPart.vue     # 签到部分
    followPart.vue      # 关注部分
    globalSettingHeader.vue # 全局设置头部
    messageHeader.vue   # 消息头部
    userinfo.vue        # 用户信息
  character/            # 角色相关
    characterHeader.vue # 角色头部
    descriptionPart.vue # 描述部分
    previewDescriptionPart.vue # 预览描述部分
    previewEntityPart.vue # 预览实体部分
    previewHeader.vue   # 预览头部
  chat/                 # 聊天功能
    characterPart.vue   # 角色部分
    chatBg.vue          # 聊天背景
    chatBottom.vue      # 聊天底部
    chatHeader.vue      # 聊天头部
    chatInput.vue       # 聊天输入
    editPart.vue        # 编辑部分
    listMenu.vue        # 列表菜单
    listPart.vue        # 列表部分
    newUserPart.vue     # 新用户部分
    popMenu.vue         # 弹出菜单
    titlePart.vue       # 标题部分
  entity/               # 实体相关
    characterList.vue   # 角色列表
    characterPart.vue   # 角色部分
    detailPart.vue      # 详情部分
    entityHeader.vue    # 实体头部
    entityListHeader.vue # 实体列表头部
  login/                # 登录注册
    login.vue           # 登录
    register.vue        # 注册
  setting/              # 设置页面
    decorate/           # 装饰设置
    quickMenu/          # 快捷菜单
    settingPage/        # 设置页面
pages/                  # 页面文件
  character/            # 角色页面
    characterList.vue   # 角色列表
    index.vue           # 角色首页
    preview.vue         # 角色预览
  chat/                 # 聊天页面
    incubator.vue       # 孵化器
    index.vue           # 聊天首页
  entity/               # 实体页面
    entityList.vue      # 实体列表
    index.vue           # 实体首页
  index/                # 首页
    dataList.vue        # 数据列表
    index.vue           # 首页
    info.vue            # 信息页面
    message.vue         # 消息页面
  login/                # 登录页面
    login.vue           # 登录
  setting/              # 设置页面
    aiSetting.vue       # AI设置
    bubbleMarket.vue    # 气泡市场
    decorateSetting.vue # 装饰设置
    globalSetting.vue   # 全局设置
    promptSetting.vue   # 提示设置
    rewardDetail.vue    # 奖励详情
static/                 # 静态资源
  iconfont/             # 字体图标
store/                  # Vuex状态管理
  index.js              # 主store
  modules/              # 子模块
uni_modules/            # uni-app模块
  okingtz-cropper/     # 图片裁剪模块
unpackage/              # 打包输出
```

- **components/**: 存放可复用的Vue组件，如按钮、卡片、模态框等。
- **func/**: 核心业务逻辑，包括公共工具、数据库管理、实体类、用户管理等。
- **modules/**: 模块化组件，按功能划分，如账户、角色、聊天、登录、设置等。
- **pages/**: uni-app的页面文件，每个子文件夹对应一个功能模块。
- **store/**: 使用Vuex管理全局状态，便于组件间数据共享。

## 贡献指南

欢迎任何形式的贡献！请遵循以下步骤：

1. Fork 本仓库。
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)。
4. 推送到分支 (`git push origin feature/AmazingFeature`)。
5. 打开一个 Pull Request。

### 代码规范
- 使用ES6+语法。
- 组件命名使用kebab-case（如`cybercafe-button`）。
- 提交前运行 `npm run lint` 检查代码质量（如果有配置）。
- 添加单元测试（如果适用）。

### 报告问题
- 使用GitHub Issues报告bug或建议新功能。
- 提供详细的复现步骤和环境信息。

## 许可证
本项目采用 [MIT License](LICENSE.txt) 开源协议。

## 联系我们
- QQ: 63846152（不知名剧作家）
- Discord: [https://discord.gg/gSHRgfFP](https://discord.gg/gSHRgfFP)
- 小红书: [不知名剧作家](https://www.xiaohongshu.com/user/profile/609a8cf700000000010004c3)
- 贴吧: [赛博食堂](https://tieba.baidu.com/f?kw=赛博食堂)