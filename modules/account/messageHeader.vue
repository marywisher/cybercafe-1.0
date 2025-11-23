<template>
	<cybercafe-header :bgOpacity="1">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-shanchu required" @tap="delAllMsg"></view>
			<label class="hint" @tap="delAllMsg">清空收件箱</label>
			<view class="iconfont icon-saozhou" @tap="clearMsg"></view>
			<label class="hint" @tap="clearMsg">一键已读</label>
		</view>
	</cybercafe-header>
</template>

<script>
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'entityHeader',
		props: {
			idArr: {
				type: Array,
				default: function(){
					return []
				}
			},
			messageList: {
				type: Array,
				default: function(){
					return []
				}
			}
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			back(){
				//uni.navigateBack();
				uni.navigateTo({
					url: '/pages/setting/globalSetting'
				})
			},
			clearMsg(){
				let _self = this;
				uni.showLoading();
				request.post("messageController/setMessages", 'message',
					{'message_status': 6,
					'message_id': this.idArr.join(',')}).then(res => {
						uni.hideLoading();
						if (res.code == 200) {
							uni.showToast({
								title: '标记成功',
								icon: "success"
							});
							//显示处理
							for(let i in _self.messageList){
								if(_self.messageList[i].message_status == 4) _self.messageList[i].message_status = 6;
							}
							_self.$emit('afterTap', _self.messageList);
						}else{
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
				});
			},
			delAllMsg(){
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
									{'message_status': 8,
									'message_id': _self.idArr.join(',')}).then(res => {
									uni.hideLoading();
									if (res.code == 200) {
										uni.showToast({
											title: '删除成功',
											icon: "success"
										});
										//显示处理
										_self.messageList = [];
										_self.$emit('afterTap', _self.messageList);
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
		}
	}
</script>

<style lang="scss">
	.iconback{
		transform: rotate(180deg);
		font-size: calc(2 * $uni-font-size-sm);
	}
	.header-right .iconfont{
		font-size: calc(2 * $uni-font-size-mini);
	}
	.header-right .hint{
		margin-right: $uni-spacing-lg;
	}
</style>