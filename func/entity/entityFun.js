import baseQuery from "../dbManager/baseQuery";
import dialogueQuery from "../dbManager/dialogueQuery";
import request from "../common/request";
import store from "@/store";

export default{
	async getEntityId(entity_id = 0){
		return new Promise((resolve, reject) => {
			request.post('entityController/getEntitySettings', 'chat',
				{'entity_id': entity_id}).then(res => {
				//console.log(res.result);
				if (res.code == 200) {
					store.commit('setting/setSettingData', {
						'entityId': res.result.entity_id
					});
					if(!store.state.dialogue.entityMode){
						store.commit('dialogue/setDiaData', {
							'entityMode': res.result.mode
						});
					}
					store.commit('dialogue/setDiaData', {
						'ai': res.result.api_id,
						'aiSelect': res.result.api_id == -1 ? '自设模型' : res.result.ai_select
					});
					resolve(res.result.entity_id);
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
	async entityInit(){
		store.commit('dialogue/setDiaData', {
			'breakpointMessageId': 0,
			'historylist': [],
			'characterlist': {}
		});
		let entity_data = await baseQuery.getDataByKey('cybercafe_entity', {
			'entity_id': store.state.setting.entityId});
		if(entity_data.length == 0){
			await this.getEntityId();
			entity_data = await baseQuery.getDataByKey('cybercafe_entity', {
				'entity_id': store.state.setting.entityId});
		}else{
			await this.getEntityId(store.state.setting.entityId);
		}
		if(entity_data.length == 0) return;
		store.commit('dialogue/setDiaData', {
			'title': entity_data[0].entity_title,
			'me': entity_data[0].subject_name,
			'entityImage': entity_data[0].entity_img
		});
		store.state.dialogue.characterlist[0] = {
			'character_description': entity_data[0].subject_description ? entity_data[0].subject_description : '',
			'group_description': entity_data[0].extra_description ? entity_data[0].extra_description : '',
			'character_img': entity_data[0].subject_img
		};
				
		let character_list = store.state.dialogue.characterlist;
		let character_data = await dialogueQuery.getCharacterByEntityIdNoLimit();
		for(let i in character_data){
			character_list[character_data[i].character_id] = character_data[i];
		}
		
		//console.log(character_list);
		let crt_character_id = await dialogueQuery.getCurrentCharacterId();
		store.commit('dialogue/setDiaData', {
			'characterlist': character_list,
			'crtCharacterId': crt_character_id,
			'cDisplayId': crt_character_id
		});
		//console.log(store.state.dialogue.crtCharacterId);
	},
	delEntity(pageId){
		if(store.state.setting.entityId == 0) return;
		//let _self = this;
		store.commit('user/setUserData', {
			'modalData': {
				title: '解散羁绊后，本羁绊聊天记录将全部删除，无法恢复',
				confirmText: '确定解散',
				cancelText: '再想想',
				success: function (res) {
					if (res.confirm) {
						uni.showLoading({});
						baseQuery.deleteDataByKey('cybercafe_ai_response', {
							'entity_id': store.state.setting.entityId
						});
						baseQuery.deleteDataByKey('cybercafe_message', {
							'entity_id': store.state.setting.entityId
						});
						dialogueQuery.deleteCharacterByEntityId();
						baseQuery.deleteDataByKey('cybercafe_entity_detail', {
							'entity_id': store.state.setting.entityId
						});
						baseQuery.deleteDataByKey('cybercafe_entity', {
							'entity_id': store.state.setting.entityId
						});
						
						//删除线上的entity
						request.post("entityController/deleteEntity", pageId, {
							entity_id: store.state.setting.entityId
						}).then(res => {
							if (res.code == 200) {
								uni.showToast({
									title: '删除完成',
									icon: 'success'
								});
								
								store.commit('dialogue/setDiaData', {
									'resetFlag': true
								});	
								
								/* uni.switchTab({
									url: '/pages/index/entity'
								}); */
							}else{
								uni.showToast({
									title: res.data.msg,
									icon: "none"
								})
							}
						}).catch(e => {
							console.log(e);
						}).finally(() => {
							uni.hideLoading();
						});
					}
				},
			},
			'modalShow': true,
			'modalPageId': pageId
		});
	},
}