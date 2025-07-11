import baseQuery from "../dbManager/baseQuery";
import common from "../common/common";
import request from "../common/request";
import store from "@/store";

export default {
	async updateLocalData() {
		//不等于4的数据，从线上获取最新代码
		let key_arr = [];
		let local_pattern_data = await baseQuery.getDataByKey('cybercafe_bubble_pattern');
		let time_param = '';
		for (let i in local_pattern_data) {
			if(i < 3) continue;
			if (local_pattern_data[i].pattern_status == 4) continue;
			key_arr.push(local_pattern_data[i].pattern_key);
			if (time_param == '') time_param = local_pattern_data[i].pattern_updated_at;
			if (local_pattern_data[i].pattern_updated_at > time_param) time_param = local_pattern_data[i].pattern_updated_at;
		}
		//console.log(key_arr);
		let _self = this;
		request.post("settingController/getPatternByKey", {
			keys: key_arr.join(),
			time: time_param
		}).then(res => {
			//console.log(res);
			if (res.code == 200) {
				_self.updateData(res.result);
			}
		}).catch(e => {
			console.log(e);
		});
	},
	async updateData(data, reset_status = false) {
		for (let i in data) {
			let tmp_data = {
				'pattern_html': data[i].pattern_html,
				'pattern_css': store.state.bubble.cssPrev + data[i].pattern_css + store.state.bubble.cssAfter,
				'pattern_options': data[i].pattern_options,
				'pattern_updated_at': data[i].pattern_updated_at,
			};
			if(reset_status){//只在手动下行更新并覆盖本地草稿时用到
				tmp_data.pattern_status = 6;
			}
			let pattern_key = {
				'pattern_key': data[i].pattern_key
			};
			await baseQuery.updateDataByKey('cybercafe_bubble_pattern', tmp_data, pattern_key)
				.then((e) => {console.log(e)})
				.catch((e) => {console.log(e)});
		}
	},
	async getPatternRange() {
		let next_id = 0;
		let local_keys = [];//本地已有的key
		let pattern_range = [];
		let pattern_data = await baseQuery.getDataByKey('cybercafe_bubble_pattern');
		
		for (let i in pattern_data) {
			local_keys[i] = pattern_data[i].pattern_key;
			pattern_range[i] = {
				'pattern_id': pattern_data[i].pattern_id,
				'pattern_key': pattern_data[i].pattern_key,
				'pattern_name': pattern_data[i].pattern_name,
				'pattern_status': pattern_data[i].pattern_status,
			};
			next_id = Math.max(next_id, pattern_data[i].pattern_id);
			
			if (store.state.setting.chatPattern == pattern_data[i].pattern_id) {
				store.commit('bubble/setBubbleData', {
					'patternName': pattern_data[i].pattern_name
				});
			}
		}
		//console.log(next_id);
		store.commit('bubble/setBubbleData', {
			'searchKeys': local_keys,
			'nextId': next_id + 1,
			'patternIndex': store.state.setting.chatPattern,
			'patternRange': pattern_range
		});
	},
	async loadPattern(reset = false) {
		let pattern_data = await baseQuery.getDataByKey('cybercafe_bubble_pattern', {
			pattern_id: store.state.bubble.patternIndex
		});
		if(pattern_data.length == 0){//已删防空
			store.commit('bubble/setBubbleData', {
				'patternIndex': store.state.bubble.patternRange[0].pattern_id
			})
			this.loadPattern(true);
			return;
		}
		store.commit('bubble/setBubbleData', {
			'patternKey': pattern_data[0].pattern_key,
			'patternName': pattern_data[0].pattern_name,
			'patternStatus': pattern_data[0].pattern_status
		})
		if (pattern_data[0].pattern_status == 1) {
			store.commit('bubble/setBubbleData', {
				'showCode': false
			})
		}
		
		let preview_css;
		if (reset) {
			let poptions = JSON.parse(pattern_data[0].pattern_options);
			if (poptions['bg-color1']) 
				store.commit('bubble/setBubbleData', {'bubbleColor1': poptions['bg-color1']});
			if (poptions['bg-color2']) 
				store.commit('bubble/setBubbleData', {'bubbleColor2': poptions['bg-color2']});
			if (poptions['font-color1']) 
				store.commit('bubble/setBubbleData', {'fontColor1': poptions['font-color1']});
			if (poptions['font-color2']) 
				store.commit('bubble/setBubbleData', {'fontColor2': poptions['font-color2']});
	
			store.commit('bubble/setBubbleData', {
				'displayHtml': pattern_data[0].pattern_html,
				'displayCss': pattern_data[0].pattern_css
					.substr(7, pattern_data[0].pattern_css.length - 15)
			});
			if (store.state.bubble.patternStatus == 4 || store.state.bubble.patternStatus == 6) {
				store.commit('bubble/setBubbleData', {
					'patternHtml': pattern_data[0].pattern_html,
					'patternCss': pattern_data[0].pattern_css
						.substr(7, pattern_data[0].pattern_css.length - 15)
				});
			}
		} else if (store.state.bubble.patternStatus == 4 || store.state.bubble.patternStatus == 6) {
			store.commit('bubble/setBubbleData', {
				'displayHtml': store.state.bubble.patternHtml,
				'displayCss': store.state.bubble.patternCss
			});
		}
		preview_css = store.state.bubble.cssPrev + store.state.bubble.displayCss.replace(new RegExp('.chat-line', 'g'),
			'.sample .chat-line') + store.state.bubble.cssAfter;
		store.commit('bubble/setBubbleData', {
			'previewCss': preview_css
		});
		/* this.test_text_left = common.textToHtml(store.state.bubble.sampleTextLeft, 'left', true, store.state.bubble.displayHtml);
		this.test_text_right = common.textToHtml(store.state.bubble.sampleTextRight, 'right', true, store.state.bubble.displayHtml); */
		//console.log(preview_css);
	},
	getOptions() {
		let options = {};
		if (store.state.bubble.font_color1.length > 0) 
			options['font-color1'] = store.state.bubble.font_color1;
		if (store.state.bubble.bubble_color1.length > 0) 
			options['bg-color1'] = store.state.bubble.bubble_color1;
		if (store.state.bubble.font_color2.length > 0) 
			options['font-color2'] = store.state.bubble.font_color2;
		if (store.state.bubble.bubble_color2.length > 0) 
			options['bg-color2'] = store.state.bubble.bubble_color2;
		return options;
	},
	async afterBuy(pattern_data) {
		let insertData = {
			'pattern_key': pattern_data.pattern_key,
			'pattern_name': pattern_data.pattern_name,
			'pattern_html': pattern_data.pattern_html,
			'pattern_css': this.css_prev + pattern_data.pattern_css + this.css_after,
			'pattern_options': pattern_data.pattern_options,
			'pattern_created_at': pattern_data.pattern_created_at,
			'pattern_updated_at': pattern_data.pattern_updated_at,
			'pattern_status': 1
		};
		let pattern_index = await baseQuery.insertDataByKey('cybercafe_bubble_pattern', insertData, true);
		//refresh range
		insertData.pattern_id = pattern_index;
		let pattern_range = store.state.bubble.patternRange;
		pattern_range.push(insertData);
		let search_keys = store.state.bubble.searchKeys;
		search_keys.push(pattern_data.search_keys);
		store.commit('bubble/setBubbleData', {
			'patternIndex': pattern_index,
			'patternRange': pattern_range,
			'patternStatus': 1,
			'nextId': store.state.bubble.nextId + 1,
			'searchKeys': search_keys
		});
		uni.showToast({
			title: '下载成功',
			icon: 'success'
		});
		uni.navigateBack({
		    delta: 1, // 返回上一级页面
		    success: () => {
		        uni.redirectTo({ // 或者使用uni.reLaunch({...})
		            url: '/pages/setting/decrateSetting'
		        });
		    }
		});
	},
}