import request from "@/func/common/request";
import sqlite from "@/func/common/sqlite";

export default {
	deleteDataByKey(tableName, whereArr = []){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			let sqlStr = `delete from ` + tableName;
			let whereStr = ` `;
			let i = 0;
			for(let key in whereArr){
				if(i > 0){
					sqlStr += ` and `;
				}
				whereStr += key + ` = '${whereArr[key]}' `;
				i ++;
			}
			if(whereStr == ``) {
				reject('whereArr: ' + whereArr);
			}
			if(whereStr != ` `) {
				sqlStr += ` where ` + whereStr;
			}
			console.log(sqlStr);
			sqlite.executeSQL(sqlStr).then(return_data => {
				resolve(return_data);
			});
		});
	},
	
	getDataByKey(tableName, whereArr = []){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			
			let sqlStr = "select * from " + tableName;
			let whereStr = " ";
			let i = 0;
			for(let key in whereArr){
				if(i > 0){
					whereStr += " and ";
				}
				whereStr += key + " = '" + whereArr[key] + "' ";
				i ++;
			}
			if(whereStr != " ") {
				sqlStr += " where " + whereStr;
			}			
			//console.log(sqlStr);
			sqlite.selectSQL(sqlStr).then(return_data => {
				resolve(return_data);
			});
		});
	},
	
	insertDataByKey(tableName, insertArr, insertId = false){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			
			let sqlStr = `insert INTO ` + tableName + ` ( `;
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
			sqlStr += sqlKey + ` ) values (` + sqlValue + `) `;
			//console.log(sqlStr);
			sqlite.executeSQL(sqlStr).then(() => {
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
			});
		});
	},
	updateDataByKey(tableName, updateArr, whereArr){
		return new Promise((resolve, reject) => {
			if(!tableName) reject('tableName: ' + tableName);
			let sqlStr = `update ` + tableName + ` set `;
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
			let whereStr = ``;
			for(let key in whereArr){
				if(i > 0){
					whereStr += ` and `;
				}
				whereStr += key + ` = '${whereArr[key]}' `;
				i ++;
			}
			//console.log(whereStr);
			if(whereStr == ""){
				whereStr = ` 1 = 1 `;
			}
			sqlStr += updateStr + ` where ` + whereStr;
			//console.log(sqlStr);
			sqlite.executeSQL(sqlStr).then(() => {
				resolve('updated');
			}).catch(e => {
				console.error(e);
				uni.showToast({
					title: e,
					icon: "none"
				})
				reject(e);
			});
		});
	},
	async syncDBDownload() {
		//let finish_flag = 0;
		let _self = this;
		uni.showModal({
			title: '下载前将删除已有数据',
			confirmText: '确定覆盖',
			showCancel: true,
			cancelText: '再想想',
			success: function (res) {
				if (res.confirm) {
					uni.showLoading({
						title: '下载中',
						mask: true
					})
				
					try{
						request.post('aiController/syncDBDownload').then(response => {
							//console.log(response.result);
							if(response.code == 200){
								let result = JSON.parse(response.result);
								for (let table_name in result) {
									console.log('table_name:' + table_name);
									let tableData = {}; // 创建一个临时存储对象用于当前table
									let table = result[table_name];
									sqlite.executeSQL('delete from cybercafe_' + table_name);
									// 遍历当前table中的所有键值对
									for (let key in table) {
										for (let data_key in table[key]) {
											console.log('table_key:' + data_key);
											console.log('table_value:' + JSON.stringify(table[key][data_key]));
											tableData[data_key] = table[key][data_key]; // 将键值对存储到临时对象
										}
										// 遍历完当前table后，调用创建表格的函数
										_self.insertDataByKey('cybercafe_' + table_name, tableData);
									}
								}
								
								uni.showToast({
									title: '下载完成',
									icon: 'success'
								})
								
								uni.hideLoading();
							}else{
								uni.showToast({
									title: response.msg,
									icon: 'none'
								})
							}
						});
					}catch (error) {
						// 捕获并处理错误
						uni.hideLoading();
						console.error('捕获到错误：', error);
						uni.showToast({
							title: error,
							icon: 'none'
						})
					}
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			}
		})			
	},
	async syncDBUpload() {
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
		//console.log(JSON.stringify(data));
		if (JSON.stringify(data).length > 0) {
			request.post('aiController/syncDBUpload', {
				'data': JSON.stringify(data)
			}).then(response => {
				uni.hideLoading();
				if(response){
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
				}
			});
		}else{
			uni.hideLoading();
			uni.showToast({
				title: '无数据可上传',
				icon: 'none'
			})
		}
	},
}