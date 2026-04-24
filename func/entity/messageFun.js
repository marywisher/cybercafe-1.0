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
		await baseQuery.updateDataByKey('cybercafe_message', {
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
	async summarizeFun(content, entity_id, is_new = false){
		console.log('summarizeFun, entity_id:', entity_id, 'is_new:', is_new);
		if(!entity_id > 0){
			console.log('非有效实体消息，不予总结');
			return false;
		}
		//总结剧情
		try{
			let crt_entity_data = await baseQuery.getDataByKey('cybercafe_entity', {
				'entity_id': entity_id
			});
			let pre_description = '';
			if(!is_new && crt_entity_data[0].extra_description && crt_entity_data[0].extra_description != 'null'){
				pre_description = crt_entity_data[0].extra_description;
			}
			let tmp_timestamp = common.getCurrentTimeStampStr(true);
			let request_id = store.state.user.userKey + '-' + tmp_timestamp;
			let summaryRequest = store.state.setting.summaryRequest;
			summaryRequest[entity_id] = request_id;
			store.commit('setting/setSettingData', {
				'summaryRequest': summaryRequest
			});
			console.log('summaryRequest:', store.state.setting.summaryRequest);
			let summarize_result = await responseFun.toolRequest('summarize2', {
				'des': pre_description,
				'content': content
			}, 'entity', tmp_timestamp);//summarize2和原方法区分，向后兼容，异步执行

			if(summarize_result.status == 'success'){
				console.log('summarize_result:', summarize_result);
				setTimeout(() =>{
					this.getResponseReturn(entity_id);
				}, 120000);//120秒后获取总结结果，更新entity表和summary表
			}
		}catch(error){
			uni.showToast({
				title: error,
				icon: 'none'
			})
		}
	},
	async getSummary(){//初始化加载没总结的消息
		let summary_list = await dialogueQuery.getSummaryMessageByEntityId();
		//console.log(summary_list);
		//获取当前已总结的时间戳
		let last_summary_time = '';
		if(summary_list.length > 0){
			let last_summary_times = summary_list[summary_list.length - 1].message_times;
			let last_summary_time_list = last_summary_times.split(',')
			if(last_summary_time_list.length > 0)
				last_summary_time = last_summary_time_list[last_summary_time_list.length - 1];
		}
		console.log(last_summary_time);
		let summarizing_data = {};
		if(store.state.setting.hasOwnProperty("summarizingData")){
			summarizing_data = store.state.setting.summarizingData;
		}
		//console.log(summarizing_data);
		if(!summarizing_data.hasOwnProperty(store.state.setting.entityId)){
			summarizing_data[store.state.setting.entityId] = {};
		}
		//console.log(summarizing_data[store.state.setting.entityId]);
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
		//console.log(summarizing_data);
		console.log('entityId:', store.state.setting.entityId, 'last_summary_time:', last_summary_time);
		this.judgeSummary(last_summary_time == '');
	},
	async judgeSummary(is_new = false){
		let entity_id = store.state.setting.entityId;
		console.log('judgeSummary, entity_id:', entity_id, 'is_new:', is_new);
		let summarizing_data = store.state.setting.summarizingData;
		let entity_summary_data = summarizing_data[entity_id];
		if(!entity_summary_data){
			console.log('未找到entity_id为' + entity_id + '的待总结数据');
			return;
		}
		if(Object.keys(entity_summary_data).length < 101){
			console.log('待总结长度不足，不予执行');
			return;
		}
		//计算summarizingData对应值长度
		let summary_length = 0;
		let summary_count = 0;
		let content = '';
		let message_time_list = [];
		for(let message_time in entity_summary_data){
			if(message_time == '0'){
				continue;
			} 
			if(summary_length >= store.state.setting.maxToken || 
				summary_count > Object.keys(summarizing_data[store.state.setting.entityId]).length / 2) break;
			content += entity_summary_data[message_time];
			summary_length += entity_summary_data[message_time].length;
			message_time_list.push(message_time);
			summary_count ++;
		};
		//取超出部分进行总结
		await baseQuery.insertDataByKey('cybercafe_summary_message', {
			'message_times': message_time_list.join(','),
			'request_id': store.state.setting.summaryRequest[entity_id],
			'summary_content': '',
			'entity_id': entity_id
		});
		//console.log(content, message_time_list, is_new);
		this.summarizeFun(content, entity_id, is_new);
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

		this.judgeSummary();
	},
	removeSummarizingData(message_time, 
		summarizing_data = null,
		entity_id = null,
		from_menu = true){//删除消息时才需要同步0键，总结完的删除不用更新0键
		if(!summarizing_data){
			summarizing_data = store.state.setting.summarizingData;
		}
		if(!entity_id){
			entity_id = store.state.setting.entityId;
		}
		if(summarizing_data[entity_id] && summarizing_data[entity_id][message_time]){
			delete summarizing_data[entity_id][message_time];
			// 如果删除的是最新的，需要更新 '0'
			if(summarizing_data[entity_id]['0'] == message_time && from_menu){
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
		if(from_menu){
			store.commit('setting/setSettingData', {
				'summarizingData': summarizing_data
			});
		}
	},
	getSummaryDescription(summary_result){
		let result_content = '';
		summary_result.forEach(function(stage_summary) {
			if(stage_summary.hasOwnProperty('description')){
				console.log(stage_summary.description);
				result_content += ' ' + stage_summary.description;
			}
		}, this);
		return result_content;
	},
	async getResponseReturn(entity_id){
		let summaryRequest = store.state.setting.summaryRequest;
		let summarizing_data = store.state.setting.summarizingData;
		if(!summaryRequest.hasOwnProperty(entity_id) || summaryRequest[entity_id] == ''){
			console.log('无效的参数，不予获取总结结果');
			return false;
		}
		if(!entity_id){
			console.log('无效的容器ID');
			return false;
		}else if(entity_id != parseInt(entity_id)){//entity_id必须为整数
			console.log('非法容器ID');
			delete summaryRequest[entity_id];
			store.commit('setting/setSettingData', {
				'summaryRequest': summaryRequest
			});
			return false;
		}
		console.log('getResponseReturn, entity_id:', entity_id);
		let request_id = store.state.setting.summaryRequest[entity_id];
		console.log('getResponseReturn, request_id:', request_id);
		if(!request_id || request_id == ''){
			console.log('无效请求ID');
			return false;
		}
		let summarize_result = await responseFun.getRequestCallback(request_id, 'entity');
		console.log('getResponseReturn, summarize_result:', summarize_result);
		if(summarize_result.status == 'success'){
			console.log(typeof summarize_result.content);
			let callback_data = summarize_result.content;
			let summarize_content = '';
			if(typeof callback_data == 'string' && common.isJsonString(callback_data)){
				let summarize_json = JSON.parse(callback_data);
				if(summarize_json.hasOwnProperty('relationship_evolution')){
					summarize_content = this.getSummaryDescription(summarize_json.relationship_evolution);
				}else{
					return false;
				}
			}else if(typeof callback_data == 'object' && callback_data.hasOwnProperty('relationship_evolution')){
				summarize_content = this.getSummaryDescription(callback_data.relationship_evolution);
			}else{
				//console.log(callback_data);
				return false;
			}
			//更新entity表
			let crt_entity_data = await baseQuery.getDataByKey('cybercafe_entity', {
				'entity_id': entity_id
			});
			let pre_description = '';
			if(crt_entity_data[0].extra_description && crt_entity_data[0].extra_description != 'null'){
				pre_description = crt_entity_data[0].extra_description;
			}
			console.log('pre_description:', pre_description);
			let new_description = pre_description ? (pre_description + ' ' + summarize_content) : summarize_content;
			let update_result = await baseQuery.updateDataByKey('cybercafe_entity', {
				'extra_description': new_description
			},{
				'entity_id': entity_id
			})
			console.log('update entity result:', update_result);
			//保存入summary表
			let request_data = await baseQuery.getDataByKey('cybercafe_summary_message', {
				'request_id': request_id
			});
			console.log('summary table request data:', request_data);
			if(request_data.length > 0 && request_data[0].message_times && request_data[0].message_times.length > 0){
				//只更新，不插入
				let summary_update_result = await baseQuery.updateDataByKey('cybercafe_summary_message', {
					'summary_content': callback_data
				},{
					'request_id': request_id
				});
				console.log('summary update result:', summary_update_result);
				let message_times = request_data[0].message_times.split(',');
				//从summarizingData移除对应部分
				console.log('待移除的message_times:', message_times);
				message_times.forEach(message_time => {
					console.log('移除message_time:', message_time);
					this.removeSummarizingData(message_time, summarizing_data, entity_id, false);
				})
				console.log('update summarizingData:', Object.keys(summarizing_data));
			}else if(request_data.length > 0){
				console.log('未找到对应的message_times，无法更新summary表');
				await baseQuery.deleteDataByKey('cybercafe_summary_message', {
					'request_id': request_id
				});
			}
		}
		//只有一次更新机会，无论成功与否都删除summaryRequest对应项，避免陷入请求死循环
		delete summaryRequest[entity_id];
		store.commit('setting/setSettingData', {
			'summarizingData': summarizing_data,
			'summaryRequest': summaryRequest
		});
		console.log('已移除待总结数据，等待获取总结结果');
	}
}