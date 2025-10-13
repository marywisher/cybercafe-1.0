<template>
	<cybercafe-header :bgOpacity="bgOpacity" :img="img" :imgOpacity="imgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="iconfont icon-geren menu-icon-left"></view>
	</cybercafe-header>
</template>

<script>
	export default{
		name: 'characterHeader',
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
		methods: {
			back(){
				uni.navigateBack();
			},
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