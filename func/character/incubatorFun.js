import store from "@/store";
import request from "@/func/common/request";
import baseQuery from "@/func/dbManager/baseQuery";
import common from "../common/common";
import characterFun from "./characterFun";

export default {
	feedback,
	parseData
}

function feedback(){//初始化时，数据回填
	//incubator
	request.post("characterController/getIncubator", 'chat',
		{creater: store.state.setting.userId}).then(res => {
		if (res.code == 200) {
			//console.log(res.result);
			for(let i = 0; i < res.result.length; i ++){
				let updateArr = {
					character_description: res.result[i].character_description,
					character_prologue: res.result[i].character_prologue,
					character_tag: res.result[i].character_tag,
					character_status: res.result[i].character_status
				};
				let whereArr = {
					character_name: res.result[i].character_name,
					character_status: 6
				};
				baseQuery.updateDataByKey('cybercafe_incubator', updateArr, whereArr);
			}
		} else {
			uni.showToast({
				title: res.msg,
				icon: "none"
			});
		}
	});
}

function parseData(result_data){
	console.log(result_data);
	let character_data = {
		'incubator_id': result_data.incubator_id,
		'character_name': result_data.character_name,
		'character_img': result_data.character_img,
		'character_prologue': result_data.character_prologue ? result_data.character_prologue : '',
		'character_created_at': result_data.character_created_at,
		'character_story': result_data.character_memo ? result_data.character_memo : '',
		'character_status': result_data.character_status ? result_data.character_status : 0,
		'character_gender': result_data.character_gender ? result_data.character_gender : 0
	};
	
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
		character_data.short_description = pos > -1 ? 
			common.textOperation(description_data.substring(0, pos), '你').text
			: common.textOperation(description_data, '你').text;
		
		character_data.full_description = pos > -1 ? common.textOperation(description_data.substr(pos + 2), '你').text : '';
	}else{
		description_data = JSON.parse(description_data);
		//新结构
		//console.log(description_data)
		if(!character_data.character_gender || character_data.character_gender == 0){
			console.log(description_data.性别);
			character_data.gender_cn = description_data.性别;
			character_data.character_gender = characterFun.getGenderNum(description_data.性别);
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
}
	