<template>
	<view class="character-header">
		<view class="character-header-bg"></view>
		<view class="display-flex sp-between display-line">
			<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
			<view class="iconfont icon-geren menu-icon-left"></view>
		</view>
	</view>
</template>

<script>
	export default{
		name: 'popMenu',
		methods: {
			back(){
				uni.navigateBack();
			},
		}
	}
</script>

<style lang="scss">
	.character-header{
		position: fixed;
		top: 5vh;
		left: 0;
		width: calc(100vw - 2 * $uni-spacing-lg);
		z-index: 3;
	}
	.character-header-bg{
		position: absolute;
		width: 100vw;
		height: 5vh;
		background-color: $uni-color-main;
		opacity: 0.1;
		z-index: -1;
	}
	.character-header .display-line{
		padding: $uni-spacing-lg;
		color: $uni-color-main;
	}
	.iconback{
		transform: rotate(180deg);
	}
	@media (prefers-color-scheme: dark) {
		.character-header-bg{
			background-color: $uni-color-dark-main;
		}
	}
</style>