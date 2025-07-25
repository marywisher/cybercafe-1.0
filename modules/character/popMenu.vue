<template>
	<view>
		<view>
			<view class="iconfont icon-xitongcaidan" @tap="openMenuFun"></view>
		</view>
		<cybercafe-menu ref="rightMenuPop" class="pop-menu display-flex sp-between"
			viewTitle="快捷菜单" menuSide="right">
			<view class="display-flex pop-menu-line" @tap="back">
				<view class="iconfont icon-xiayibu iconback menu-icon-left"></view>
				<span>后退</span>
			</view>
			<view class="display-flex pop-menu-line">
				<view class="iconfont icon-baocun menu-icon-left"></view>
				<span>存为本地角色</span>
			</view>
		</cybercafe-menu>
	</view>
</template>

<script>
	export default{
		name: 'popMenu',
		methods: {
			openMenuFun(){
				this.$refs.rightMenuPop.toggleView();
			},
			back(){
				uni.navigateBack();
			},
			closeView(){
				this.$refs.rightMenuPop.closeView();
			}
		}
	}
</script>

<style lang="scss">
	.icon-xitongcaidan{
		background-color: $uni-color-main;
		padding: $uni-spacing-base $uni-width-none $uni-spacing-base $uni-spacing-lg;
		border-radius: $uni-border-radius-base $uni-width-none $uni-width-none $uni-border-radius-base;
		color: $uni-bg-color-grey;
		font-size: $uni-font-size-huge;
		width: 10vw;
	}
	.iconback{
		transform: rotate(180deg);
	}
	
	.pop-menu{
		position: fixed;
		height: 80vh;
		flex-direction: column;
		z-index: 4;
	}
	.pop-menu-line{
		margin: calc(4 * $uni-spacing-lg) $uni-width-none;
		position: relative;
	}
	.cybercafe-main-menu span{
		font-size: $uni-font-size-lg;
		line-height: calc(2 * $uni-font-size-lg);
	}
	.cybercafe-main-menu .iconfont{
		font-size: calc(2 * $uni-font-size-lg);
	}
	.cybercafe-main-menu-long span{
		display: block;
	}
	.cybercafe-main-menu-short span{
		display: none;
	}
	.pop-menu-line .menu-icon-left{
		margin: $uni-width-none $uni-spacing-base;
	}
	.icon-shangxiajiantou1{
		transform: rotate(90deg);
	}
	
	@media (prefers-color-scheme: dark) {
		.cybercafe-main-menu .iconfont{
			color: $uni-text-color-grey;
		}
		.cybercafe-main-menu{
			background-color: $uni-bg-dark-color-gray;
		}
	}
</style>