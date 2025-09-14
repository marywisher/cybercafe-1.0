//发消息前的数据准备
import store from "@/store";
import baseQuery from "../dbManager/baseQuery";
import common from "../common/common";
import messageFun from "./messageFun";

export default {
	async loadTreeOrder(){
		let list = {};
		//读取当前容器的设子结构，组织成list
		//console.log(this.entityId);
		let entity_data = await baseQuery.getDataByKey('cybercafe_entity', {'entity_id': store.state.setting.entityId});
		//console.log(entity_data[0].entity_tree_order);
		if(entity_data && entity_data[0].entity_tree_order) list = JSON.parse(entity_data[0].entity_tree_order);
		else list = JSON.parse(store.state.setting.globalTreeOrder);
		//读预设
		let prompt = store.state.setting.customPrompt[store.state.setting.promptSelect];
		for(let key in prompt){
			if(key == '系统提示词') continue;
			this.addToList(key, list);
		}
		//再读切片，以防个性化设置
		let detail_data = await baseQuery.getDataByKey('cybercafe_entity_detail', {'entity_id': store.state.setting.entityId});
		for(let i = 0; i < detail_data.length; i ++){
			let character_id = detail_data[i].character_id;
			//console.log(character_id);
			let character_data = await baseQuery.getDataByKey('cybercafe_character', {'character_id': character_id});
			if(character_data && character_data[0].character_description 
				&& common.isJsonString(character_data[0].character_description)){
				//console.log(character_data[0].character_description);
				let character_json = JSON.parse(character_data[0].character_description);
				for(let key in character_json.基础信息){
					//console.log(key);
					this.addToList(key, list);
				}
				for(let key in character_json.扩展信息){
					//console.log(key);
					this.addToList(key, list);
				}
			}
		}
		return list;
	},
	addToList(key, list){
		let is_in_list = false;
		for(let j = 0; j < list.length; j ++){
			if(list[j].title == key){
				is_in_list = true;
				break;
			} 
		}
		if(!is_in_list) list.push({
			id: list.length + 1,
			title: key,
			enable: true
		})
	},
	async preOperation(include_option = true){
		let list = await this.loadTreeOrder();
		//console.log(list);
		let character_name = 'test';
		if(store.state.dialogue.crtCharacterId == 0){
			character_name = store.state.dialogue.me;
		}else if(store.state.dialogue.crtCharacterId > 0){
			character_name = store.state.dialogue.characterlist[store.state.dialogue.crtCharacterId].character_name;
		}
		//console.log(character_name);
		let request_data = {
			"entity_id": store.state.setting.entityId,
			"time": store.state.dialogue.messageTime,
			"character_name": character_name,
		};
		request_data.messages = [];
		//默认系统提示词
		//console.log(store.state.setting.customPrompt)
		let sys_prompt = '';
		if(store.state.setting.customPrompt.length > 0){
			sys_prompt = store.state.setting.customPrompt[store.state.setting.promptSelect].系统提示词;
			sys_prompt = sys_prompt.replace(new RegExp('{{char}}', 'g'), character_name)
				.replace(new RegExp('{{user}}', 'g'), store.state.dialogue.me);
			request_data.messages[0] = {
				'role': 'system',
				'content': sys_prompt
			}
		}
		let content = '';
		let character_json = {};
		let character_data = await baseQuery.getDataByKey('cybercafe_character',
			{'character_id': store.state.dialogue.crtCharacterId});
		if(character_data && character_data[0].character_description
			&& common.isJsonString(character_data[0].character_description)){
			//console.log(character_data[0].character_description);
			character_json = JSON.parse(character_data[0].character_description);
		}else{
			content += ' ' + character_data[0].character_description;
		}
		for(let i in list){
			//console.log(list[i].id, list[i].title)
			//console.log(store.state.setting.customPrompt);
			if(list[i].title == '系统提示词') continue;
			if(list[i].title == '聊天记录'){//限定长度
				content += ' 以下是聊天记录:```{replacing_message_content}```'
			}else if(store.state.setting.customPrompt.length > 0 
				&& store.state.setting.customPrompt.hasOwnProperty(store.state.setting.promptSelect)
				&& store.state.setting.customPrompt[store.state.setting.promptSelect].hasOwnProperty(list[i].title)){
				let crt_global_prompt = store.state.setting.customPrompt[store.state.setting.promptSelect];
				if(list[i].title == '时间感知'){
					content += ' 现在是:' + this.getTimeStr(crt_global_prompt.时间感知)
				}else if(crt_global_prompt.hasOwnProperty(list[i].title)){
					content += ' ' + list[i].title + ':' + crt_global_prompt[list[i].title]
				}
			}else if(character_json.length > 0){
				//console.log(character_json);
				if(character_json){
					if(character_json.基础信息.hasOwnProperty(list[i].title)){
						content += ' ' + list[i].title + ':' + character_json.基础信息[list[i].title]
					}
					if(character_json.扩展信息.hasOwnProperty(list[i].title)){
						content += ' ' + list[i].title + ':' + character_json.扩展信息[list[i].title]
					}
				}
			}
			//console.log(content);
		}
		content = content.replace(new RegExp('{{char}}', 'g'), character_name)
			.replace(new RegExp('{{user}}', 'g'), store.state.dialogue.me);
		let content_length = content.length + sys_prompt.length;
		store.commit('setting/setSettingData',{
			'promptLength': content_length
		});
		console.log(store.state.setting.tokenSetting - content_length);
		//字数超限提示
		if(content_length > store.state.setting.tokenSetting){
			return;
		}
		let history_str = messageFun.getChatHistory(store.state.setting.tokenSetting - content_length, include_option);
		//console.log(history_str);
		/* if(history_str == 0){
			history_str = store.state.dialogue.characterlist[store.state.dialogue.crtCharacterId].character_name 
				+ ':' + character_json.开场白 + ' '
		} */
		content = content.replace('{replacing_message_content}', history_str);
		content_length = content.length;
		//console.log(content_length);
		request_data.messages.push({
			'role': 'user',
			'content': content
		})
		//console.log(request_data);
		store.commit('dialogue/setDiaData', {
			'chatlist': request_data,
		});
	},
	getTimeStr(prompt){
		console.log(prompt);
		const now = new Date();
		let return_str = '';
		if(prompt.includes('year')) return_str += now.getFullYear() + '年';
		// getMonth() 返回的月份从0开始，所以需要+1
		if(prompt.includes('month')) return_str += String(now.getMonth() + 1) + '月';
		if(prompt.includes('day')) return_str += String(now.getDate()) + '日';
		if(prompt.includes('time')) return_str += String(now.getHours()).padStart(2, '0') 
			+ ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
		if(prompt.includes('week')){
			let day = now.getDay();
			switch(day){
				case 1:
					day = '星期一';
				break;
				case 2:
					day = '星期二';
				break;
				case 3:
					day = '星期三';
				break;
				case 4:
					day = '星期四';
				break;
				case 5:
					day = '星期五';
				break;
				case 6:
					day = '星期六';
				break;
				default: //0
					day = '星期日';
				break;
			}
			return_str += day;
		}
		return return_str;
	}
}