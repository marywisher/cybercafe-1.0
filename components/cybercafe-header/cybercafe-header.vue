<template>
	<view class="header-container">
		<view class="header-bg" :style="dynamicBgOpacity"></view>
		<view class="display-flex sp-between display-line">
			<slot></slot>
		</view>
		<image class="header-img" :src="img" :style="dynamicImgOpacity"></image>
	</view>
</template>

<script>
	export default{
		name: 'cybercafe-header',
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
			}
		},
		computed:{
			dynamicBgOpacity(){
				return `opacity: ${this.bgOpacity};`;
			},
			dynamicImgOpacity(){
				return `opacity: ${this.imgOpacity};`;
			},
		}
	}
</script>

<style lang="scss">
	.header-container{
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		z-index: 3;
	}
	.header-bg{
		position: absolute;
		width: 100vw;
		height: 8vh;
		background-color: $uni-bg-color-hover;
		box-shadow: $uni-width-none $uni-spacing-mini $uni-spacing-lg $uni-text-color-grey;
		z-index: -1;
	}
	.header-container .display-line{
		margin-top: 3vh;
		padding: $uni-spacing-lg;
		color: $uni-text-color;//$uni-color-main;
	}
	.iconfont{
		font-size: $uni-font-size-huge;
	}
	.header-img{
		width: $uni-img-size-lg;
		height: $uni-img-size-lg;
		border-radius: 50%;
		position: fixed;
		top: calc(3 * $uni-spacing-lg);
		margin-left: calc(-0.5 * $uni-img-size-lg);
		left: 50vw;
	}
	@media (prefers-color-scheme: dark) {
		.header-bg{
			background-color: $uni-bg-dark-color-gray;
			box-shadow: $uni-width-none $uni-spacing-mini $uni-spacing-lg $uni-bg-color-mask;
		}
		.header-container .display-line{
			color: $uni-text-color-grey;//$uni-color-dark-main;
		}
	}
</style>