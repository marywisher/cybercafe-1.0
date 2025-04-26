export default {
	namespaced: true,
	state: {
		userId: 0,
		userName: '',
		userKey: '',
		token: '',
		isLogin: false,
		userAvatar: '',
		aimId: 0,
		userGroup: 1,
		groupExpiration: '',
		
		latestVersion: '',
		screen: '',//设备尺寸，用于背景图计算裁切长宽比
		darkMode: 'light',
		powerLevel: 0,//用于限制提交本地崽的等级，非后台用户等级
		totalReward: 0,
		hasNewMsg: false,
		
		lastTimestampAd: 0,
		lastTimestampAccount: 0, 
		lastTimestampSubmit: {},
		
		settingOpen: {global: true, bubble: true},
		
		ip: '',
		ippos: '',
	},
	getters: {},
	mutations: {
		setUserData: function(state, {key, data}){
			state[key] = data;
			uni.setStorageSync('userInfo', state);
		},
		getUserData: function(state){
			//console.log(uni.getStorageSync('userInfo'));
			let data = uni.getStorageSync('userInfo');
			for(let key in state){
				if(data[key] != undefined) state[key] = data[key];
			}
		}
	},
	actions: {}
}