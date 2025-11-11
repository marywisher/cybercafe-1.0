export default {
	namespaced: true,
	state: {
		userName: '',
		userKey: '',
		userAvatar: '',
		aimId: 0,
		userGroup: 1,
		powerLevel: 0,//用于限制提交本地崽的等级，非后台用户等级
		tag: '',
		
		latestVersion: '',
		darkMode: 'light',
		totalReward: 0,
		newMsgCount: 0,
		settingOpen: {global: true, bubble: true},
		
		lastTimestampAd: 0,
		lastTimestampAccount: 0, 
		lastTimestampSubmit: {},
		
		modalShow: false,
		modalData: {},
		modalPageId: '' // 添加页面标识，用于确定在哪个页面显示弹窗
	},
	getters: {},
	mutations: {
		setUserData: function(state, obj){
			Object.keys(obj).forEach(key => {
			    state[key] = obj[key]
			})
			//console.log(state)
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