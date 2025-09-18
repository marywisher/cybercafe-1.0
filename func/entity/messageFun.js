import dialogueQuery from "../dbManager/dialogueQuery";
import common from "../common/common";
import store from "@/store";
import responseFun from "./responseFun";
//import promptFun from "./promptFun";
import baseQuery from "../dbManager/baseQuery";

export default{
	async getMessage(){
		let message_list = await dialogueQuery.getMessageByEntityId();
		//console.log(message_list);
		if(message_list.length == 0) return;
		let history_list = [];
		let ai_id = message_list[0].ai_id;
		message_list.reverse();
		let message_id = message_list[0].message_id;
		if(message_list.length > 0){
			for (let i in message_list) {
				let message = message_list[i];
				history_list[i] = {
					message_id: message.message_id,
					character_id: message.character_id,
					html: common.textToHtml(message.message_content, 
						message.character_id == 0 ? 'right' : 'left', true),
					text: message.message_content,
					message_time: message.message_time
				}
			}
			//console.log('historylist:' + JSON.stringify(history_list));
			store.state.dialogue.historylist = store.state.dialogue.historylist ? 
				history_list.concat(store.state.dialogue.historylist) : history_list;
			//console.log(JSON.stringify(store.state.dialogue.historylist));
			store.commit('dialogue/setDiaData', {
				'historylist': store.state.dialogue.historylist
			});
			//console.log(store.state.dialogue.breakpointMessageId);
			if(store.state.dialogue.breakpointMessageId == 0){
				let last_history = history_list[history_list.length - 1];
				let message_time = last_history ? last_history.message_time : 0;
				//console.log(message_time);
				let option_list = await responseFun.getResponseByAiId(ai_id);
				if(option_list == false){
					option_list = [{
						html: common.textToHtml(last_history.text),
						text: last_history.text,
					}];
				}
				store.commit('dialogue/setDiaData', {
					'messageTime': message_time,
					'optionFirst': last_history.text,
					'crtCharacterId': last_history.character_id,
					'cDisplayId': last_history.character_id,
					'options': option_list
				});
			}
			//promptFun.preOperation();
			//console.log(message_id);
			store.commit('dialogue/setDiaData', {
				'breakpointMessageId': message_id,
				'refreshList': true
			});
		}
	},
	getChatHistory(lengthLimit, include_option = true) {
		//预处理
		let history_list = store.state.dialogue.historylist;
		let last_message = history_list[history_list.length - 1];
		//console.log(history_list);
		let history_text_length = 0;
		if(include_option) history_text_length = last_message.text.length;
		let temp_history_list = [];
		for (let i = history_list.length - 1; i >= 0; i --){
			temp_history_list.unshift(history_list[i]);
			history_text_length += history_list[i].text.length;
			if(history_text_length > lengthLimit * 1.5) break;
		} 
		if(include_option) temp_history_list.push(last_message);
		//console.log(store.state.dialogue.historylist);
		//console.log(store.state.dialogue.crtCharacterId);
		let text_length = 0;
		
		//console.log(cdata);
		let tmp_str = '';
		for (let i in temp_history_list) {
			tmp_str += (temp_history_list[i].character_id > 0 ? 
				store.state.dialogue.characterlist[temp_history_list[i].character_id].character_name
				: store.state.dialogue.me)
				+ ':' + temp_history_list[i].text + ' ';
		}
		return tmp_str;
	},
	async saveMessage(ai_id, content, operation, need_refresh = true) {//新消息或重说，主控说
		//存消息
		//let content = response.choices[0].message.content;
		//console.log('ai_id:' + JSON.stringify(ai_id));
		//console.log('crtCharacterId:' + store.state.dialogue.crtCharacterId);
		let message_id = await dialogueQuery.createMessage(ai_id, content, operation);
		//console.log(message_id);
		if(message_id != 'update'){//新消息
			//整理数据
			let new_data = {
				message_id: message_id,
				message_time: store.state.dialogue.messageTime,
				character_id: store.state.dialogue.crtCharacterId,
				text: store.state.dialogue.optionFirst,
				html: common.textToHtml(store.state.dialogue.optionFirst, 
					store.state.dialogue.crtCharacterId == 0 ? 'right' : 'left', true),
			};
			//console.log(new_data);
			let history_list = store.state.dialogue.historylist;
			history_list.push(new_data);
			store.commit('dialogue/setDiaData', {
				'historylist': history_list,
				'cDisplayId': store.state.dialogue.crtCharacterId,
				'refreshList': need_refresh,
			});
			//console.log(history_list);
			let tmp_content = store.state.setting.editContent;
			tmp_content[store.state.setting.entityId] = '';
			store.commit('setting/setSettingData', {
				'editContent': tmp_content
			});
		}
		uni.hideLoading();
	},
	updateMessage(operation, need_refresh = true) {//修改文本
		baseQuery.updateDataByKey('cybercafe_message', {
			'message_content': store.state.dialogue.optionFirst,
			'operation_content': operation
		},{
			'message_time': store.state.dialogue.messageTime
		});
		//console.log('optionFirst:', store.state.dialogue.optionFirst);
		let history_list = store.state.dialogue.historylist;
		let last_text = store.state.dialogue.optionFirst;
		let last_html = common.textToHtml(last_text, 
			history_list[history_list.length - 1].character_id == 0 ? 'right' : 'left', true);
		//console.log(last_text);
		history_list[history_list.length - 1].text = last_text;
		history_list[history_list.length - 1].html = last_html;
		store.commit('dialogue/setDiaData', {
			'historylist': history_list,
			'refreshList': need_refresh,
		});
		let tmp_content = store.state.setting.editContent;
		tmp_content[store.state.setting.entityId] = '';
		store.commit('setting/setSettingData', {
			'editContent': tmp_content
		});
		//console.log(store.state.dialogue.historylist);
		uni.hideLoading();
	},
}