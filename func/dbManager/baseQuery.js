import request from "@/func/common/request";
import sqlite from "@/func/common/sqlite";
import store from "@/store";

export default {
	deleteDataByKey(tableName, whereArr = []){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			let sql_str = `delete from ` + tableName;
			let where_str = ` `;
			let i = 0;
			for(let key in whereArr){
				if(i > 0){
					sql_str += ` and `;
				}
				where_str += key + ` = '${whereArr[key]}' `;
				i ++;
			}
			if(where_str == ``) {
				reject('whereArr: ' + whereArr);
			}
			if(where_str != ` `) {
				sql_str += ` where ` + where_str;
			}
			console.log(sql_str);
			sqlite.executeSQL(sql_str).then(return_data => {
				resolve(return_data);
			}).catch(e => {
				reject(e);
			});
		});
	},
	
	getDataByKey(tableName, whereArr = []){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			
			let sql_str = "select * from " + tableName;
			let where_str = " ";
			let i = 0;
			for(let key in whereArr){
				if(i > 0){
					where_str += " and ";
				}
				where_str += key + " = '" + whereArr[key] + "' ";
				i ++;
			}
			if(where_str != " ") {
				sql_str += " where " + where_str;
			}			
			//console.log(sql_str);
			sqlite.selectSQL(sql_str).then(return_data => {
				resolve(return_data);
			}).catch(e => {
				reject(e);
			});
		});
	},
	
	insertDataByKey(tableName, insertArr, insertId = false){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			
			let sql_str = `insert INTO ` + tableName + ` ( `;
			let i = 0;
			let sqlKey = ``;
			let sqlValue = ``;
			for(let key in insertArr){
				if(i > 0){
					sqlKey += `, `;
					sqlValue += `, `;
				} 
				sqlKey += key;
				sqlValue += `'${insertArr[key]}'`;//.toString().replace(new RegExp('\'', 'g'), "\\'")
				i ++;
			}
			//console.log(sqlKey, sqlValue);
			if(sqlKey == "") reject('insertArr: ' + insertArr);
			sql_str += sqlKey + ` ) values (` + sqlValue + `) `;
			//console.log(sql_str);
			sqlite.executeSQL(sql_str).then(() => {
				if(insertId){
					sqlite.selectSQL("select last_insert_rowid() as id;").then(res => {
						if (res && res.length > 0) {
							resolve(res[0].id);
						}else {
							reject('Failed to retrieve inserted ID');
						}
					}).catch(e => {
						console.error(e);
						uni.showToast({
							title: e,
							icon: "none"
						})
						reject(e);
					});
				}else{
					resolve('inserted');
				}
			}).catch(e => {
				console.error(e)
				reject(e);
			});
		});
	},
	updateDataByKey(tableName, updateArr, whereArr){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			let sql_str = `update ` + tableName + ` set `;
			let i = 0;
			let updateStr = ``;
			for(let fieldName in updateArr){
				if(i > 0) updateStr += `, `;
				updateStr += fieldName + ` = '${updateArr[fieldName]}' `;
				i ++;
			}
			//console.log(updateStr);
			if(updateStr == ""){
				reject('updateArr: ' + updateStr);
			}
			i = 0;
			let where_str = ``;
			for(let key in whereArr){
				if(i > 0){
					where_str += ` and `;
				}
				where_str += key + ` = '${whereArr[key]}' `;
				i ++;
			}
			//console.log(where_str);
			if(where_str == ``){
				sql_str += updateStr;
				//console.log(sql_str);
				sqlite.executeSQL(sql_str).then(() => {
					resolve('updated');
				}).catch(e => {
					console.error(e);
					uni.showToast({
						title: e,
						icon: "none"
					})
					reject(e);
				});
			}else{
				let select_str = ` select * from ` + tableName + ` where ` + where_str;
				//console.log(select_str);
				sqlite.selectSQL(select_str).then(result_data => {
					if(result_data.length == 0){
						let insert_str = `insert INTO ` + tableName + ` ( `;
						let i = 0;
						let sqlKey = ``;
						let sqlValue = ``;
						for(let key in updateArr){
							if(i > 0){
								sqlKey += `, `;
								sqlValue += `, `;
							} 
							sqlKey += key;
							sqlValue += `'${updateArr[key]}'`;//.toString().replace(new RegExp('\'', 'g'), "\\'")
							i ++;
						}
						for(let key in whereArr){
							sqlKey += `, ` + key;
							sqlValue += `, '${whereArr[key]}'`;//.toString().replace(new RegExp('\'', 'g'), "\\'")
						}
						//console.log(sqlKey, sqlValue);
						insert_str += sqlKey + ` ) values (` + sqlValue + `) `;
						//console.log(insert_str);
						sqlite.executeSQL(insert_str).then(() => {
							resolve('inserted');
						}).catch(e => {
							reject(e);
						});
					}else{
						sql_str += updateStr + ` where ` + where_str;
						//console.log(sql_str);
						sqlite.executeSQL(sql_str).then(() => {
							resolve('updated');
						}).catch(e => {
							console.error(e);
							uni.showToast({
								title: e,
								icon: "none"
							})
							reject(e);
						});
					}
				}).catch(e => {
					console.error(e);
					uni.showToast({
						title: e,
						icon: "none"
					})
					reject(e);
				});
			}
		});
	},
	syncDBDownload() {
		//let finish_flag = 0;
		let _self = this;
		store.commit('user/setUserData', {
			'modalData': {
				title: '温馨提示',
				content: '下载前将删除原有数据',
				confirmText: '确定覆盖',
				cancelText: '再想想',
				success: function (res) {
					if (res.confirm) {
						_self.downloadConfirmFun();
					}
				}
			},
			'modalShow': true,
			'modalPageId': 'globalSetting'
		});	
	},
	downloadConfirmFun(){
		uni.showLoading({
			title: '下载中',
			mask: true
		})
		let _self = this;
		request.post('aiController/syncDBDownload', 'globalSetting').then(response => {
			//console.log(response.result);
			if(response.code == 200){
				let result = JSON.parse(response.result);
				for (let table_name in result) {
					if(table_name != 'setting'){
					//console.log('table_name:' + table_name);
						let tableData = {}; // 创建一个临时存储对象用于当前table
						let table = result[table_name];
						sqlite.executeSQL('delete from cybercafe_' + table_name);
						// 遍历当前table中的所有键值对
						for (let key in table) {
							for (let data_key in table[key]) {
								//console.log('table_key:' + data_key);
								//console.log('table_value:' + JSON.stringify(table[key][data_key]));
								tableData[data_key] = table[key][data_key]; // 将键值对存储到临时对象
							}
							// 遍历完当前table后，调用创建表格的函数
							_self.insertDataByKey('cybercafe_' + table_name, tableData);
						}
					}
				}
				sqlite.executeSQL('delete from cybercafe_setting');
				for (let store_key in result.setting){
					let settingData = {
						setting_key: store_key,
						setting_value: JSON.stringify(result.setting[store_key])
					};
					_self.insertDataByKey('cybercafe_setting', settingData);
				}
				
				store.commit('user/setUserData', {
					'modalData': {
						title: '温馨提示',
						content: '下载已完成，请重启',
						confirmText: '',
						cancelText: 'OK'
					},
					'modalShow': true,
					'modalPageId': 'globalSetting'
				});	
			}else{
				uni.showToast({
					title: response.msg,
					icon: 'none'
				})
			}
		}).catch(e => {
			console.error('捕获到错误：', error);
			uni.showToast({
				title: error,
				icon: 'none'
			})
		}).finally(() => {
			uni.hideLoading();
		});
	},
	syncDBUpload() {
		let _self = this;
		store.commit('user/setUserData', {
			'modalData': {
				title: '温馨提示',
				content: '即将上传数据到线上',
				confirmText: '确定上传',
				cancelText: '再想想',
				success: function (res) {
					if (res.confirm) {
						_self.uploadConfirmFun();
					}
				},
			},
			'modalShow': true,
			'modalPageId': 'globalSetting'
		});
	},
	async uploadConfirmFun(){
		uni.showLoading({
			title: '上传中',
			mask: true
		});
		
		let data = {};
		data.message = await this.getDataByKey('cybercafe_message');
		data.entity = await this.getDataByKey('cybercafe_entity');
		data.entity_detail = await this.getDataByKey('cybercafe_entity_detail');
		data.character = await this.getDataByKey('cybercafe_character');
		data.images = await this.getDataByKey('cybercafe_images');
		data.incubator = await this.getDataByKey('cybercafe_incubator');
		data.bubble_pattern = await this.getDataByKey('cybercafe_bubble_pattern');
		
		data.setting = store.state.setting;
		
		//console.log(JSON.stringify(data));
		if (JSON.stringify(data).length > 0) {
			request.post('aiController/syncDBUpload', 'globalSetting', {
				'data': JSON.stringify(data)
			}).then(response => {
				if(response){
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
				}
			}).catch(e => {
				console.log(e);
			}).finally(() => {
				uni.hideLoading();
			});
		}else{
			uni.hideLoading();
			uni.showToast({
				title: '无数据可上传',
				icon: 'none'
			})
		}
	}
}