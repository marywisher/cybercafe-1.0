# CyberCafe 系统路由关系图

## 页面列表

| 页面路径 | 页面名称 | 页面类型 |
|---------|--------|--------|
| `/pages/index/index` | 首页/启动页 | 主页面 |
| `/pages/chat/index` | 聊天页 | 主要功能页 |
| `/pages/character/index` | 角色切片详情 | 内容页 |
| `/pages/character/characterList` | 发现（线上角色列表） | 浏览页 |
| `/pages/character/preview` | 线上角色预览 | 内容页 |
| `/pages/character/incubator` | 本地角色详情 | 内容页 |
| `/pages/character/incubatorList` | 本地角色列表 | 浏览页 |
| `/pages/entity/index` | 容器详情/设置 | 内容页 |
| `/pages/entity/entityList` | 容器列表 | 浏览页 |
| `/pages/login/login` | 登录/账户 | 身份验证页 |
| `/pages/setting/globalSetting` | 通用设置 | 设置页 |
| `/pages/setting/aiSetting` | 大模型设置 | 设置页 |
| `/pages/setting/promptSetting` | 提示词设置 | 设置页 |
| `/pages/setting/decorateSetting` | 样式设置 | 设置页 |
| `/pages/setting/bubbleMarket` | 气泡市场 | 设置页 |
| `/pages/index/message` | 消息页 | 信息页 |
| `/pages/index/info` | 说明/版本信息 | 信息页 |
| `/pages/setting/rewardDetail` | 明细 | 详情页 |
| `/pages/index/dataList` | 数据 | 数据页 |

---

## 路由跳转关系

### 1. 首页 (`/pages/index/index`)
**功能**: 应用启动页，初始化应用

**出站路由**:
- 无直接跳转（通过 `beforeInit` 进行应用初始化）

**入站来源**:
- 应用启动

---

### 2. 聊天页 (`/pages/chat/index`)
**功能**: 核心聊天功能页面

**出站路由**:
| 目标页面 | 触发方式 | 来源组件 |
|---------|--------|--------|
| `/pages/setting/globalSetting` | 点击"系统设置" | `chatHeader.vue` |
| `/pages/setting/decorateSetting` | 点击"气泡市场" | `listMenu.vue` |
| `/pages/setting/promptSetting` | 快捷菜单中点击语序调整 | `popMenu.vue` |
| `/pages/entity/index` | 快捷菜单中点击"本容器设置" | `popMenu.vue` |
| `/pages/entity/entityList` | 快捷菜单中点击"切换容器" | `popMenu.vue` |
| `/pages/character/index` | 从聊天列表选择角色 | `listPart.vue` |
| `/pages/entity/index` | 从聊天列表点击"进入容器" | `listPart.vue` |

**入站来源**:
- `navigateBack()` 从各设置页返回
- 从 `entityList` 返回

---

### 3. 发现 - 线上角色列表 (`/pages/character/characterList`)
**功能**: 浏览和发现线上角色

**出站路由**:
| 目标页面 | 触发方式 | 参数 |
|---------|--------|-----|
| `/pages/character/preview` | 点击角色卡片 | `?id=character_id` |

**返回方式**:
- `navigateBack()` 返回上一页

**入站来源**:
- 从 `/pages/setting/globalSetting` 点击"发现"
- 从 `/pages/entity/entityList` 头部"新建容器"按钮
- 从聊天的快捷菜单

---

### 4. 线上角色预览 (`/pages/character/preview`)
**功能**: 预览线上角色详情

**参数**: `id` - 角色ID（必需）

**出站路由**:
| 目标页面 | 触发方式 | 参数 |
|---------|--------|-----|
| `/pages/character/index` | 点击下载/创建本地角色 | `?online_id=character_id` |

**返回方式**:
- `navigateBack()` 返回角色列表

**入站来源**:
- 从 `/pages/character/characterList` 点击角色

---

### 5. 角色切片详情 (`/pages/character/index`)
**功能**: 查看和编辑角色详情

**参数**: 
- `id` - 角色ID（用于修改现有角色）
- `online_id` - 线上角色ID（用于创建本地角色）

**出站路由**:
| 目标页面 | 触发方式 | 备注 |
|---------|--------|-----|
| `/pages/entity/index` | 点击"进入容器" | 通过 `@tapEnter` 事件 |

**返回方式**:
- `navigateBack()` 返回上一页

**入站来源**:
- 从 `/pages/entity/entityList` 点击角色
- 从 `/pages/character/preview` 下载角色
- 从聊天列表选择角色
- 从容器详情的角色卡片点击跳转

---

### 6. 本地角色列表 (`/pages/character/incubatorList`)
**功能**: 浏览本地创建的角色

**出站路由**:
| 目标页面 | 触发方式 | 参数 |
|---------|--------|-----|
| `/pages/character/incubator` | 点击本地角色卡片 | `?id=incubator_id` |

**返回方式**:
- `navigateBack()` 返回设置页

**入站来源**:
- 从 `/pages/setting/globalSetting` 点击"本地角色"

---

### 7. 本地角色详情 (`/pages/character/incubator`)
**功能**: 编辑和管理本地角色

**参数**: `id` - 本地角色ID（必需）

**返回方式**:
- `navigateBack()` 返回列表

**入站来源**:
- 从 `/pages/character/incubatorList` 点击角色

---

### 8. 容器列表 (`/pages/entity/entityList`)
**功能**: 浏览所有容器

**出站路由**:
| 目标页面 | 触发方式 | 参数 |
|---------|--------|-----|
| `/pages/entity/index` | 点击容器或点击"设置" | `entityId` 已设置到 store |
| `/pages/character/index` | 点击容器内角色 | `?id=character_id` |
| `/pages/character/characterList` | 点击"新建容器"按钮 | 跳转到发现角色 |
| `/pages/chat/index` | 点击返回按钮 | 使用 `redirectTo` |

**返回方式**:
- `redirectTo` 返回聊天页（替换当前页）

**入站来源**:
- 从聊天的快捷菜单点击"切换容器"
- 从 `/pages/setting/globalSetting` 点击"容器列表"

---

### 9. 容器详情 (`/pages/entity/index`)
**功能**: 编辑容器信息和角色关系

**参数**: `entityId` (来自 store)

**出站路由**:
| 目标页面 | 触发方式 |
|---------|--------|
| 无直接路由 | 通过 `navigateBack()` 返回 |

**返回方式**:
- `navigateBack()` 返回上一页（容器列表或聊天页）

**入站来源**:
- 从 `/pages/entity/entityList` 点击容器
- 从聊天的快捷菜单点击"本容器设置"

---

### 10. 登录/账户页 (`/pages/login/login`)
**功能**: 用户登录、注册和账户管理

**出站路由**:
| 目标页面 | 触发方式 | 备注 |
|---------|--------|-----|
| 无直接路由 | `navigateBack()` | 返回上一页 |

**返回方式**:
- `navigateBack()` 返回上一页

**入站来源**:
- 从用户初始化检查（无登录时）
- 从 `/pages/setting/globalSetting` 点击"登录"

---

### 11. 通用设置 (`/pages/setting/globalSetting`)
**功能**: 全局应用设置中心

**出站路由**:
| 目标页面 | 触发方式 | 路由方式 |
|---------|--------|--------|
| `/pages/setting/decorateSetting` | 点击"外观设置" | `navigateTo('./decorateSetting')` |
| `/pages/setting/aiSetting` | 点击"AI设置" | `navigateTo('./aiSetting')` |
| `/pages/setting/promptSetting` | 点击"提示词设置" | `navigateTo('./promptSetting')` |
| `/pages/index/info` | 点击"说明" | `navigateTo('../index/info?p=xxx')` |
| `/pages/index/dataList` | 点击"数据" | `navigateTo('/pages/index/dataList')` |
| `/pages/login/login` | 点击"登录" | `navigateTo('/pages/login/login')` |
| `/pages/character/characterList` | 点击"发现" | `navigateTo('/pages/character/characterList')` |
| `/pages/entity/entityList` | 点击"容器列表" | `navigateTo('/pages/entity/entityList')` |
| `/pages/character/incubatorList` | 点击"本地角色" | `navigateTo('/pages/character/incubatorList')` |

**返回方式**:
- `navigateBack()` 返回聊天页

**入站来源**:
- 从聊天页点击"系统设置"

---

### 12. 大模型设置 (`/pages/setting/aiSetting`)
**功能**: 配置 AI 模型

**返回方式**:
- `navigateBack()` 返回通用设置

**入站来源**:
- 从 `/pages/setting/globalSetting` 点击"AI设置"

---

### 13. 提示词设置 (`/pages/setting/promptSetting`)
**功能**: 配置 AI 提示词

**返回方式**:
- `navigateBack()` 返回通用设置

**入站来源**:
- 从 `/pages/setting/globalSetting` 点击"提示词设置"
- 从聊天的快捷菜单点击"语序调整"

---

### 14. 样式设置 (`/pages/setting/decorateSetting`)
**功能**: 配置聊天气泡和外观样式

**出站路由**:
| 目标页面 | 触发方式 |
|---------|--------|
| `/pages/setting/bubbleMarket` | 点击"气泡市场" |

**返回方式**:
- `navigateBack()` 返回通用设置

**入站来源**:
- 从 `/pages/setting/globalSetting` 点击"外观设置"
- 从聊天页快捷菜单点击"气泡样式"

---

### 15. 气泡市场 (`/pages/setting/bubbleMarket`)
**功能**: 下载和购买气泡样式

**返回方式**:
- `navigateBack()` + `redirectTo('/pages/setting/decorateSetting')` 返回样式设置

**入站来源**:
- 从 `/pages/setting/decorateSetting` 点击"气泡市场"

---

### 16. 消息页 (`/pages/index/message`)
**功能**: 查看系统消息

**返回方式**:
- `navigateBack()` 返回上一页

---

### 17. 说明/版本信息 (`/pages/index/info`)
**功能**: 显示应用说明和版本信息

**参数**: `p` - 参数类型（'version' 或其他）

**返回方式**:
- `navigateBack()` 返回设置页

**入站来源**:
- 从 `/pages/setting/globalSetting` 点击"说明"

---

### 18. 明细页 (`/pages/setting/rewardDetail`)
**功能**: 查看米粒明细

**返回方式**:
- `navigateBack()` 返回上一页

**入站来源**:
- 从账户信息点击"明细"

---

### 19. 数据页 (`/pages/index/dataList`)
**功能**: 查看应用数据统计

**返回方式**:
- `navigateBack()` 返回设置页

**入站来源**:
- 从 `/pages/setting/globalSetting` 点击"数据"

---

## 路由层级结构

```
应用启动
  └─ 首页 (index/index)
     └─ 聊天页 (chat/index) [主枢纽]
        ├─ 快捷菜单
        │  ├─ 系统设置 → 通用设置 (setting/globalSetting)
        │  │  ├─ AI设置 (setting/aiSetting)
        │  │  ├─ 提示词设置 (setting/promptSetting)
        │  │  ├─ 外观设置 (setting/decorateSetting)
        │  │  │  └─ 气泡市场 (setting/bubbleMarket)
        │  │  ├─ 发现 → 角色列表 (character/characterList)
        │  │  │  └─ 角色预览 (character/preview)
        │  │  │     └─ 角色详情 (character/index)
        │  │  ├─ 容器列表 (entity/entityList)
        │  │  │  └─ 容器详情 (entity/index)
        │  │  ├─ 本地角色列表 (character/incubatorList)
        │  │  │  └─ 本地角色详情 (character/incubator)
        │  │  ├─ 登录页 (login/login)
        │  │  ├─ 说明 (index/info)
        │  │  └─ 数据 (index/dataList)
        │  ├─ 本容器设置 → 容器详情 (entity/index)
        │  ├─ 语序调整 → 提示词设置 (setting/promptSetting)
        │  └─ 切换容器 → 容器列表 (entity/entityList)
        │
        ├─ 容器列表 (entity/entityList)
        │  ├─ 容器详情 (entity/index)
        │  └─ 角色列表 (character/characterList)
        │     └─ 角色详情 (character/index)
        │
        └─ 聊天历史选择
           ├─ 角色详情 (character/index)
           └─ 容器详情 (entity/index)
```

---

## 导航方式总结

### 使用 `navigateTo` (可返回)
- 正常的页面导航
- 会添加到导航栈
- 用户可以通过返回按钮返回
- 例子: 进入设置、查看详情等

### 使用 `navigateBack` (返回)
- 返回到上一页
- 可选参数 `delta` 控制返回层级数
- 例子: 返回按钮

### 使用 `redirectTo` (替换)
- 替换当前页，不添加到栈
- 例子: 容器列表返回聊天页

### 使用 `reLaunch` (重启)
- 关闭所有页面，打开新页面
- 用于特殊场景

---

## 关键设计模式

1. **聊天页为中枢**: 大多数功能都从聊天页出发或返回到聊天页
2. **设置页为入口**: 通用设置是访问大多数配置的入口
3. **列表-详情结构**: 
   - 角色: characterList → preview → index
   - 容器: entityList → index
   - 本地角色: incubatorList → incubator
4. **参数传递**: 大多数通过 URL 参数或 Vuex store 传递数据
5. **返回导航**: 大量使用 `navigateBack()` 保持应用流畅

---

## 常见路由流程示例

### 流程1: 创建本地角色
1. 聊天页 → 系统设置
2. 通用设置 → 发现
3. 角色列表 → 角色预览
4. 角色预览 → 角色详情（下载）
5. 角色详情 → 返回

### 流程2: 切换容器
1. 聊天页 → 快捷菜单
2. 快捷菜单 → 容器列表
3. 容器列表 → 容器详情（可选）
4. 返回聊天页

### 流程3: 调整设置
1. 聊天页 → 系统设置
2. 通用设置 → 各项设置
3. 返回通用设置
4. 返回聊天页

### 流程4: 下载气泡
1. 聊天页 → 系统设置
2. 通用设置 → 外观设置
3. 外观设置 → 气泡市场
4. 购买/下载完成 → 返回外观设置

