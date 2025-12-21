<template>
	<cybercafe-header :bgOpacity="bgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view v-if="incubator_id > 0" class="iconfont icon-shanchu required" @tap="del"></view>
			<label v-if="incubator_id > 0" class="hint required" @tap="del">删除角色</label>
			
			<view v-if="incubator_id > 0 && show_submit" class="iconfont icon-fenxiang"></view>
			<label v-if="incubator_id > 0 && show_submit" class="hint">提交线上</label>
			
			<view v-if="incubator_id > 0" class="iconfont icon-chatou" @tap="download"></view>
			<label v-if="incubator_id > 0" class="hint" @tap="download">载入切片</label>
		</view>
	</cybercafe-header>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'incubatorHeader',
		data(){
			return{
				incubator_id: 0,
				show_submit: false,
			}
		},
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(incubator_id){
				this.incubator_id = incubator_id;
				let _self = this;
				request.checkNetwork('incubator').catch((e) => {
					_self.show_submit = false;
				});
			},
			back(){
				uni.navigateBack();
			},
			del(){
				console.log('del');
				let _self = this;
				this.setUserData({
					'modalData': {
						title: '温馨提示',
						content: '删除后将无法创建同名角色',
						cancelText: '再想想',
						confirmText: '坚持删除',
						success: function(res) {
							if (res.confirm) {
								baseQuery.updateDataByKey('cybercafe_incubator',{
									character_status: 0
								},{
									incubator_id: _self.incubator_id
								});
								
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
								setTimeout(() => {
									uni.navigateTo({
										url: '/pages/character/incubatorList'
									})
								}, 500)
							}
						},
					},
					'modalPageId': 'incubator',
					'modalShow': true,
				});
			},
			download(){
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "温馨提醒",
						content: "即将载入本角色",
						confirmText: '确认载入',
						cancelText: "手滑了",
						success: (res) => {
							_self.$emit('tapDownload');
						}
					},
					'modalShow': true,
					'modalPageId': 'incubator'
				})
			}
		}
	}
</script>

<style lang="scss">
	.iconfont{
		font-size: calc(2 * $uni-font-size-sm);
	}
	.iconback{
		transform: rotate(180deg);
	}
	.header-right .hint{
		margin-right: $uni-spacing-lg;
	}
</style>