import store from "@/store";
import request from "@/func/common/request";
import userFun from "@/func/user/userFun";
import responseFun from "../entity/responseFun";
import baseQuery from "../dbManager/baseQuery";

export default {
	async beforeInit(page_id) {
		await this.getDeviceInfo();
		//store.commit('user/setUserData', { 'modalShow': false });
		plus.navigator.setFullscreen(true);
		store.commit('setting/getSettingData');
		console.log(store.state.setting.userId, store.state.setting.token, store.state.setting.isLogin);
		plus.nativeUI.setUIStyle(store.state.setting.darkMode);
		
		//store.commit('setting/setSettingData', { 'isLogin': false });
		if(store.state.setting.userId == 0){
			uni.navigateTo({
				url: '../login/login'
			})
		}else{
			request.getIp();
			userFun.userInit(page_id);
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