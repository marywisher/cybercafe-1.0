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
	async post(option, vm, options = {}) {
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
						vm.$refs.cModal.show({
							content: res.data.msg,
							cancelText: '晓得了',
							success: function (res) {}
						});
						store.commit('user/setUserData', {
							key: 'refreshFlag',
							data: 'fail'
						});
						return;
					}else if(res.data.code == 302){
						uni.hideLoading();
						//store.commit('user/resetUserData');
						uni.navigateTo({
							url: '../login/login?msg=' + res.data.msg
						})
					}else if(res.data.code == 300){
						uni.hideLoading();
						store.commit('user/setUserData', {
							key: 'isLogin',
							data: false
						});
						console.log('重新登录，来自：' + option);
						uni.reLaunch({
							url: '../login/login?msg=' + res.msg
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
	/* getResponse(option, data, param, vm) {// 仅用于chat通讯
		//console.log(option);
		let ai_type = option.type;
		//console.log(data['id'], data['token']);
		this.post(option, data).then(response => {
			console.log(response);
			if(response.code == 200){
				//console.log(ai_type);
				handle.afterResponseFun({
					key: param,
					value: {
						content: response.result,
					}
				});
			}else if(response.code == 303){
				uni.hideLoading();
				vm.$refs.cModal.show({
					content: response.msg,
					cancelText: '晓得了',
					success: function (res) {}
				});
				handle.afterResponseFun({
					key: param,
					value: {
						content: response.result,
					}
				});
			}else {
				//console.error(response.msg);
				uni.hideLoading();
				uni.showToast({
					title: response.msg,
					icon: "none"
				})
			}
		}).catch(e => {
			console.error(e);
			uni.hideLoading();
			uni.showToast({
				title: e,
				icon: "none"
			})
		});
	},
	bothSideRequest(model, data, ai, param_prefix, vm) {
		//console.log(this.last_called);
		const now = Date.now();
		if(now - this.last_called < 10000){
			if(!data.task || data.task == 'chat'){
				uni.showToast({
					title: '别心急，慢点，再慢点',
					icon: "none"
				})
			}
			uni.hideLoading();
			return;
		}
		data.type = ai;
		//console.log(data.type);
		data.model = model;
		switch (ai){
			case 7:
				//console.log(data);
				this.getResponse('aiController/chat2', data, param_prefix, vm);
				break;
			default:
				data.key = store.state.user.user_key;
				this.getResponse('aiController/chat', data, param_prefix, vm);
				break;
		}
		this.last_called = now;
	}, */
	/* getLocalResponse(option, data, vm) {
		console.log(option);
		this.post(option, data).then(response => {
			console.log(response);
			if(response.code == 200){
				handle.afterResponseFun({
					key: option,
					value: response.result
				});
			}else if(response.code == 303){
				uni.hideLoading();
				vm.$refs.cModal.show({
					content: response.msg,
					cancelText: '晓得了',
					success: function (res) {}
				});
				handle.afterResponseFun({
					key: option,
					value: response.result
				});
			}else{
				console.error(response.msg);
				uni.hideLoading();
				uni.showToast({
					title: response.msg,
					icon: "none"
				})
			}
		}).catch(e => {
			console.error(e);
			uni.hideLoading();
			uni.showToast({
				title: e,
				icon: "none"
			})
		});
	}, */
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