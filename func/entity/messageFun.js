import dialogueQuery from "../dbManager/dialogueQuery";
import common from "../common/common";
import store from "@/store";
import responseFun from "./responseFun";
import promptFun from "./promptFun";

export default{
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
				//console.log(ai_id);
				let option_list = await responseFun.getResponseByAiId(ai_id);
				if(option_list == false){
					option_list = [{
						html: common.textToHtml(lastHistory.text),
						text: lastHistory.text,
					}];
				}
				store.commit('dialogue/setDiaData', {
					'messageTime': message_time,
					'optionFirst': lastHistory.text,
					'crtCharacterId': lastHistory.character_id,
					'options': option_list
				});
			}
			promptFun.preOperation();
			//console.log(message_id);
			store.commit('dialogue/setDiaData', {
				'breakpointMessageId': message_id,
				'refreshList': true
			});
		}
	},
	getChatHistory(lengthLimit) {
		//预处理
		let historyList = store.state.dialogue.historylist;
		//let last_message = historyList.pop();
		//console.log(historyList);
		let history_text_length = 0;
		let temp_history_list = [];
		for (let i = historyList.length - 1; i >= 0; i --){
			temp_history_list.unshift(historyList[i]);
			history_text_length += historyList[i].text.length;
			if(history_text_length > lengthLimit * 1.5) break;
		} 
		//console.log(history_text_length);
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
	async saveMessage(ai_id, content, operation) {
		//存消息
		//let content = response.choices[0].message.content;
		//console.log('ai_id:' + JSON.stringify(ai_id));
		//console.log('message_time:' + store.state.dialogue.messageTime);
		let message_id = await dialogueQuery.createMessage(ai_id, content, operation);
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
	
			let historyList = store.state.dialogue.historylist;
			historyList.push(new_data);
			store.commit('dialogue/setDiaData', {
				'historylist': historyList,
				'cdisplayid': store.state.dialogue.crtCharacterId,
				'refreshList': true,
			});
		}
		uni.hideLoading();
	},
	updateMessage(operation) {
		dialogueQuery.updateDataByKey('cybercafe_message', {
			'message_content': store.state.dialogue.optionFirst,
			'operation_content': operation
		},{
			'message_time': store.state.dialogue.messageTime
		});
		//console.log('optionFirst:', store.state.dialogue.optionFirst);
		let historyList = store.state.dialogue.historylist;
		let last_text = store.state.dialogue.optionFirst;
		let last_html = common.textToHtml(last_text, 
			historyList[historyList.length - 1].character_id == 0 ? 'right' : 'left', true);
		//console.log(last_text);
		historyList[historyList.length - 1].text = last_text;
		historyList[historyList.length - 1].html = last_html;
		store.commit('dialogue/setDiaData', {
			'historylist': historyList,
			'refreshList': true,
		});
		//console.log(store.state.dialogue.historylist);
		uni.hideLoading();
	},
}