import store from "@/store";
import request from "@/func/common/request";
import userFun from "@/func/user/userFun";
import responseFun from "../entity/responseFun";
import baseQuery from "../dbManager/baseQuery";

/**
 * 项目升级：将 cybercafe 的旧变量命名升级到 cybercafe-git-operate 的新命名规范
 * 该方法在首次运行时自动执行，无感迁移数据，跨模块分散存储，后续覆盖代码即可使用新命名
 */
function upgradeStoreData() {
	// user 模块内部的字段映射
	const userInternalMap = {
		'user_name': 'userName',
		'user_key': 'userKey',
		'user_avatar': 'userAvatar',
		'aim_id': 'aimId',
		'user_group': 'userGroup',
		'power_level': 'powerLevel',
		'hasNewMsg': 'newMsgCount',
		'latest_version': 'latestVersion',
		'total_reward': 'totalReward',
		'last_timestamp_ad': 'lastTimestampAd',
		'last_timestamp_account': 'lastTimestampAccount',
		'last_timestamp_submit': 'lastTimestampSubmit',
		'screen': 'deviceInfo',
		'setting_open': 'settingOpen',
		
	};

	// user 模块迁移到 setting 模块的字段映射
	const userToSettingMap = {
		'user_id': 'userId',
		'dark_mode': 'darkMode',
		'token': 'token',
		'isLogin': 'isLogin',
		'ip': 'ip',
		'ippos': 'ippos',
		'group_expiration': 'groupExpiration'
	};

	// dialogue 模块内部的字段映射
	const dialogueInternalMap = {
		'crt_character_id': 'crtCharacterId',
		'message_time': 'messageTime',
		'prev_message_time': 'prevMessageTime',
		'entity_image': 'entityImage',
		'cdisplayid': 'cDisplayId',
		'breakpoint_message_id': 'breakpointMessageId',
		'entity_mode': 'entityMode'
	};

	// dialogue 模块迁移到 setting 模块的字段映射
	const dialogueToSettingMap = {
		'entity_id': 'entityId',
		'bubble_opacity': 'bubbleOpacity',
		'bg_opacity': 'bgOpacity',
		'font_size': 'fontSize',
		'font_color': 'fontColor',
		'bubble_color': 'bubbleColor',
		'bubble_align': 'bubbleAlign',
		'img_width': 'imgWidth',
		'img_radius': 'imgRadius',
		'chat_pattern': 'chatPattern',
		'chat_html': 'chatHtml',
		'chat_css': 'chatCss',
		'chat_fg_css': 'chatFgCss'
	};

	// dialogue 中需要移除的字段（真正过时的）
	const dialogueRemoveFields = ['chat65tlist', 'openEdit', 'proplist', 'tiplist'];

	// ========== 升级 user 存储数据 ==========
	try {
		let userInfo = uni.getStorageSync('userInfo');
		let settingData = uni.getStorageSync('setting') || {};

		if (userInfo && typeof userInfo === 'object') {
			let newUserInfo = {};
			let upgraded = false;

			// 1. 处理 user 模块内保留的字段
			for (let oldKey in userInternalMap) {
				if (oldKey in userInfo) {
					const newKey = userInternalMap[oldKey];
					newUserInfo[newKey] = userInfo[oldKey];
					upgraded = true;
				}
			}

			// 2. 处理需要迁移到 setting 的字段
			for (let oldKey in userToSettingMap) {
				if (oldKey in userInfo) {
					const newKey = userToSettingMap[oldKey];
					settingData[newKey] = userInfo[oldKey];
					upgraded = true;
				}
			}

			if (upgraded) {
				uni.setStorageSync('userInfo', newUserInfo);
				uni.setStorageSync('setting', settingData);
				console.log('[Store Upgrade] User data upgraded successfully', { newUserInfo, settingData });
			}
		}
	} catch (e) {
		console.warn('[Store Upgrade] Error upgrading userInfo:', e);
	}

	// ========== 升级 dialogue 存储数据 ==========
	try {
		let dialogueData = uni.getStorageSync('dialogueData');
		if (dialogueData && typeof dialogueData === 'object') {
			let newDiaInfo = {};
			let upgraded = false;

			// 1. 处理 user 模块内保留的字段
			for (let oldKey in dialogueInternalMap) {
				if (oldKey in dialogueData) {
					const newKey = dialogueInternalMap[oldKey];
					newDiaInfo[newKey] = dialogueData[oldKey];
					upgraded = true;
				}
			}

			// 2. 处理需要迁移到 setting 的字段
			for (let oldKey in dialogueToSettingMap) {
				if (oldKey in dialogueData) {
					const newKey = dialogueToSettingMap[oldKey];
					settingData[newKey] = dialogueData[oldKey];
					upgraded = true;
				}
			}

			if (upgraded) {
				uni.setStorageSync('dialogueData', newDiaInfo);
				uni.setStorageSync('setting', settingData);
				console.log('[Store Upgrade] Dialogue data upgraded successfully', { newDiaInfo, settingData });
			}
		}
	} catch (e) {
		console.warn('[Store Upgrade] Error upgrading chatData:', e);
	}

	// ========== 标记升级完成，避免重复执行 ==========
	try {
		let upgradeFlag = uni.getStorageSync('upgradeFlag');
		if (!upgradeFlag) {
			uni.setStorageSync('upgradeFlag', 'v1.0_upgraded');
		}
	} catch (e) {
		console.warn('[Store Upgrade] Error setting upgrade flag:', e);
	}
}

export default {
	async beforeInit(page_id) {
		// 首次运行时升级 store 数据
		let upgradeFlag = uni.getStorageSync('upgradeFlag');
		if (!upgradeFlag) upgradeStoreData();
		
		await this.getDeviceInfo();
		let network_type = await request.checkNetwork('index');
		//store.commit('user/setUserData', { 'modalShow': false });
		plus.navigator.setFullscreen(true);
		store.commit('setting/getSettingData');
		console.log(store.state.setting.userId, store.state.setting.token, store.state.setting.isLogin);
		plus.nativeUI.setUIStyle(store.state.setting.darkMode);
		
		if(page_id == 'entityHistory' && network_type == 'none'){//离线
			uni.navigateTo({
				url: '/pages/entity/entityList?from=offline'
			})
		}else{
			//store.commit('setting/setSettingData', { 'isLogin': false });
			if(store.state.setting.userId == 0){
				uni.navigateTo({
					url: '../login/login'
				})
			}else{
				request.getIp();
				userFun.userInit(page_id);
			}
		}
	},
	afterResponseFun(rel) {
		responseFun.responseToOptions(rel);
	},
	async initSetting(){
		let setting_result = await baseQuery.getDataByKey('cybercafe_setting', []);
		for(let setting_key in setting_result){
			//console.log(setting_result[setting_key]['setting_key'], setting_result[setting_key]);
			let setting_store = {};
			setting_store[setting_result[setting_key]['setting_key']] = JSON.parse(setting_result[setting_key]['setting_value']);
			store.commit('setting/setSettingStore', setting_store);
		}
	},
	getDeviceInfo(){
		return new Promise((resolve, reject) => {
			// 获取设备信息
			uni.getSystemInfo({
				success: function(res) {
					//console.log(res);
					let device_data = {
						appLanguage: res.appLanguage,
						browserName: res.browserName,
						browserVersion: res.browserVersion,
						deviceBrand: res.deviceBrand, // 品牌
						deviceModel: res.deviceModel, // 型号
						deviceType: res.deviceType,
						devicePixelRatio: res.devicePixelRatio, // 设备像素比
						romName: res.romName,
						uniPlatform: res.uniPlatform, // 平台（iOS、Android、Windows等）
						uniRuntimeVersion: res.uniRuntimeVersion,
			
						brand: res.brand,
						model: res.model,
						platform: res.platform,
						screenWidth: res.screenWidth, // 屏幕宽度
						screenHeight: res.screenHeight, // 屏幕高度
						system: res.system, // 操作系统版本
						theme: res.osTheme,
						ip: store.state.setting.ip,
						ippos: store.state.setting.ippos
					};
			
					// 转换为JSON字符串
					let json_data = JSON.stringify(device_data);
					store.commit('user/setUserData', {
						'deviceInfo': json_data
					});
					resolve(true);
				},
				fail() {
					reject(false);
				}
			});
		});
	}
}