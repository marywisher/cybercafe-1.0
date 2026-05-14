<template>
	<cybercafe-header :bgOpacity="1">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line" v-if="network_type != 'none' && network_type != 'offline' && network_type != 'online'">
			<view class="iconfont icon-jiahao" @tap="gotoCharacterList"></view>
			<label class="hint" @tap="gotoCharacterList">新建容器</label>
		</view>
	</cybercafe-header>
</template>

<script>
	export default{
		name: 'entityListHeader',
		props: {
			networkType: {
				type: String,
				default: 'none'
			}
		},
		data(){
			return{
				network_type: 'none'
			}
		},
		methods: {
			init(){
				this.network_type = this.networkType;
			},
			back(){
				//uni.navigateBack();
				if(this.network_type == 'online' || this.network_type == 'offline'){
					uni.navigateBack();
				}else{
					uni.redirectTo({ // 或者使用uni.reLaunch({...})
						url: '/pages/chat/index'
					});
				}
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