import common from "../common/common";
import { VERSION } from "@/func/common/common";
import store from "@/store";
import request from "@/func/common/request";
import incubatorFun from "@/func/incubator/incubatorFun";
import aiFun from "@/func/setting/aiFun";

export default {
	userInit(page_id){
		request.post("userController/relogin", page_id, {
			device: store.state.user.deviceInfo,
			version: VERSION
		}).then(res => {
			console.log(res.code);
			if (res.code == 200) {
				//console.log(res.result);
				store.commit('setting/setSettingData', {
					'token': res.result.token,
					'groupExpiration': res.result.expiration,
				});
				store.commit('user/setUserData', {
					userGroup: res.result.group,
					powerLevel: res.result.power_level,
					newMsgCount: res.result.new_msg,
					hasChecked: res.result.has_checkin,
					checkinCount: res.result.checkin_count
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
								confirmText: '',
								cancelText: 'OK',
								success: function (res) {}
							},
							'modalShow': true,
							'modalPageId': page_id
						});
					});
				}
				//数据同步回填
				incubatorFun.feedback();
				//console.log('init');
				aiFun.getAiRange();
				this.getUserTag();
				
				if(res.result.new_msg > 0 && page_id == 'index'){//消息弹窗
					store.commit('user/setUserData', {
						'modalData': {
							content: '来新消息了',
							confirmText: '去看消息',
							cancelText: '待会儿再说',
							success: function (res) {
								console.log(res);
								if(res.confirm){
									uni.navigateTo({
										url: '/pages/index/message'
									})
								}else{
									uni.reLaunch({
										url: '/pages/chat/index'
									})
								}								
							}
						},
						'modalShow': true,
						'modalPageId': page_id
					});
				}else{
					uni.reLaunch({
						url: '/pages/chat/index'
					})
				}
				
				/* if(res.result.has_checkin == 0 && page_id == 'index'){//签到
					let _self = this;
					if(this.checkin_flag == false){
						request.post("userController/setCheckin", 'globalSetting').then(res => {
							if (res.code == 200) {
								store.commit('user/setUserData', {
									'modalData': {
										content: res.result.message,
										confirmText: '',
										cancelText: 'OK',
										success: function (res) {
										}
									},
									'modalShow': true,
									'modalPageId': page_id
								});
								if(res.result.count > 0){
									_self.getRequestCount();
								}
							} else {
								uni.showToast({
									title: res.msg,
									icon: "none"
								});
							}
						});
					}
				} */
			}else{
				uni.showToast({
					title: res.data.msg,
					icon: "none"
				})
				uni.navigateTo({
					url: '../login/login'
				})
			}
		}).catch(e =>{
			console.log(e);
		});
	},
	getUserTag(){
		request.post('userController/getSelfTag', 'globalSetting').then(res => {
			//console.log(res.result);
			if (res.code == 200) {
				store.commit('user/setUserData', {
					'tag': res.result.tag,
					'tagLevel': res.result.level
				});
			}else {
				uni.showToast({
					title: res.msg,
					icon: "none"
				});
			}
		});
	},
	getRequestCount(page_id){
		let _self = this;
		request.post("aiController/getRequestCount", page_id).then(res => {
			if (res.code == 200) {
				//console.log(res.result);
				store.commit('user/setUserData', {'totalReward': res.result});
			} else {
				uni.showToast({
					title: res.msg,
					icon: "none"
				});
			}
		});
	},
}