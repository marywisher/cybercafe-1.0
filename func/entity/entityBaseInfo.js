import baseQuery from "../dbManager/baseQuery";
import dialogueQuery from "../dbManager/dialogueQuery";
import request from "../common/request";
import store from "@/store";
import common from "../common/common";

export default{
	async getEntityId(entity_id = 0){
		return new Promise((resolve, reject) => {
			request.post('entityController/getEntitySettings', {'entity_id': entity_id}).then(res => {
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
						'aiSelect': store.state.dialogue.aiRange[res.result.api_id].nickName,//res.result.ai_select
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
		//console.log(store.state.setting.entityId);
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
	async getMessage(){
		let messageList = await dialogueQuery.getMessageByEntityId();
		//console.log(messageList);
		if(messageList.length == 0) return;
		let historyList = [];
		let ai_id = messageList[0].ai_id;
		messageList.reverse();
		let message_id = messageList[0].message_id;
		if(messageList.length > 0){
			for (let i in messageList) {
				let message = messageList[i];
				historyList[i] = {
					message_id: message.message_id,
					character_id: message.character_id,
					html: common.textToHtml(message.message_content, 
						message.character_id == 0 ? 'right' : 'left', true),
					text: message.message_content,
					message_time: message.message_time
				}
			}
			//console.log('historylist:' + JSON.stringify(historyList));
			store.state.dialogue.historylist = store.state.dialogue.historylist ? 
				historyList.concat(store.state.dialogue.historylist) : historyList;
			//console.log(JSON.stringify(store.state.dialogue.historylist));
			store.commit('dialogue/setDiaData', {
				'historylist': store.state.dialogue.historylist
			});
			//console.log(store.state.dialogue.breakpointMessageId);
			if(store.state.dialogue.breakpointMessageId == 0){
				let lastHistory = historyList[historyList.length - 1];
				let message_time = lastHistory ? lastHistory.message_time : 0;
				store.commit('dialogue/setDiaData', {
					'messageTime': message_time,
					'optionFirst': lastHistory.text,
					'crtCharacterId': lastHistory.character_id
				});
				//console.log(ai_id);
				this.getResponseByAiId(ai_id);
			}
			this.beforeChat();
			//console.log(message_id);
			store.commit('dialogue/setDiaData', {
				'breakpointMessageId': message_id,
				'refreshList': true
			});
		}
	},
	async getResponseByAiId(ai_id){
		//console.log(ai_id);
		if(ai_id != '0'){
			let response_list = [];
			let responseList = await dialogueQuery.getResponseByResponseIds(ai_id);
			for(let j in responseList){
				let content_arr = responseList[j].ai_content.split('|');
				for(let i in content_arr){
					//console.log(content_arr[i]);
					response_list.push({
						//ai_id: responseList[j].ai_response_id,
						html: common.textToHtml(content_arr[i]),
						text: content_arr[i],
						usage: JSON.parse(responseList[j].api_return).usage,
						model: responseList[j].ai_type,
					});
				}
			}
						
			//console.log(JSON.stringify(response_list));
			store.commit('dialogue/setDiaData', {
				'options': response_list,
			});
		}else{
			store.commit('dialogue/setDiaData', { 
				'options': [] ,
			});
		}
	},
	beforeChat() {
		this.getIntroduction();
	
		this.getReadyChatData();
	},
	getIntroduction() {
		//console.log(store.state.dialogue.characterlist);
		//console.log(store.state.dialogue.crtCharacterId);
		let introduction = '';
		if (store.state.dialogue.crtCharacterId > 0 && store.state.dialogue.characterlist.hasOwnProperty(store.state.dialogue.crtCharacterId)){
			introduction = store.state.dialogue.characterlist[store.state.dialogue.crtCharacterId].character_name + '，'
				+ store.state.dialogue.characterlist[store.state.dialogue.crtCharacterId].character_description; // 人物详情
		}else{
			introduction = store.state.dialogue.characterlist[0].character_description + store.state.dialogue.characterlist[0].group_description;
		}
		//console.log(store.state.dialogue.crtCharacterId);
		store.commit('dialogue/setDiaData', {
			'introduction': introduction
		});
	},
	getReadyChatData() {
		//预处理
		let historyList = store.state.dialogue.historylist;
		let last_message = historyList.pop();
		//console.log(historyList);
		let history_text_length = 0;
		let temp_history_list = [];
		for (let i = historyList.length - 1; i >= 0; i --){
			temp_history_list.unshift(historyList[i]);
			history_text_length += historyList[i].text.length;
			if(history_text_length > 4000 * 1.5) break;
		} 
		//console.log(history_text_length);
		//console.log(store.state.dialogue.crtCharacterId);
		let text_length = 0;
		let introduction = store.state.dialogue.introduction;
		//console.log(introduction);
		let character_name = 'test';
		if(store.state.dialogue.crtCharacterId == 0){
			character_name = store.state.dialogue.me;
		}else if(store.state.dialogue.crtCharacterId > 0){
			character_name = store.state.dialogue.characterlist[store.state.dialogue.crtCharacterId].character_name;
		}
		//console.log(character_name);
		let cdata = {
			"entity_id": store.state.setting.entityId,
			"time": store.state.dialogue.messageTime,
			"character_name": character_name,
			"messages": [{
				"role": "system",
				"content": introduction +
					(store.state.dialogue.crtCharacterId > 0 ? store.state.dialogue.characterlist[0] : '')
			}],
		};
		
		//console.log(cdata);
		text_length += introduction.length + (store.state.dialogue.crtCharacterId > 0 ? store.state.dialogue
			.characterlist[0].length : 0);
	
		for (let i in temp_history_list) {
			let tmp_data = {
				"role": temp_history_list[i].character_id < 1 ? 'user' : 'assistant',
				"content": temp_history_list[i].text
			};
			//console.log(tmp_data);
			cdata.messages.push(tmp_data);
		}
		historyList.push(last_message);
		cdata.messages[cdata.messages.length - 1].role = 'user';
		store.commit('dialogue/setDiaData', {
			'chatlist': cdata,
		});
	},
	delEntity(){
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
						request.post("entityController/deleteEntity", {
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
		});
	},
}