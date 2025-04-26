import store from "@/store";
import request from "@/func/common/request";

export default {
	userInit
}

function userInit(){
	// 获取设备信息
	uni.getSystemInfo({
		success: function(res) {
			console.log(res);
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
			
			store.commit('user/setUserData', {
				key: 'screen',
				data: res.screenWidth + '*' + res.screenHeight,
			});
		}
	});
	request.post("userController/relogin", {
		device: jsonData,
		version: VERSION
	}).then(res => {
		if (res.code == 200) {
			console.log(res.result);
			store.commit('user/setUserData', {
				key: 'token',
				data: res.result.token
			});
			
			if(res.result.latest_version > store.state.user.latestVersion){
				store.commit('user/setUserData', {
					key: 'latestVersion',
					data: res.result.latest_version
				});
				store.commit('user/setUserData', {
					key: 'userKey',
					data: res.result.key
				});
			}
			store.commit('user/setUserData', {
				key: 'userGroup',
				data: res.result.group
			});
			store.commit('user/setUserData', {
				key: 'groupExpiration',
				data: res.result.expiration
			});
			store.commit('user/setUserData', {
				key: 'powerLevel',
				data: res.result.power_level
			});
			if(res.result.info){
				common.checkPopup(function(){
					uni.showModal({
						title: '温馨提示',
						content: res.result.info,
						showCancel: false,
						confirmText: '明白了',
						success: function (res) {
							if (res.confirm) {
								//console.log('用户点击确定');
							} 
						}
					});
				});
			}
		}else{
			uni.showToast({
				title: res.data.msg,
				icon: "none"
			})
		}
	});
}