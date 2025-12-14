import handle from '@/func/common/handleFun';
import store from '@/store';
import config from '@/config.json';
import userFun from '../user/userFun';

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
		
		post_data['id'] = store.state.setting.userId;
		post_data['token'] = store.state.setting.token;

		//console.log(pageId);
		console.log(configData.domain + option);
		console.log('post_data:' + JSON.stringify(post_data));
		
		let network_type = await this.checkNetwork(pageId);
		if(network_type == 'none') return;
		
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
										'content': res.data.msg,
										'confirmText': '',
										'cancelText': 'OK',
									},
								'modalShow': true,
								'modalPageId': pageId
							});
						return;
					}else if(res.data.code == 302){
						uni.hideLoading();
						//store.commit('user/resetUserData');
						console.log(res.data.msg);
						store.commit('setting/setSettingData', {'isLogin': false});
						uni.reLaunch({
							url: '../login/login?msg=' + res.data.msg
						})
					}else if(res.data.code == 300){
						userFun.userInit(pageId);
					}else if(res.data.code == 400){
						uni.hideLoading();
						if(res.data.msg){
							store.commit('user/setUserData',
								{
									'refreshFlag': 'fail',
									'modalData':
										{
											'content': res.data.msg,
											'confirmText': '',
											'cancelText': 'OK',
										},
									'modalShow': true,
									'modalPageId': pageId
								});
							return;
						}
					}else if(res.data.code == 401){//推送错误自行处理，不影响使用
						reject(res.data);
					}else{
						resolve(res.data);
					}
				},
				fail: err => {
					console.log(err);
					uni.hideLoading();
					let msg_str = err ? JSON.stringify(err) : '未知错误，请联系管理员';
					if(err.errMsg && err.errMsg.indexOf('request:fail abort statusCode:-1') > -1){
						msg_str = option + ' fail:请求超时，请稍后再试';
					}
					store.commit('user/setUserData',
						{
							'refreshFlag': 'fail',
							'modalData':
								{
									'content': msg_str,
									'confirmText': '',
									'cancelText': 'OK',
								},
							'modalShow': true,
							'modalPageId': pageId
						});
					return;
				}
			});
		});
	},
	getResponse(option, data) {// 仅用于chat通讯
		//console.log(option);
		//let ai_type = data.type;
		//console.log(data['id'], data['token']);
		this.post(option, 'chat', data).then(response => {
			//console.log(response);
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
								confirmText: '',
								cancelText: 'OK'
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
		//console.log(store.state.dialogue.aiRange);
		let data = store.state.dialogue.chatlist;
		data.type = store.state.dialogue.ai;
		data.key = store.state.user.userKey;
		data.model = store.state.dialogue.aiRange[store.state.dialogue.ai].model;
		data.temperature = store.state.setting.temperature;
		data.top_p = store.state.setting.topP;
		data.max_token = store.state.setting.tokenSetting;
		data.group = store.state.user.userGroup;
		//console.log(data);
		this.getResponse('newAiController/chat', data);
		this.last_called = now;
	},
	async getIp(){
		let _self = this;
		//console.log('getip');
		
		let network_type = await this.checkNetwork('index');
		if(network_type == 'none') return;
		
		uni.request({
			url: "http://ip-api.com/json/?lang=zh-CN", 
			success: res => {
				//console.log(res.data);
				if(res.data.query != store.state.setting.ip || store.state.setting.ippos == '未知'){
					store.commit('setting/setSettingData', {'ip': res.data.query});
					store.commit('setting/setSettingData', {'ippos': res.data.regionName + res.data.city});
				}
			},
			fail: res => {
				console.log(res);
			}
		});
	},
	checkNetwork(pageId){
		//获取APP网络信息，不含H5
		return new Promise((resolve, reject) => {
			uni.getNetworkType({
				success: res => {
					/* uni.showToast({
						title: res.networkType,
						icon: 'none'
					}) */
					if (res.networkType == 'none') {
						// 没有网络连接
						console.log('当前无网络连接');
						store.commit('user/setUserData',
							{
								'refreshFlag': 'fail',
								'modalData':
									{
										'content': '请检查网络',
										'confirmText': '',
										'cancelText': 'OK',
									},
								'modalShow': true,
								'modalPageId': pageId
							});
						reject('none');
					} else {
						// 有网络连接
						console.log('wdebug--res', res.networkType);
						resolve(res.networkType);
					}
				},
				fail: err =>{
					console.log(JSON.stringify(err));
					let msg_str = err ? JSON.stringify(err) : '未知错误，请联系管理员';
					if(err.errMsg && err.errMsg.indexOf('request:fail abort statusCode:-1') > -1){
						msg_str = '盲猜一个，掉线了';
					}
					store.commit('user/setUserData',
						{
							'refreshFlag': 'fail',
							'modalData':
								{
									'content': msg_str,
									'confirmText': '',
									'cancelText': 'OK',
								},
							'modalShow': true,
							'modalPageId': pageId
						});
					reject('none');
				}
			});
		});
	}
};