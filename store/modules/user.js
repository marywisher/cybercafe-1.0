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
		powerLevel: 0,//用于限制提交本地崽的等级，非后台用户等级
		
		latestVersion: '',
		darkMode: 'light',
		totalReward: 0,
		hasNewMsg: false,
		settingOpen: {global: true, bubble: true},
		
		lastTimestampAd: 0,
		lastTimestampAccount: 0, 
		lastTimestampSubmit: {},
		
		ip: '',
		ippos: '',
		
		modalShow: false,
		modalData: {}
	},
	getters: {},
	mutations: {
		setUserData: function(state, obj){
			Object.keys(obj).forEach(key => {
			    state[key] = obj[key]
			})
			uni.setStorageSync('userInfo', state);
		},
		getUserData: function(state){
			//console.log(uni.getStorageSync('userInfo'));
			let data = uni.getStorageSync('userInfo');
			Object.keys(data).forEach(key => {
			    state[key] = data[key]
			})
		}
	},
	actions: {}
}