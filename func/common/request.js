import handle from '@/func/common/handleFun';
import store from '@/store';
import config from '@/config.json';

const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;

export default {
	data() {
	    return {
	      last_called: 0, // 存储上一次调用的时间戳
	    };
	},
	async post(option, pageId = 'index', options = {}) {
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
						store.commit('user/setUserData', 
							{
								'refreshFlag': 'fail',
								'modalData':
									{
										content: res.data.msg,
										cancelText: '晓得了',
										success: function (res) {}
									},
								'modalShow': true,
								'modalPageId': pageId
							});
						return;
					}else if(res.data.code == 302){
						uni.hideLoading();
						//store.commit('user/resetUserData');
						console.log(res.data.msg);
						uni.navigateTo({
							url: '../login/login?msg=' + res.data.msg
						})
					}else if(res.data.code == 300){
						uni.hideLoading();
						store.commit('user/setUserData', {'isLogin': false});
						console.log('重新登录，来自：' + option);
						console.log(res.msg);
						uni.reLaunch({
							url: '../login/login' + (res.msg ? '?msg=' + res.msg : '')
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
	getResponse(option, data) {// 仅用于chat通讯
		//console.log(option);
		//let ai_type = data.type;
		//console.log(data['id'], data['token']);
		this.post(option, data).then(response => {
			console.log(response);
			if(response.code == 200){
				//console.log(ai_type);
				handle.afterResponseFun({
					value: {
						content: response.result,
					}
				});
			}else if(response.code == 303){
				uni.hideLoading();
				store.commit('user/setUserData',
					{
						'modalData':
							{
								content: response.msg,
								cancelText: '晓得了',
								success: function (res) {}
							},
						'modalShow': true,
						'modalPageId': pageId
					});
				handle.afterResponseFun({
					value: {
						content: response.result,
					}
				});
			}else {
				//console.error(response.msg);
				uni.showToast({
					title: response.msg,
					icon: "none"
				})
			}
		}).catch(e => {
			console.error(e);
			uni.showToast({
				title: e,
				icon: "none"
			})
		}).finally(() => {
			uni.hideLoading();
		});
	},
	chatRequest() {
		//console.log(this.last_called);
		const now = Date.now();
		if(now - this.last_called < 10000){
			uni.showToast({
				title: '别心急，慢点，再慢点',
				icon: "none"
			})
			uni.hideLoading();
			return;
		}
		console.log(store.state.dialogue.aiRange);
		let data = store.state.dialogue.chatlist;
		data.type = store.state.dialogue.ai;
		data.key = store.state.user.userKey;
		data.model = store.state.dialogue.aiRange[store.state.dialogue.ai].model;
		data.temperature = store.state.setting.temperature;
		data.top_p = store.state.setting.topP;
		console.log(data);
		return;
		this.getResponse('newAiController/chat', data);
		this.last_called = now;
	},
	getIp(){
		let _self = this;
		//console.log('getip');
		uni.request({
			url: "https://api.ip.sb/jsonip", 
			success: res => {
				if(res.data.ip != store.state.user.ip || store.state.user.ippos == ''){
					store.commit('user/setUserData', {'ip': res.data.ip});
					_self.post('userController/getIpPos', {
						'ip': store.state.user.ip,
					}).then(response => {
						//console.log(response);
						if(response.code == 200){
							store.commit('user/setUserData', {'ippos': response.result.regionName});
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