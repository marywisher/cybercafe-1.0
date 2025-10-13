<template>
	<cybercafe-header :bgOpacity="bgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex">
			<view class="iconfont icon-shanchu required"></view>
		</view>
	</cybercafe-header>
</template>

<script>
	export default{
		name: 'entityHeader',
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
		},
		methods: {
			back(){
				uni.navigateBack();
			},
		}
	}
</script>

<style lang="scss">
	.header-right{
		justify-content: flex-end;
	}
	.iconfont{
		font-size: calc(2 * $uni-font-size-sm);
	}
	.iconback{
		transform: rotate(180deg);
	}
</style>