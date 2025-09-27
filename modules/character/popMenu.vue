<template>
	<cybercafe-header :bgOpacity="bgOpacity" :img="img">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="iconfont icon-geren menu-icon-left"></view>
	</cybercafe-header>
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
	.iconback{
		transform: rotate(180deg);
	}
</style>