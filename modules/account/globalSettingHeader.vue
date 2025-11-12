<template>
	<cybercafe-header :bgOpacity="1">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex">
			<view class="iconfont icon-duanxin" :class="{'has-new': new_msg_count > 0}" @tap="gotoMessageList"></view>
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
		name: 'entityHeader',
		data(){
			return {
				new_msg_count: 0
			}
		},
		watch: {
			newMsgCount:{
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue) this.new_msg_count = newValue;
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		computed: {
			...mapState('user', ['hasNewMsg', 'newMsgCount']),
		},
		methods: {
			...mapMutations('user', ['getUserData']),
			back(){
				uni.navigateBack();
			},
			gotoMessageList(){
				uni.navigateTo({
					url: '/pages/index/message'
				})
			}
		}
	}
</script>

<style lang="scss">
	.header-right{
		justify-content: flex-end;
		position: relative;
	}
	.iconfont{
		font-size: calc(2 * $uni-font-size-sm);
	}
	.iconback{
		transform: rotate(180deg);
	}
	.icon-duanxin.has-new::after{
		content: "";
		position: absolute;
		top: 0;
		right: calc(-2 * $uni-spacing-mini);
		width: calc(2 * $uni-spacing-sm);
		height: calc(2 * $uni-spacing-sm);
		background-color: $uni-color-main;
		border-radius: $uni-border-radius-circle;
	}
</style>