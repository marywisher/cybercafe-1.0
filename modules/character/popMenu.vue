<template>
	<view class="character-header">
		<view class="character-header-bg" :style="{ opacity: bgOpacity }"></view>
		<view class="display-flex sp-between display-line">
			<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
			<image class="character-header-img" :src="img" :style="{ opacity: bgOpacity }"></image>
			<view class="iconfont icon-geren menu-icon-left"></view>
		</view>
	</view>
</template>

<script>
	export default{
		name: 'popMenu',
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
			img: {
				type: String,
				default: ''
			}
		},
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
		top: 0;
		left: 0;
		width: calc(100vw);
		z-index: 3;
	}
	.character-header-bg{
		position: absolute;
		width: 100vw;
		height: 10.5vh;
		background-color: $uni-bg-color-hover;
		border-bottom: 1px solid $uni-color-main;
		z-index: -1;
	}
	.character-header .display-line{
		margin-top: 5vh;
		padding: $uni-spacing-lg;
		color: $uni-color-main;
	}
	.iconback{
		transform: rotate(180deg);
	}
	.character-header-img{
		width: $uni-img-size-sm;
		height: $uni-img-size-sm;
		border-radius: 50%;
	}
	@media (prefers-color-scheme: dark) {
		.character-header-bg{
			background-color: $uni-bg-dark-color-gray;
			border-bottom: 1px solid $uni-color-dark-main;
		}
		.character-header .display-line{
			color: $uni-color-dark-main;
		}
	}
</style>