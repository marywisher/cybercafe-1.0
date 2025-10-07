<template>
	<view class="new-user-part">
		<view>老玩家装机初始：点屏幕右上角<span class="iconfont icon-shezhi guide-icon"></span>
			下载数据，完成旧数据本系统安装</view><br>
		<view>新羁绊：点屏幕左上角<span class="iconfont icon-xitongcaidan guide-icon"></span>
			本容器设置，调整容器内角色</view>
	</view>
</template>

<script>
	export default{
		name: 'newUserPart',
		data(){
			return {
				new_user_guide: '',
			}
		},
		methods: {
			init(){
				//console.log(newUserGuide.html)
				uni.hideLoading();
				this.new_user_guide = '<view>老玩家装机初始：点屏幕右上角<span class="iconfont icon-shezhi guide-icon"></span>'
					+ '下载数据，完成旧数据本系统安装</view><br><br>'
					+ '<view>新羁绊：点屏幕左上角<span class="iconfont icon-xitongcaidan guide-icon"></span>'
					+ '本容器设置，调整容器内角色</view>';
			}
		}
	}
</script>

<style lang="scss">
	.new-user-part{
		padding: calc(3 * $uni-spacing-lg); 
		background-color: $uni-bg-color-grey-half-transparent;
		margin: 10vh 5vw;
		border-radius: $uni-border-radius-base;
		color: $uni-text-color;
		line-height: calc(1.5 * $uni-font-size-huge);
	}
	.guide-icon{
		border: $uni-border-base solid $uni-color-main;
		color: $uni-color-main;
		border-radius: $uni-border-radius-lg;
		padding: $uni-spacing-base;
	}
	@media (prefers-color-scheme: dark) {
		.new-user-part{
			background-color: $uni-bg-dark-color-grey-half-transparent;
			color: $uni-text-color-grey;
		}
		.guide-icon{
			border: $uni-border-base solid $uni-color-dark-main;
			color: $uni-color-dark-main;
		}
	}
</style>