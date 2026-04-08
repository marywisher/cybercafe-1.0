import dialogueQuery from "../dbManager/dialogueQuery";
import common from "../common/common";
import store from "@/store";
import responseFun from "./responseFun";
import baseQuery from "../dbManager/baseQuery";

export default{
	async getMessage(){
		let message_list = await dialogueQuery.getMessageByEntityId();
		//console.log(message_list);
		if(message_list.length == 0) return;
		let history_list = [];
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
					message_time: message.message_time,
					prev_message_time: message.prev_message_time,
					ai_id: message.ai_id
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
				let prev_message_time = last_history ? last_history.prev_message_time : 0;
				let ai_id = last_history ? last_history.ai_id : 0;
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
					'prevMessageTime': prev_message_time,
					'crtCharacterId': last_history.character_id,
					'cDisplayId': last_history.character_id,
					'optionFirst': last_history.text,
					'options': option_list
				});
			}
			//console.log(message_id);
			store.commit('dialogue/setDiaData', {
				'breakpointMessageId': message_id,
				'refreshList': -2
			});
		}
	},
	getChatHistory(lengthLimit, include_option = true) {
		//预处理
		let history_list = store.state.dialogue.historylist;
		let last_message = history_list[history_list.length - 1];//.pop();
		//console.log(history_list);
		let history_text_length = 0;
		if(include_option) history_text_length = last_message.text.length;
		let temp_history_list = [];
		for (let i = history_list.length - 1; i >= 0; i --){
			temp_history_list.unshift(history_list[i]);
			history_text_length += history_list[i].text.length;
			if(history_text_length > lengthLimit * 1.5) break;
		} 
		if(!include_option) temp_history_list.pop();
		//console.log(store.state.dialogue.historylist);
		//console.log(store.state.dialogue.crtCharacterId);
		let text_length = 0;
		
		//console.log(cdata);
		let tmp_str = '';
		for (let i in temp_history_list) {
			tmp_str += temp_history_list[i].text + ' ';
		}
		//store.state.dialogue.history_list.push(last_message);
		//console.log(store.state.dialogue.historylist);
		return tmp_str;
	},
	async saveMessage(ai_id, content, operation, entity_id) {//新消息或重说，主控说
		//存消息
		//let content = response.choices[0].message.content;
		//console.log('ai_id:' + JSON.stringify(ai_id));
		//console.log('crtCharacterId:' + store.state.dialogue.crtCharacterId);
		let message_id = await dialogueQuery.createMessage(ai_id, content, operation, entity_id);
		//console.log(message_id);
		let history_list = store.state.dialogue.historylist;
		if(message_id == 'update'){//重说
			let last_data = history_list[history_list.length - 1];
			last_data['text'] = content;
			last_data['html'] = common.textToHtml(content, 
				store.state.dialogue.crtCharacterId == 0 ? 'right' : 'left', true);
			last_data['ai_id'] = last_data['ai_id'] + ',' + ai_id;
			if(entity_id == store.state.setting.entityId){
				history_list[history_list.length - 1] = last_data;
				store.commit('dialogue/setDiaData', {
					'refreshList': -1,
				});
			}
		}else{//新消息
			//整理数据
			let new_data = {
				message_id: message_id,
				message_time: store.state.dialogue.messageTime,
				character_id: store.state.dialogue.crtCharacterId,
				text: content,
				html: common.textToHtml(content, 
					store.state.dialogue.crtCharacterId == 0 ? 'right' : 'left', true),
				prev_message_time: store.state.dialogue.prevMessageTime,
				ai_id: ai_id
			};
			//console.log(new_data);
			if(entity_id == store.state.setting.entityId){
				history_list.push(new_data);
				store.commit('dialogue/setDiaData', {
					'cDisplayId': store.state.dialogue.crtCharacterId,
					'refreshList': 0
				});
			}
			//console.log(history_list);
		}
		if(entity_id == store.state.setting.entityId){
			store.commit('dialogue/setDiaData', {
				'historylist': history_list,
				'optionFirst': content,
			});
		}
		//console.log(store.state.dialogue.optionFirst);
		let tmp_content = store.state.setting.editContent;
		tmp_content[entity_id] = '';
		store.commit('setting/setSettingData', {
			'editContent': tmp_content
		});
		uni.hideLoading();
		
		this.addToSummarizingData(content);
	},
	async updateMessage(operation, content_index) {//修改文本
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
			'refreshList': content_index,
		});
		let tmp_content = store.state.setting.editContent;
		tmp_content[store.state.setting.entityId] = '';
		store.commit('setting/setSettingData', {
			'editContent': tmp_content
		});
		//console.log(store.state.dialogue.historylist);
		uni.hideLoading();
		
		this.addToSummarizingData(store.state.dialogue.optionFirst);
	},
	async injectPrologue(character_id) {//注入开场白，仅用在创建本地切片初始
		//console.log(character_id);
		if(character_id == 0) return;
		let detail_data = await baseQuery.getDataByKey('cybercafe_entity_detail', {'character_id': character_id});
		//console.log(detail_data);
		if(detail_data.length > 0){
			let character_data = await baseQuery.getDataByKey('cybercafe_character', {'character_id': character_id});
			if(character_data.length > 0){
				let content = common.textOperation(character_data[0].character_prologue, '你').text;
				
				let entity_id = detail_data[0].entity_id;
				let message_time = common.getCurrentTimeStampStr(true);
				let store_data = {
					'messageTime': message_time,
					'prevMessageTime': '0',
					'crtCharacterId': character_id,
					'entityId': entity_id,
				}
				let message_id = await dialogueQuery.createMessage(0, content, message_time + ':creating', entity_id, store_data);
				//console.log(message_id);
				let tmp_content = store.state.setting.editContent;
				tmp_content[entity_id] = '';
				store.commit('setting/setSettingData', {
					'editContent': tmp_content
				});
				
				this.addToSummarizingData(content, message_time);
			}
		}
		uni.hideLoading();
	},
	async summarizeFun(content, message_times){
		//总结剧情
		try{
			let summarize_content = await responseFun.toolRequest('summarize', content, 'chat');
			//console.log(typeof summarize_content);
			if(typeof summarize_content == 'string' && common.isJsonString(summarize_content)){
				let json_summarize = JSON.parse(summarize_content);
				if(json_summarize.hasOwnProperty('summary')){
					summarize_content = json_summarize.summary;
				}
			}else if(typeof summarize_content == 'object'){
				summarize_content = summarize_content.summary;
			}else if(typeof summarize_content != 'string'){
				//console.log(summarize_content);
				return;
			}
			console.log(summarize_content, store.state.dialogue.messageTime);
			//更新entity表
			let crt_entity_data = await baseQuery.getDataByKey('cybercafe_entity', {
				'entity_id': store.state.setting.entityId
			})
			let new_description = (crt_entity_data[0].extra_description || crt_entity_data[0].extra_description != 'null') 
				? crt_entity_data[0].extra_description : '';
			new_description = new_description ? (new_description + ' ' + summarize_content) : summarize_content;
			baseQuery.updateDataByKey('cybercafe_entity', {
				'extra_description': new_description
			},{
				'entity_id': store.state.setting.entityId
			})

			//保存入summary表
			baseQuery.updateDataByKey('cybercafe_summary_message', {
				'message_times': message_times,
				'summary_content': summarize_content,
				'entity_id': store.state.setting.entityId
			});
		}catch(error){
			uni.showToast({
				title: error,
				icon: 'none'
			})
		}
	},
	async getSummary(){//初始化加载没总结的消息
		let summary_list = await dialogueQuery.getSummaryMessageByEntityId();
		//获取当前已总结的时间戳
		let last_summary_time = '';
		if(summary_list.length > 0){
			let last_summary_times = summary_list[summary_list.length - 1].message_times;
			let last_summary_time_list = last_summary_times.split(',')
			if(last_summary_time_list.length > 0)
				last_summary_time = last_summary_time_list[last_summary_time_list.length - 1];
		}

		let summarizing_data = store.state.setting.summarizingData;
		if(!summarizing_data){
			summarizing_data = {};
		}
		if(!summarizing_data[store.state.setting.entityId]){
			summarizing_data[store.state.setting.entityId] = {};
		}
		if(summarizing_data[store.state.setting.entityId]){
			if((last_summary_time.length > 0 && summarizing_data[store.state.setting.entityId]['0'].length > 0 
				&& BigInt(last_summary_time) < BigInt(summarizing_data[store.state.setting.entityId]['0']))
			|| (last_summary_time.length == 0 && summarizing_data[store.state.setting.entityId]['0'].length > 0)){
				last_summary_time = summarizing_data[store.state.setting.entityId]['0'];
			}
		}

		//由这个时间戳以后的消息加载入store
		let message_list = [];
		if(last_summary_time.length > 0){
			message_list = await dialogueQuery.getMessageAfterMessageTime(last_summary_time);
		}else{
			message_list = await dialogueQuery.getMessageAfterMessageTime('0');
		}

		message_list.forEach(message => {
			summarizing_data[store.state.setting.entityId][message.message_time] = message.message_content;
			summarizing_data[store.state.setting.entityId]['0'] = message.message_time;
		});
		store.commit('setting/setSettingData', {
			'summarizingData': summarizing_data
		});

		if(Object.keys(summarizing_data[store.state.setting.entityId]).length > 101){
			this.judgeSummary();
		}
	},
	async judgeSummary(){
		//计算summarizingData对应值长度
		let summary_length = 0;
		let summarizing_data = store.state.setting.summarizingData;
		let entity_id = store.state.setting.entityId;
		let entity_summary_data = summarizing_data[entity_id];
		let content = '';
		let message_time_list = [];
		for(let message_time in entity_summary_data){
			if(message_time == '0') continue;
			if(summary_length >= store.state.setting.maxToken) break;
			content += entity_summary_data[message_time];
			summary_length += entity_summary_data[message_time].length;
			message_time_list.push(message_time);
		};
		let message_times = message_time_list.join(',');
		//取超出部分进行总结
		await this.summarizeFun(content, message_times);

		//从summarizingData移除对应部分
		message_time_list.forEach(message_time => {
			this.removeSummarizingData(message_time, summarizing_data, false);
		})
		store.commit('setting/setSettingData', {
			'summarizingData': summarizing_data
		});
	},
	addToSummarizingData(content, message_time = store.state.dialogue.messageTime){
		let summarizing_data = store.state.setting.summarizingData;
		if(!summarizing_data){
			summarizing_data = {};
		}
		if(!summarizing_data[store.state.setting.entityId]){
			summarizing_data[store.state.setting.entityId] = {};
		}
		summarizing_data[store.state.setting.entityId][message_time] = content;
		summarizing_data[store.state.setting.entityId]['0'] = message_time;
		store.commit('setting/setSettingData', {
			'summarizingData': summarizing_data
		});
	},
	removeSummarizingData(message_time, 
		summarizing_data = null,
		need_save = true){
		if(!summarizing_data){
			summarizing_data = store.state.setting.summarizingData;
		}
		let entity_id = store.state.setting.entityId;
		if(summarizing_data[entity_id] && summarizing_data[entity_id][message_time]){
			delete summarizing_data[entity_id][message_time];
			// 如果删除的是最新的，需要更新 '0'
			if(summarizing_data[entity_id]['0'] == message_time){
				// 找出剩余的最大时间戳
				let max_time = '0';
				for(let key in summarizing_data[entity_id]){
					if(key != '0' && key > max_time){
						max_time = key;
					}
				}
				summarizing_data[entity_id]['0'] = max_time;
			}
		}
		if(need_save){
			store.commit('setting/setSettingData', {
				'summarizingData': summarizing_data
			});
		}
	}
}