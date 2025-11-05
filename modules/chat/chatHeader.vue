<template>
	<cybercafe-header :bgOpacity="0.75" class="chat-header">
		<!-- 顶部 -->
		<view class="header-left display-flex display-line">
			<popMenu ref="chatRMenuPart"></popMenu>
			<label class="hint" @tap="clickRightMenu">快捷菜单</label>
		</view>
		<titlePart ref="chatTitlePart" class="header-center"></titlePart>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-shezhi" @tap="gotoSetting"></view>
			<label class="hint" @tap="gotoSetting">系统设置</label>
		</view>
	</cybercafe-header>
</template>

<script>
	import popMenu from '@/modules/chat/popMenu';
	import titlePart from '@/modules/chat/titlePart';
	export default{
		name: 'chatHeader',
		components:{
			popMenu,
			titlePart
		},
		methods: {
			init(){
				this.$nextTick(() => {
					this.$refs.chatRMenuPart.init();
					this.$refs.chatTitlePart.init();
				})
			},
			gotoSetting(){
				uni.navigateTo({
					url: '/pages/setting/globalSetting'
				})
			},
			clickRightMenu(){
				this.$refs.chatRMenuPart.openMenuFun();
			}
		}
	}
</script>

<style lang="scss">
	.chat-header{
		z-index: 3;
	}
	.iconfont{
		font-size: calc(2 * $uni-font-size-sm);
	}
</style>