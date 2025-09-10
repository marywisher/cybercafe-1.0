import dialogueQuery from "../dbManager/dialogueQuery";
import common from "../common/common";
import store from "@/store";
import messageFun from "./messageFun";

export default{
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
						
			return response_list;
		}else{
			return false;
		}
	},
	responseToOptions(rel) {
		//异步返回值处理
		console.log(rel.value);
		try{
			if(!rel.value.hasOwnProperty('content')){
				throw '返回值结构不支持，请联系管理员';
			}
			if(!rel.value.content.hasOwnProperty('choices')){
				throw '返回值结构不支持，请联系管理员';
			}
			if('choices' in rel.value.content){
				let usage = rel.value.content.usage;
				let model = rel.value.content.model;
				let optionList = store.state.dialogue.options;
				
				//console.log(model);
				let db_content = JSON.stringify(rel.value.content);
				//console.log(db_content);
				
				let content = [];
				for(let i in rel.value.content.choices){
					if(!rel.value.content.choices[i].hasOwnProperty('message')){
						throw '返回值结构不支持，请联系管理员';
					}
					content[i] = rel.value.content.choices[i].message.content;
					let content_html = common.textToHtml(content[i], 
						store.state.dialogue.cdisplayid ? 'left' : 'right',
						true);
					optionList.push({
						text: content[i],
						html: content_html,
						usage: usage,
						model: model,
					});
					console.log(JSON.stringify(optionList));
					store.commit('dialogue/setDiaData', {
						key: 'options',
						data: optionList
					});
				}
				this.insertResponse(db_content, content, model);
			}
		}
		catch(err) {
			store.commit('user/setUserData',
				{
					'modalData':
						{
							content: err,
							cancelText: '晓得了'
						},
					'modalShow': true,
					'modalPageId': 'chat'
				});
		}
		finally{
			uni.hideLoading();
		}
	},
	async insertResponse(db_content, content, model){
		let aiId = await dialogueQuery.insertDataByKey('cybercafe_ai_response', {
				'api_return': JSON.stringify(db_content),
				'ai_content': content.join('|'),
				'api_created_at': common.getCurrentTimeStampStr(),
				'entity_id': store.state.setting.entityId,
				'ai_type': model
			}, true);
		//console.log(aiId);
		let operation = '';
		if (store.state.dialogue.optionFlag == true) {
			store.commit('dialogue/setDiaData', {
				'optionFirst': content[0],
				'optionFlag': false
			});
				
			operation = store.state.dialogue.messageTime + ':character.select:'
				+ (store.state.dialogue.crtCharacterId > 0 ? 
					store.state.dialogue.characterlist[store.state.dialogue.crtCharacterId].character_name :
					store.state.dialogue.me) 
				+ ':' + model;
			//console.log(operation);
		}
		//console.log(store.state.dialogue.optionFlag);
		messageFun.saveMessage(aiId, content[0], operation);
	},
}