import request from '../common/request';
import store from '@/store';

export default {
	changeAi(select_id){
		store.commit('dialogue/setDiaData', {
			'ai': select_id,
			'aiSelect': store.state.dialogue.aiRange[select_id].nickName,
		});
		
		request.post('entityController/setEntitySetting',
			{'ai_select': select_id}).then(res => {
			//console.log(res.result);
			if (res.code != 200) {
				uni.showToast({
					title: res.msg,
					icon: "none"
				});
			}else{
				uni.showToast({
					title: '切换成功',
					icon: "success"
				});
			}
		}).catch(e => {
			uni.showToast({
				title: e,
				icon: "none"
			});
		});
	},
	async getAiRange(){
		return new Promise((resolve, reject) => {
			request.post('cafeController/getAiSettings', {}).then(res => {
				//console.log(res.result);
				if (res.code == 200) {
					let rangeValue = {};
					let ai_show_in_menu = store.state.setting.aiShowInMenu ? store.state.setting.aiShowInMenu : {};
					for(let i in res.result.range){
						if(res.result.range[i]){
							rangeValue[i] = {
								id: res.result.range[i].originId,
								newApiId: res.result.range[i].newApiId,
								name: res.result.range[i].name,
								model: res.result.range[i].model,
								nickName: res.result.range[i].nickName,
								price: res.result.range[i].price,
								description: res.result.range[i].description,
								groupName: res.result.range[i].groupName,
								cnName: res.result.range[i].cnName,
								url: res.result.range[i].url,
								domain: res.result.range[i].domain,
								parsedUrl: res.result.range[i].parsedUrl,
								builtIn: res.result.range[i].builtIn,
								temperature: res.result.range[i].temperature,
								topP: res.result.range[i].topP,
								maxTokens: res.result.range[i].maxTokens,
								level: 1,
								enabled: true
							}
						} 
						if(ai_show_in_menu[i] == undefined) ai_show_in_menu[i] = true;
					}
					
					for(let i in res.result.vip){
						if(res.result.vip[i]){
							rangeValue[i] = {
								id: res.result.vip[i].originId,
								newApiId: res.result.vip[i].newApiId,
								name: res.result.vip[i].name,
								model: res.result.vip[i].model,
								nickName: res.result.vip[i].nickName,
								price: res.result.vip[i].price,
								description: res.result.vip[i].description,
								groupName: res.result.vip[i].groupName,
								cnName: res.result.vip[i].cnName,
								url: res.result.vip[i].url,
								domain: res.result.vip[i].domain,
								parsedUrl: res.result.vip[i].parsedUrl,
								builtIn: res.result.vip[i].builtIn,
								temperature: res.result.vip[i].temperature,
								topP: res.result.vip[i].topP,
								maxTokens: res.result.vip[i].maxTokens,
								level: 2,
								enabled: store.state.user.userGroup == 2 ? true : false
							}
							if(ai_show_in_menu[i] == undefined && rangeValue[i].enabled) ai_show_in_menu[i] = true;
						} 
					}
					
					for(let i in res.result.other){
						if(res.result.other[i] && !rangeValue.hasOwnProperty(i)){
							rangeValue[i] = {
								id: res.result.other[i].originId,
								newApiId: res.result.other[i].newApiId,
								name: res.result.other[i].name,
								model: res.result.other[i].model,
								nickName: res.result.other[i].nickName,
								price: res.result.other[i].price,
								description: res.result.other[i].description,
								groupName: res.result.other[i].groupName,
								cnName: res.result.other[i].cnName,
								url: res.result.other[i].url,
								domain: res.result.other[i].domain,
								parsedUrl: res.result.other[i].parsedUrl,
								builtIn: res.result.other[i].builtIn,
								temperature: res.result.other[i].temperature,
								topP: res.result.other[i].topP,
								maxTokens: res.result.other[i].maxTokens,
								level: res.result.other[i].level,
								enabled: false
							}
						} 
					}
					for(let i in res.result.noBuilt){
						if(res.result.noBuilt[i] && !rangeValue.hasOwnProperty(i)){
							rangeValue[i] = {
								id: res.result.noBuilt[i].originId,
								newApiId: res.result.noBuilt[i].newApiId,
								name: res.result.noBuilt[i].name,
								model: res.result.noBuilt[i].model,
								groupName: res.result.noBuilt[i].groupName,
								cnName: res.result.noBuilt[i].cnName,
								url: res.result.noBuilt[i].url,
								domain: res.result.noBuilt[i].domain,
								parsedUrl: res.result.noBuilt[i].parsedUrl,
								builtIn: 'no-built',
								temperature: res.result.noBuilt[i].temperature,
								topP: res.result.noBuilt[i].topP,
								maxTokens: res.result.noBuilt[i].maxTokens
							}
						} 
					}
					//自设
					if(store.state.setting.customApiKey){
						let tmp_max_token = 0;
						for(let i in rangeValue){
							if(store.state.setting.customModel == rangeValue[i].model){
								tmp_max_token = rangeValue[i].maxTokens;
								break;
							}
						}
						rangeValue[-1] = {
							'id': -1,
							'name': store.state.setting.customModel,
							'model': store.state.setting.customModel,
							'nickName': '自设模型',
							'price': '自行支付',
							'description': '',
							'domain': store.state.setting.customDomain,
							'parsedUrl': store.state.setting.customParsedUrl,
							'maxTokens': tmp_max_token,
							'level': 1,
							'enabled': true
						}
						ai_show_in_menu[-1] = true;
					}					
					
					//console.log(rangeValue);
					store.commit('dialogue/setDiaData', {
						'aiRange': rangeValue,
						'aiGroup': res.result.group,
						'aiSelect': rangeValue[store.state.dialogue.ai].nickName,
					});
					store.commit('setting/setSettingData', {
						'aiShowInMenu': ai_show_in_menu
					});
					//console.log(store.state.setting.aiShowInMenu);
					resolve(rangeValue);
				}else {
					uni.showToast({
						title: res.msg,
						icon: "none"
					});
					reject(res.msg);
				}
			}).catch(e => {
				reject(e);
			});
		});
	},
	
}