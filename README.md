# cybercafe-git
赛博食堂cybercafe前端底层架构，基于uni-app开发，应用于android+sqlite

| 社交渠道 | 链接及说明 |
| ------- | ----------- |
| 小红书   | [不知名剧作家](https://www.xiaohongshu.com/user/profile/609a8cf700000000010004c3)（目前内测0.6版本的操作说明在小红书上） |
| B站     | 搭建中，稍后公布 |
| QQ群    | 42094098（已满）（目前内测的0.6版APK和PC模拟器在群文件夹里） |
| Discord | [https://discord.gg/mqqfd4JM](https://discord.gg/mqqfd4JM) （内测0.6版APK也打了分包提交在社区了） |
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
main.js                 # 主入口脚本
manifest.json           # 应用清单
package.json            # 项目依赖和脚本
pages.json              # 页面路由配置
theme.json              # 主题配置
uni.scss                # 全局样式
_doc/                   # 文档相关
  local_db.db           # 本地数据库文件
components/             # 自定义组件
  cybercafe-button/     # 按钮组件
  ...                   # 其他组件
func/                   # 功能模块
  common/               # 公共工具函数
  dbManager/            # 数据库管理
  entity/               # 容器类
  incubator/            # 角色类
  setting/              # 设置类
  user/                 # 用户类
modules/                # 模块化组件
  character/            # 角色相关
  chat/                 # 聊天功能
  login/                # 登录注册
  setting/              # 设置页面
pages/                  # 页面文件
  chat/                 # 聊天页面
  index/                # 首页
  login/                # 登录页面
  setting/              # 设置页面
static/                 # 静态资源
  logo.png              # 应用图标
  iconfont/             # 字体图标
store/                  # Vuex状态管理
  index.js              # 主store
  modules/              # 子模块
uni_modules/            # uni-app模块
  okingtz-cropper/     # 图片裁剪模块
unpackage/              # 打包输出
```

- **components/**: 存放可复用的Vue组件，如按钮、模态框等。
- **func/**: 核心业务逻辑，包括数据库操作、用户管理等。
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
- Discord: [https://discord.gg/mqqfd4JM](https://discord.gg/mqqfd4JM)
- 小红书: [不知名剧作家](https://www.xiaohongshu.com/user/profile/609a8cf700000000010004c3)
- 贴吧: [赛博食堂](https://tieba.baidu.com/f?kw=赛博食堂)