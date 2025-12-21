<template>
	<cybercafe-header :bgOpacity="1">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-jiahao" @tap="gotoCharacterList"></view>
			<label class="hint" @tap="gotoCharacterList">新建容器</label>
		</view>
	</cybercafe-header>
</template>

<script>
	export default{
		name: 'entityListHeader',
		methods: {
			back(){
				//uni.navigateBack();
				uni.redirectTo({ // 或者使用uni.reLaunch({...})
				    url: '/pages/chat/index'
				});
			},
			gotoCharacterList(){
				uni.navigateTo({
					url: '/pages/character/characterList'
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