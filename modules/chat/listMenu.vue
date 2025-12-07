<template>
	<view>
		<cybercafe-context-menu ref="menu">
			<view class="menu-item text-center" v-for="(item, index) in menu_items" :key="index" @tap="handleClick(item)">
				<span :class="'iconfont icon-' + item.icon"></span><br>
				{{ item.label }}
			</view>
		</cybercafe-context-menu>
	</view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import common from '@/func/common/common';
	import dialogueQuery from '@/func/dbManager/dialogueQuery';
	import responseFun from '@/func/entity/responseFun';
	//import promptFun from '@/func/entity/promptFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: 'listMenu',
		data() {
			return {
				menu_items: [],
				selected_id: 0,
				selected_text: ''
			};
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
			...mapState('dialogue', ['cDisplayId', 'crtCharacterId', 'historylist', 'messageTime', 
				'optionFirst', 'options', 'prevMessageTime', 'refreshList',
				'resetFlag']),
			...mapState('setting', ['entityId']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData']),
			showMenu(x, y, items, id, text) {
				this.$refs.menu.showMenu(x, y);
				this.menu_items = items;
				this.selected_id = id;
				this.selected_text = text;
			},
			hideMenu() {
				this.$refs.menu.hideMenu();
			},
			handleClick(item) {
				this.$emit('menu-click', item, this.selected_id);
				//console.log(item);
				switch(item.value){
					case 'copy':
					this.copyToClipboard();
					break;
					case 'delete':
					this.showModal();
					break;
					case 'bubble':
					this.decorateBubble();
					break;
				}
				
				this.hideMenu();
			},
			copyToClipboard(){
				//this.getDiaData();
				//console.log( this.selected_id)
				let text = '';
				if(this.selected_id == 0){
					text = this.selected_text;
				}else{
					for(let i in this.historylist){
						//console.log(this.historylist[i]);
						if(this.historylist[i].message_id == this.selected_id){
							text = this.historylist[i].text;
							break;
						}
					}
				}
				common.copyText(text);
			},
			showModal(){
				let _self = this;
				this.setUserData({
					'modalData': {
						content: "本条消息删除后，不可找回",
						cancelText: "再想想",
						confirmText: "坚持删除",
						success: (res) => {
							if (res.confirm) {
								_self.deleteMessage()
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'chat'
				})
			},
			deleteMessage(){
				let _self = this;
				//console.log('用户点击确定' + this.selected_id);
				if(this.selected_id == 0){//option first
					this.deleteOptionFirst();
				}else{//history list
					for(let i in this.historylist){
						//console.log(this.historylist[i]);
						if(this.historylist[i].message_id == this.selected_id){
							dialogueQuery.deleteMessageByMessageId(this.selected_id);
							this.historylist.splice(i, 1);
							this.setDiaData({
								'historylist': this.historylist,
								'refreshList': -2,
							});
							//promptFun.preOperation();
							break;
						}
					}
				}
			},
			async deleteOptionFirst(){
				let delete_message = this.historylist.pop();
				console.log(delete_message);
				if(delete_message.message_time == undefined){
					uni.showToast({
						title: '删除失败，请重试',
						icon: 'none'
					})
					return;
				}
				let delete_message_data = await baseQuery.getDataByKey('cybercafe_message', {
					'message_time': delete_message.message_time
				})
				let summary = (delete_message_data[0].message_summary && delete_message_data[0].message_summary != 'null') 
					? delete_message_data[0].message_summary : '';
				baseQuery.deleteDataByKey('cybercafe_message', {'message_time': delete_message.message_time});
				if(summary.length > 0){
					let crt_entity_data = await baseQuery.getDataByKey('cybercafe_entity', {
						'entity_id': this.entityId
					})
					let new_description = (crt_entity_data[0].extra_description || crt_entity_data[0].extra_description != 'null') 
						? crt_entity_data[0].extra_description : '';
					new_description = new_description.replace(summary, '');
					baseQuery.updateDataByKey('cybercafe_entity', {
						'extra_description': new_description
					},{
						'entity_id': this.entityId
					})
				}
				
				let last_message = this.historylist[this.historylist.length - 1];
				//console.log(last_message);
				let message_time = last_message ? last_message.message_time : 0;
				let character_id = last_message ? last_message.character_id : 0;
				
				if(!last_message.message_id){
					console.log('id错误');
					return;
				}
				let message_id = last_message.message_id;
				let message_data = await baseQuery.getDataByKey('cybercafe_message', {'message_id': message_id});
				//console.log(message_data);
				let prev_message_time = message_data[0].prev_message_time;
				let ai_id = message_data[0].ai_id;
				//console.log(ai_id);
				let option_list = await responseFun.getResponseByAiId(ai_id);
				if(option_list == false){
					option_list = [{
						html: common.textToHtml(last_message.text),
						text: last_message.text,
					}];
				}
				//console.log(option_list);
				this.setDiaData({
					'messageTime': message_time,
					'crtCharacterId': character_id,
					'cDisplayId': character_id,
					'historylist': this.historylist,
					'resetFlag': true,
					'optionFirst': last_message.text,
					'prevMessageTime': prev_message_time,
					'options': option_list,
					'refreshList': -2,
				});
			},
			decorateBubble(){
				uni.navigateTo({
					url: '/pages/setting/decorateSetting'
				})
			}
		}
	};
</script>

<style lang="scss">
	.menu-item {
		padding: $uni-spacing-base;
	}
	.iconfont{
		color: $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.iconfont{
			color: $uni-color-dark-main;
		}
	}
</style>