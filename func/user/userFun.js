import common from "../common/common";
import store from "@/store";
import request from "@/func/common/request";
import { VERSION } from "../common/constants";
import baseQuery from "../dbManager/baseQuery";

export default {
	async userInit(){
		await this.initSetting();
		
		// 获取设备信息
		uni.getSystemInfo({
			success: function(res) {
				//console.log(res);
				let deviceData = {
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
					ip: store.state.user.ip,
					ippos: store.state.user.ippos
				};
		
				// 转换为JSON字符串
				let jsonData = JSON.stringify(deviceData);
				
				request.post("userController/relogin", 'chat', {
					device: jsonData,
					version: VERSION
				}).then(res => {
					if (res.code == 200) {
						//console.log(res.result);
						store.commit('user/setUserData', {
							token: res.result.token,
							userGroup: res.result.group,
							groupExpiration: res.result.expiration,
							powerLevel: res.result.power_level
						});
						if(res.result.latest_version > store.state.user.latestVersion){
							store.commit('user/setUserData', {
								'latestVersion': res.result.latest_version,
								'userKey': res.result.key,
							});
						}
						
						if(res.result.info){
							common.checkPopup(function(){
								store.commit('user/setUserData', {
									'modalData': {
										content: res.result.info,
										cancelText: '明白了',
										success: function (res) {}
									},
									'modalShow': true,
									'modalPageId': 'chat'
								});
							});
						}
					}else{
						uni.showToast({
							title: res.data.msg,
							icon: "none"
						})
					}
				}).catch(e =>{
					console.log(e);
				});
			}
		});
	},
	async initSetting(){
		let setting_result = await baseQuery.getDataByKey('cybercafe_setting', []);
		for(let setting_key in setting_result){
			//console.log(setting_result[setting_key]['setting_key'], setting_result[setting_key]);
			let setting_store = {};
			setting_store[setting_result[setting_key]['setting_key']] = JSON.parse(setting_result[setting_key]['setting_value']);
			store.commit('setting/setSettingStore', setting_store);
		}
	}
}