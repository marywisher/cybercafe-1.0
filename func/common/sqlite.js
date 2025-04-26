import config from '@/config/config';
import common from '@/func/common/common';
import store from '@/store';
export default {
	// 打开数据库
	openDB() {
		//console.log('打开数据库: ');
		//console.log(this.isOpenDB());
		if(!this.isOpenDB()){
			plus.sqlite.openDatabase({
				name: 'localdb',
				path: '_doc/localdb.db',
				success: function() {
					//console.log('openDatabase success!');
				},
				fail: function(e) {
					console.log('openDatabase failed: ' + JSON.stringify(e));
				}
			});
		}
	},

	// 初始化数据库，仅在开始时执行
	initTable() { 
		this.openDB();
		console.log('初始化表 ');
		
		this.initMessage();
		this.initEntity();
		this.initCharacter();
		this.initImg();
		this.initIncubator();
		this.initBubblePattern();
	},

	// 执行SQL语句，删除数据库
	async dropTable(tableName) {
		return new Promise((resolve, reject) => {
			this.openDB();
			console.log('执行SQL语句: drop table ' + tableName);
			plus.sqlite.executeSql({
				name: 'localdb',
				sql: "drop table `" + tableName + "`",
				success: function(e) {
					console.log('drop table ' + tableName + ' success!');
					resolve(e);
				},
				fail: function(e) {
					uni.showToast({
						title: '数据库操作失败，请联系管理员',
						icon: 'none'
					})
					console.log('drop table ' + tableName + ' failed: ' + JSON.stringify(e));
					reject(e);
				}
			});
		});
	},

	// 增删改操作
	async executeSQL(sqlStr) {
		return new Promise((resolve, reject) => {
			this.openDB();
			console.log('SQL语句: ' + sqlStr);
			plus.sqlite.executeSql({
				name: 'localdb',
				sql: sqlStr,
				success: function(data) {
					console.log('executeSql success: ' + JSON.stringify(data));
					resolve(data);
				},
				fail: function(e) {
					uni.showToast({
						title: '数据操作失败，请联系管理员',
						icon: 'none'
					})
					console.log('executeSql failed: ' + JSON.stringify(e));
					reject(e);
				}
			});
		});
	},

	// 查询SQL语句
	async selectSQL(sqlStr) {
		return new Promise((resolve, reject) => {
			this.openDB();
			console.log('查询SQL语句: ' + sqlStr);
			plus.sqlite.selectSql({
				name: 'localdb',
				sql: sqlStr,
				success: function(data) {
					/*console.log('selectSql success: ' + data.length);
					for (var i in data) {
						console.log(JSON.stringify(data[i]));
					}*/
					resolve(data);
				},
				fail: function(e) {
					uni.showToast({
						title: '数据查询失败，请联系管理员',
						icon: 'none'
					})
					console.log('selectSql failed: ' + JSON.stringify(e));
					reject(e);
				}
			});
		});
	},

	// 关闭数据库
	closeDB() {
		//console.log('关闭数据库: ');
		plus.sqlite.closeDatabase({
			name: 'localdb',
			success: function() {
				//console.log('closeDatabase success!');
			},
			fail: function(e) {
				console.log('closeDatabase failed: ' + JSON.stringify(e));
			}
		});
	},
	isOpenDB() {
		//sqlite在H5不支持，请使用模拟器运行
		if (plus.sqlite.isOpenDatabase({
				name: 'localdb',
				path: '_doc/localdb.db',
			})) {
			//plus.nativeUI.alert('Opened!');
			//console.log('DB Opened!');
			return true;
		} else {
			//plus.nativeUI.alert('Unopened!');
			console.log('DB Unopened!');
			return false;
		}
	},
	
	initMessage(){
		
	},
		
	initEntity(){
		
	},
	
	initCharacter(){
		
	},
	
	initImg(){
		
	},
	
	initIncubator(){
		
	},
	
	initBubblePattern(){
		
	}
};