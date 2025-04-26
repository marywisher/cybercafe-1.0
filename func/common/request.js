import config from '@/config/config';
import handle from '@/func/common/handleFun';
import store from '@/store';

export default {
	data() {
	    return {
	      last_called: 0, // 存储上一次调用的时间戳
	    };
	},
	async post(option, options = {}) {
		let configData = config.config;
		//console.log(configData.domain);
		let res;
		let url = configData.domain;
		let post_data;

		url += option;
		post_data = options;
		
		post_data['id'] = store.state.user.userId;
		post_data['token'] = store.state.user.token;

		//console.log(option.type);
		console.log(configData.domain + option);
		console.log('post_data:' + JSON.stringify(post_data));
		
		return new Promise((resolve, reject) => {
			uni.request({
				url: url, 
				method: 'POST',
				header: {
					'Content-Type': 'application/json',
				},
				data: JSON.stringify(post_data),
				success: res => {
					console.log(res);
					// 300 token问题
					// 301 弹窗终止 请充值 模型下架
					// 302 弹窗跳登录 账户冻结/审核中
					// 303 文本内容提示 会员等级签到
					console.log(url, 'response data:', res.data);
					if(res.data.code == 301){
						uni.hideLoading();
						uni.showModal({
							title: '温馨提示',
							content: res.data.msg,
							showCancel: false,
							confirmText: '晓得了',
							success: function (res) {
								if (res.confirm) {
									console.log('用户点击确定');
								} 
							}
						});
						store.commit('user/setUserData', {
							key: 'refreshFlag',
							data: 'fail'
						});
						return;
					}else if(res.data.code == 302){
						uni.hideLoading();
						uni.showModal({
							title: '温馨提示',
							content: res.data.msg,
							showCancel: false,
							confirmText: '晓得了',
							success: function (res) {
								if (res.confirm) {
									console.log('用户点击确定');
								} 
							}
						});
						//store.commit('user/resetUserData');
						uni.reLaunch({
							url: '/pages/login/login'
						})
					}else if(res.data.code == 300){
						uni.hideLoading();
						uni.showToast({
							title: res.msg,
							icon: 'none'
						});
						store.commit('user/setUserData', {
							key: 'isLogin',
							data: false
						});
						console.log('重新登录，来自：' + option);
						uni.reLaunch({
							url: '../login/login'
						});
					}else{
						resolve(res.data);
					}
				},
				fail: err => {
					uni.hideLoading();
					uni.showToast({
						title: '网络问题，请稍后再试',
						icon: "none"
					})
					throw new Error('网络问题，请稍后再试:' + JSON.stringify(err));
				}
			});
		});
	},
	getIp(){
		let _self = this;
		//console.log('getip');
		uni.request({
			url: "https://api.ip.sb/jsonip", 
			success: res => {
				if(res.data.ip != store.state.user.ip || store.state.user.ippos == ''){
					store.commit('user/setUserData', {
						key: 'ip',
						data: res.data.ip
					});
					_self.post('userController/getIpPos', {
						'ip': store.state.user.ip,
					}).then(response => {
						//console.log(response);
						if(response.code == 200){
							store.commit('user/setUserData', {
								key: 'ippos',
								data: response.result.regionName
							});
						}
					});
				}
			},
			fail: res => {
				console.log(res);
			}
		});
	}
};