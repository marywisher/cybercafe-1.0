import common from "../common/common";
import { VERSION } from "@/func/common/common";
import store from "@/store";
import request from "@/func/common/request";
import incubatorFun from "@/func/character/incubatorFun";
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
				
				//tip
				//console.log(store.state.setting.tips)
				if(res.result.tip){
					// 使用Set去除重复项，然后使用扩展运算符将Set转换回数组
					let tip_online = res.result.tip.split(",");
					let merged_array = [...new Set([...store.state.setting.tips, ...tip_online])];
					//console.log(merged_array);
					store.commit('setting/setSettingData', {
						'tips': merged_array,
					});
				}
				
				if(res.result.info){
					store.commit('user/setUserData', {
						'modalData': {
							content: res.result.info,
							confirmText: '',
							cancelText: 'OK',
							success: function (res) {}
						},
						'modalShow': true,
						'modalPageId': 'chat'
					});
				}
				//数据同步回填
				incubatorFun.feedback();
				//console.log('init');
				aiFun.getAiRange();
				this.getUserTag();
				
				if(res.result.new_msg > 0 && page_id == 'index' && store.state.user.showMessageModal){//消息弹窗
					uni.$emit('resetBtn', 1);//首页进入按钮显示
					store.commit('user/setUserData', {
						'modalData': {
							content: '来新消息了',
							confirmText: '去看消息',
							cancelText: '待会儿再说',
							success: function (res) {
								//console.log(res);
								if(res.confirm == true){
									uni.navigateTo({
										url: '/pages/index/message'
									})
								}else if(res.cancel == true){
									uni.reLaunch({
										url: '/pages/chat/index'
									})
								}								
							}
						},
						'modalShow': true,
						'modalPageId': page_id,
						'showMessageModal': false
					});
				}else{
					uni.reLaunch({
						url: '/pages/chat/index'
					})
				}
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