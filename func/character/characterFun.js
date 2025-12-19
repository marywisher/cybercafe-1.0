import common from '@/func/common/common';
import baseQuery from '@/func/dbManager/baseQuery';
import entityFun from '@/func/entity/entityFun';
import store from '@/store';
import request from '../common/request';

export default{
	parseData(result_data, is_local = false){
		//console.log(result_data);
		let character_data = {
			'character_id': result_data.character_id,
			'character_name': result_data.character_name,
			'character_img': result_data.img_url,
			'character_prologue': result_data.character_prologue ? result_data.character_prologue : '',
			'character_created_at': result_data.character_created_at,
			'character_story': result_data.character_memo ? result_data.character_memo : ''
		};
		if(!is_local){
			let tag_list = [];
			if(result_data.hasOwnProperty('character_tag') && result_data.character_tag != ''){
				tag_list = result_data.character_tag.split('|');
			}
			character_data['character_gender'] = result_data.character_gender;
			character_data['character_tag'] = tag_list;
			character_data['character_key'] = result_data.character_key;
			character_data['character_view_count'] = result_data.character_view_count;
			character_data['character_link_count'] = result_data.character_link_count;
			character_data['character_creater_id'] = result_data.character_creater_id;
			character_data['user_nickname'] = result_data.user_nickname;
		}else{
			character_data['character_online_id'] = result_data.character_online_id;
		}
		
		let description_data = result_data.character_description;
		//console.log(description_data.substr(0, 1));
		if(!common.isJsonString(description_data)){
		//if(description_data.substr(0, 1) != '{'){
			//原数据结构
			//console.log(description_data);
			let pos = description_data.indexOf('\\n');
			if(pos == -1){
				pos = description_data.indexOf('\r\n');
			}
			if(is_local){
				let gender_pos = description_data.substr(0, pos).indexOf('，');
				if(gender_pos != -1){
					character_data.gender_cn = description_data.substr(0, gender_pos);
					character_data.character_gender = this.getGenderNum(character_data.gender_cn);
				}
				character_data.short_description = pos > -1 ? 
					common.textOperation(description_data.substring(gender_pos + 1, pos), '你').text
					: common.textOperation(description_data, '你').text;
			}else{
				character_data.short_description = pos > -1 ?
					common.textOperation(description_data.substring(0, pos), '你').text
					: common.textOperation(description_data, '你').text;
			}
			
			character_data.full_description = pos > -1 ? common.textOperation(description_data.substr(pos + 2), '你').text : '';
		}else{
			description_data = JSON.parse(description_data);
			//新结构
			//console.log(description_data)
			if(!character_data.character_gender || character_data.character_gender == 0){
				character_data.gender_cn = description_data.性别;
				character_data.character_gender = this.getGenderNum(description_data.性别);
			}
			if(description_data.hasOwnProperty('基础信息') && description_data.基础信息.hasOwnProperty('简介'))
				//console.log(description_data.基础信息.简介);
				character_data.short_description = common.textOperation(description_data.基础信息.简介, '你').text;
			if(description_data.hasOwnProperty('扩展信息') && description_data.扩展信息.hasOwnProperty('故事背景'))
				character_data.full_description = common.textOperation(description_data.扩展信息.故事背景, '你').text;
			const {简介, ...basicObj} = description_data.基础信息;
			const {故事背景, ...extendObj} = description_data.扩展信息;
			character_data.basic_description = basicObj;
			character_data.extend_description = extendObj;
			if(description_data.hasOwnProperty('副本')){
				if(description_data.副本.hasOwnProperty('前情提要')) character_data.character_story = description_data.副本.前情提要;
				if(description_data.副本.hasOwnProperty('开场白')) character_data.character_prologue = description_data.副本.开场白;
			}
		}
		//console.log(character_data);
		return character_data;
	},
	async previewToDb(result_data){
		//console.log(result_data);
		let character_gender = result_data.character_gender;
		let gender_cn = this.getGenderCn(character_gender);
		let character_description = result_data.character_description;
		if(!common.isJsonString(character_description)){
			character_description = gender_cn + '，' + character_description;
		}
		let db_data = {
			'character_name': result_data.character_name,
			'character_description': character_description,
			'character_prologue': result_data.character_prologue,
			'character_created_at': result_data.character_created_at
		}
		if(result_data.hasOwnProperty('character_id')){
			db_data.character_img = result_data.img[0].img_url;
			db_data.character_online_id = result_data.character_id;
		}else if(result_data.hasOwnProperty('incubator_id')){
			db_data.character_online_id = -1 * result_data.incubator_id;
		}
		//console.log(db_data);
		let character_id = await baseQuery.insertDataByKey('cybercafe_character', db_data, true);
		//console.log(character_id);
		
		if(store.state.dialogue.selectedEntityId == 0){
			await entityFun.createEntity(result_data.character_name + '的容器');	
			//console.log(entity_id);
			entityFun.updateEntityDetail(character_id);
		}else{
			entityFun.updateEntityDetail(character_id);
		}
		store.commit('dialogue/setDiaData', {
			'selectedEntityId': 0
		});
		return character_id;
	},
	getGenderCn(gender_num){
		let gender_cn = '未知';
		switch(gender_num){
			default: 
			gender_cn = '未知';
			break;
			case 1:
			gender_cn = '男';
			break;
			case 2:
			gender_cn = '女';
			break;
		}
		return gender_cn;
	},
	getGenderNum(gender_cn){
		let character_gender = 0;
		switch(gender_cn){
			default: 
			character_gender = 0;
			break;
			case '男':
			character_gender = 1;
			break;
			case '女':
			character_gender = 2;
			break;
		}
		return character_gender;
	},
	async createCharacter(online_id, page_id){
		//console.log(online_id, entity_id);
		let _self = this;
		try {
			let res = await request.post("characterController/getCharacterDetail", page_id,
				{'character_id': online_id});
			if (res.code == 200) {
				//console.log(res.result);
				let character_id = await _self.previewToDb(res.result);
				let character_data = {
					'character_id': character_id,
					'character_img': res.result.img[0].img_url
				}
				return character_data;
			} else {
				uni.showToast({
					title: res.msg,
					icon: "none"
				});
			}
		} catch (error) {
			console.error('创建角色失败:', error);
			uni.showToast({
				title: '创建角色失败',
				icon: "none"
			});
		}
	},
	async loadList(request_data, page_id){
		let return_data = {};
		return_data.character_list = [];
		let res = await request.post("characterController/getUserCharacter", page_id, request_data);
		if (res.code == 200) {
			//console.log(res.result);
			let result_data;
			//if(_self.from == 'index'){
				result_data = res.result.data;
				return_data.next_page = res.result.current_page + 1;
			//} 
			//else result_data = res.result;
			for (let i in result_data) {
				return_data.character_list.push(this.parseData(result_data[i]));
			}
			//console.log(return_data.character_list);			
		} else {
			uni.showToast({
				title: res.msg,
				icon: "none"
			});
		}
		return return_data;
	},
}