# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **赛博食堂 (cybercafe)**, a uni-app based Android application with local SQLite database. It's a chat application with AI-powered character interactions, entity management, and role-playing features.

## Development Environment

**HBuilderX is the primary IDE** for this uni-app project. The project is not designed to run with standard Node.js/npm commands.

### Running the App

1. Open the project in HBuilderX
2. To run on Android emulator/device:
   - Menu: 运行 > 运行到手机或模拟器
   - Requires Android emulator (雷电模拟器 or MuMu模拟器) or physical device
3. To build APK:
   - Menu: 发行 > 原生App-云打包

### Project Configuration

- `config.json` - Environment configuration with dev/product API endpoints
  - dev: `http://192.168.1.60/no1club/public/`
  - product: `https://b.havedreams.top/`
- `manifest.json` - App manifest with app-plus config, permissions, dark mode support
- `pages.json` - Page routing and navigation configuration
- `theme.json` - Light/dark theme color definitions
- `uni.scss` - Global SCSS variables and styling constants

## Architecture Overview

### State Management

Vuex store in `store/` with modules:
- `user` - User info, authentication, modal state
- `dialogue` - Chat data, AI configuration
- `setting` - App settings, tokens
- `bubble` - Chat bubble patterns

Store persistence uses `uni.setStorageSync` for local data storage.

### Database Layer (SQLite)

Local SQLite database (`localdb`) accessed via `plus.sqlite` API:

- `func/common/sqlite.js` - Database connection, table initialization
- `func/dbManager/baseQuery.js` - CRUD operations: `getDataByKey`, `insertDataByKey`, `updateDataByKey`, `deleteDataByKey`
- `func/dbManager/dialogueQuery.js` - Dialogue-specific queries

Table naming convention: `cybercafe_{entity}` (e.g., `cybercafe_message`, `cybercafe_entity`, `cybercafe_character`)

### Network Layer

- `func/common/request.js` - HTTP requests via `uni.request`
- Automatic token injection from store
- Response code handling: 300 (token refresh), 301 (payment/stop modal), 302 (relogin), 303 (notification), 400 (error modal)
- Rate limiting: 10 second cooldown on chat requests

### Business Logic Organization

- `func/character/` - Character management (characterFun.js, incubatorFun.js)
- `func/entity/` - Entity containers, messages, prompts, responses (entityFun.js, messageFun.js, promptFun.js, responseFun.js)
- `func/user/` - User operations (userFun.js)
- `func/setting/` - AI and bubble settings (aiFun.js, bubbleFun.js)

### Component Structure

- `components/` - Reusable UI components (cybercafe-button, cybercafe-card, cybercafe-modal, etc.)
- `modules/` - Feature-specific page modules
  - `chat/` - Chat interface components (chatHeader, chatBottom, listPart, editPart, etc.)
  - `character/` - Character management (characterHeader, descriptionPart, etc.)
  - `entity/` - Entity management (entityHeader, characterList, etc.)
  - `account/` - User account (login, userinfo, checkinPart, etc.)
  - `setting/` - Settings modules
- `pages/` - Top-level pages that compose modules

### Key Patterns

1. **Mixin-style modules**: Business logic in `func/` files export objects that can be imported and used as mixins
2. **Vuex for global state**: All cross-component communication goes through store modules
3. **Modal system**: Centralized modal state in user module with `modalShow`, `modalData`, `modalPageId`
4. **SQLite sync**: Upload/download data sync with backend via `baseQuery.syncDBUpload/syncDBDownload`
5. **Dark mode**: CSS variables in `uni.scss` with `$uni-color-dark-*` variants, theme.json for native navigation

### Styling Conventions

- SCSS variables defined in `uni.scss`
- Custom color scheme: primary `#E94E46`, secondary `#F5B400`
- RPX units for responsive sizing
- Utility classes: `.content`, `.display-flex`, `.sp-between`, `.list-item`
- Dark mode via `@media (prefers-color-scheme: dark)`

### Platform Constraints

- **Android only** - H5 support removed, no iOS build config
- SQLite module required in manifest.json
- Camera module for image selection
- Minimum SDK version 21

## Important File Paths

| Purpose | Path |
|---------|------|
| API config | `config.json` |
| App manifest | `manifest.json` |
| Page routes | `pages.json` |
| Global styles | `uni.scss`, `App.vue` |
| Store entry | `store/index.js` |
| Database init | `func/common/sqlite.js` |
| HTTP requests | `func/common/request.js` |
| Main entry | `main.js` |
