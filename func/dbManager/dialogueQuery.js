import sqlite from "../common/sqlite";
import store from "@/store";
import config from '@/config.json';
const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;

export default{
	getCharacterByEntityIdNoLimit(){
		return new Promise((resolve, reject) => {
			sqlite.selectSQL("select c.*, d.detail_status from cybercafe_character c "
				+ " left join cybercafe_entity_detail d on c.character_id = d.character_id "
				+ " where d.entity_id = '" + store.state.setting.entityId + "';")
			.then(character_data => {
				resolve(character_data);
			}).catch(e => {
				reject(e);
			});
		});
	},
	getCurrentCharacterId(){
		return new Promise((resolve, reject) => {
			sqlite.selectSQL("select character_id from cybercafe_message "
				+ " where entity_id = '" + store.state.setting.entityId + "'"
				+ " order by message_time desc limit 0, 1;")
			.then(last_data => {
				resolve(last_data[0].character_id);
			}).catch(e => {
				reject(e);
			});
		});
	},
	getMessageByEntityId(){
		return new Promise((resolve, reject) => {
			let query_str = "select * from cybercafe_message where entity_id = '" + store.state.setting.entityId + "'";
			if(store.state.dialogue.breakpointMessageId != 0){
				query_str += " and message_id < " + store.state.dialogue.breakpointMessageId;
			}
			query_str += " order by message_id DESC limit 50;";
			
			sqlite.selectSQL(query_str).then(messageList => {
				resolve(messageList);
			}).catch(e => {
				reject(e);
			});
		});
	},
	getResponseByResponseIds(ai_id){
		return new Promise((resolve, reject) => {
			sqlite.selectSQL("select * from cybercafe_ai_response where ai_response_id in (" 
				+ ai_id + ") order by ai_response_id asc;").then(responseList => {
				//console.log(responseList);
				resolve(responseList);
			}).catch(e => {
				reject(e);
			});
		});
	},
	getAllEntityList(){
		return new Promise((resolve, reject) => {
			let sql_str = "select e.*, count(m.message_id) as message_count from cybercafe_entity e "
				+ " left join cybercafe_message m on e.entity_id = m.entity_id "
				+ " group by m.entity_id order by entity_id DESC;";
			sqlite.selectSQL(sql_str).then(entity_data => {
				//console.log(entity_data);
				let entity_list = entity_data;
				for(let i in entity_data){
					let sql_str2 = "select cc.character_id, character_img from cybercafe_character cc "
						+ " left join cybercafe_entity_detail cd on cc.character_id = cd.character_id "
						+ " where cd.entity_id = '" + entity_data[i].entity_id + "' order by cd.entity_detail_id";
					sqlite.selectSQL(sql_str2).then(img_data => {
						//console.log(img_data);
						let tmp_img_arr = {};
						for(let j in img_data){
							if(img_data[j].character_img == configData.voiceOver || 
								img_data[j].character_img == configData.defaultImg) continue;
							tmp_img_arr[img_data[j].character_id] = img_data[j].character_img;
						}
						entity_list[i].character_img = tmp_img_arr;
						resolve(entity_list);
					}).catch(e => {
						reject(e);
					})
				}
			}).catch(e => {
				reject(e);
			});
		});
	},
	createMessage(ai_id, content, operation, store_data = {}) {
		return new Promise((resolve, reject) => {
			if(!store_data.hasOwnProperty('messageTime')){
				store_data.messageTime = store.state.dialogue.messageTime;
				store_data.prevMessageTime = store.state.dialogue.prevMessageTime;
				store_data.crtCharacterId = store.state.dialogue.crtCharacterId;
				store_data.entityId = store.state.setting.entityId;
			} 
			sqlite.selectSQL("select * from `cybercafe_message` where `message_time` = '" 
				+ store_data.messageTime + "'")
			.then(message_data => {
				//console.log(JSON.stringify(message_data));
				if (message_data.length > 0) {
					sqlite.executeSQL("update `cybercafe_message` set `ai_id` = '" + message_data[0].ai_id + "," +
						ai_id + "', `message_content` = '" + content + "', operation_content = '" + operation
						+ "' where `message_time` = '" + store_data.messageTime + "'")
					.then(() => {
						resolve('update');
					});
				} else {
					sqlite.executeSQL(
						"INSERT INTO `cybercafe_message`(`ai_id`, `message_content`, `message_time`, `prev_message_time`," +
						" `character_id`, `entity_id`, operation_content ) VALUES ('" +
						ai_id + "', '" + content + "', '" + store_data.messageTime + "', '" + 
						store_data.prevMessageTime + "', " + store_data.crtCharacterId +
						", " + store_data.entityId + ", '" + operation + "')")
					.then(() => {
						sqlite.selectSQL("select last_insert_rowid() as message_id;").then(message_res => {
							if (message_res && message_res.length > 0) {
								resolve(message_res[0].message_id);
							}
						});
					});
				}
			});
		});
	},
	deleteMessageByMessageId(selected_id){
		//取出本条记录的时间戳
		sqlite.selectSQL('select * from cybercafe_message where message_id = "' + selected_id + '";')
			.then(message_data => {
				let prev_time = message_data[0].prev_message_time;
				let time_str = message_data[0].message_time;
				sqlite.executeSQL('update cybercafe_message set prev_message_time = "' 
					+ prev_time + '" where prev_message_time = "' + time_str + '";');
				sqlite.executeSQL('delete from cybercafe_message where message_id = "' 
					+ selected_id + '";');
			});
	},
	getSpecialEntityList(character_id){
		return new Promise((resolve, reject) => {
			let sql_str = "SELECT d.entity_id FROM cybercafe_entity_detail d "
				+ "JOIN cybercafe_character c ON d.character_id = c.character_id "
				+ " WHERE c.character_online_id = " + character_id 
				+ " AND d.entity_id IS NOT NULL;"
			sqlite.selectSQL(sql_str).then(detail_data => {
				//console.log(detail_data);
				let sql_str2 = "SELECT * FROM cybercafe_entity "
				if(detail_data.length > 0){
					const entity_ids = detail_data
				        .filter(item => item.entity_id > 0)
				        .map(item => item.entity_id);
					sql_str2 += " WHERE entity_id NOT IN (" + entity_ids.join(',') + ")";
				}
				sql_str2 += " ORDER BY entity_id DESC;";
				sqlite.selectSQL(sql_str2).then(entity_data => {
					//console.log(entity_data);
					resolve(entity_data);
				}).catch(e => {
					//console.log(e);
					reject(e);
				})
			}).catch(e => {
				reject(e);
			});
		});
	},
	getMessageByCharacterId(character_id){//用于检测当前切片所在容器有否初始消息
		return new Promise((resolve, reject) => {
			let query_str = "select count(*) as message_count from cybercafe_message m"
				+ " left join cybercafe_entity_detail d on m.entity_id = d.entity_id where d.character_id = '" 
				+ character_id + "';";
			sqlite.selectSQL(query_str).then(messageList => {
				resolve(messageList);
			}).catch(e => {
				reject(e);
			});
		});
	},
}