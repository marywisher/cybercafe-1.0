<template>
	<view>
		<messageHeader @afterTap="refreshFun"></messageHeader>
		<view class="header-part"></view>
		<cybercafe-view v-for="(item, index) in message_list" :key="index">
			<view :id="item.message_id">
				<view class="display-flex sp-between list-title" @tap="showDetail(index)">
					<view class="msg-title">{{item.message_status == 4 ? '（未读）' : ''}}{{item.message_title}}</view>
					<view class="hint">
						({{item.message_created_at}})
						<span v-if="!item.show" class="iconfont icon-xiala"></span>
						<span v-else class="iconfont icon-shouqi"></span>
					</view>
				</view>
				<view v-if="item.show" class="display-flex sp-between list-content">
					<view v-html="item.message_content"></view>
					<span class="iconfont icon-shanchu required" @tap="delMsg(index)"></span>
				</view>
			</view>
		</cybercafe-view>
		<view class="hint text-center btm-hint" v-if="message_list.length == 0">—— 收件箱空空如也 ——</view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import request from '@/func/common/request';
	import messageHeader from '@/modules/account/messageHeader';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		data() {
			return {
				message_list: [],
				next_page: 1,
				id_arr: [],
			}
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'message'){
				    	this.$nextTick(() => {
				    		this.$refs.cModal.show(this.modalData);
						});
				    	this.setUserData({
				    		'modalShow': false,
				    		'modalPageId': ''
				    	})
				    }
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		components:{
			messageHeader
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow', 'newMsgCount',
				'tagLevel']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(){
				let _self = this;
				let data = {
					page: this.next_page
				};
				request.post("messageController/getMessages", 'message', data).then(res => {
					if (res.code == 200) {
						//console.log(res.result);
						_self.next_page = res.result.current_page + 1;
						for(let i in res.result.data){
							_self.message_list.push(res.result.data[i]);
							_self.id_arr.push(res.result.data[i].message_id);
						}
					}else{
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				});
			},
			showDetail(index){
				//console.log(this.message_list[index].show);
				if(this.message_list[index].show == undefined || this.message_list[index].show == false) 
					this.message_list[index].show = true;
				else 
					this.message_list[index].show = false;
				this.$forceUpdate();
				//未读改已读 随机米粒奖励
				let _self = this;
				if(this.message_list[index].message_status == 4){
					request.post("messageController/setMessages", 'message',
						{'message_id': this.message_list[index].message_id,
						'message_status': 1,
						'level': this.tagLevel,
						'old_status': 4}).then(res => {
						if (res.code == 200) {
							_self.message_list[index].message_status = 1;
							_self.setUserData({'newMsgCount': _self.newMsgCount - 1});
							if(res.result.reward > 0){
								_self.setUserData({
									'modalData': {
										'title': "恭喜",
										'content': "获得" + res.result.reward + "米粒",
										'confirmText': '',
										'cancelText': "OK",
									},
									'modalShow': true,
									'modalPageId': 'message'
								})
							}
						}else{
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
					});
				}
			},
			delMsg(index){
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "温馨提醒",
						content: "确认删除当前消息吗？",
						confirmText: "确认删除",
						cancelText: "放弃",
						success: (res) => {
							if (res.confirm) {
								uni.showLoading();
								request.post("messageController/setMessages", 'message',
									{'message_id': _self.message_list[index].message_id,
									'message_status': 0}).then(res => {
									uni.hideLoading();
									if (res.code == 200) {
										if(_self.message_list[index].message_status == 4){
											_self.setUserData({'newMsgCount': _self.newMsgCount - 1});
										}
										uni.showToast({
											title: '删除成功',
											icon: "success"
										});
										_self.message_list.splice(index, 1);
									}else{
										uni.showToast({
											title: res.msg,
											icon: "none"
										});
									}
								});
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'message'
				})
			},
			refreshFun(message_list){
				this.setUserData({'newMsgCount': 0});
				this.message_list = message_list;
			}
		},
		onLoad() {
			this.id_arr = [];
			this.init();
		},
		onReachBottom() {
			//console.log('pulling down');
			uni.startPullDownRefresh();
			this.init();
			
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 2000);
		}
	}
</script>

<style lang="scss">
	.header-part{
		margin-top: calc($page-header-height + $uni-spacing-lg);
	}
	.list-title{
		vertical-align: bottom;
		padding: $uni-width-none $uni-spacing-base;
	}
	.msg-title{
		font-weight: bolder;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 50vw;
	}
	.list-content{
		border-top: $uni-border-base solid $uni-text-color-disable;
		padding: $uni-spacing-lg $uni-spacing-base $uni-spacing-base;
	}
	.btm-hint{
		margin-top: 5vh;
	}
</style>