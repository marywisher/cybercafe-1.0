<template>
	<cybercafe-header :bgOpacity="1">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-jiahao" @tap="newIncubator"></view>
			<label class="hint" @tap="newIncubator">创建本地角色</label>
		</view>
	</cybercafe-header>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'incubatorHeader',
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			back(){
				uni.navigateBack();
			},
			newIncubator(){
				let _self = this;
				this.setUserData({
					'modalData': {
						title: '温馨提示',
						content: '即将创建本地角色',
						cancelText: '手滑了',
						confirmText: '确认创建',
						success: function(res) {
							if (res.confirm) {
								_self.createIncubator();
							}
						},
					},
					'modalPageId': 'incubatorList',
					'modalShow': true,
				});
			},
			async createIncubator(){
				let incubator_id = await baseQuery.insertDataByKey('cybercafe_incubator', {
					'character_name': '无名氏',
					'character_description': '',
				}, true);
				uni.navigateTo({
					url: '/pages/character/incubator?id=' + incubator_id
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
</style>