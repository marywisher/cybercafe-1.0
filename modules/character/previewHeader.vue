<template>
	<cybercafe-header :bgOpacity="bgOpacity" :img="img" :imgOpacity="imgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-chatou" @tap="download"></view>
			<label class="hint" @tap="download">载入切片</label>
		</view>
	</cybercafe-header>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'previewHeader',
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
			img: {
				type: String,
				default: ''
			},
			imgOpacity:{
				type: Number,
				default: 0
			},
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			back(){
				uni.navigateBack();
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
						},
					},
					'modalShow': true,
					'modalPageId': 'characterPreview'
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