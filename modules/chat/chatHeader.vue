<template>
	<cybercafe-header :bgOpacity="0.75" class="chat-header">
		<!-- 顶部 -->
		<view class="header-left">
			<popMenu ref="chatRMenuPart"></popMenu>
		</view>
		<titlePart ref="chatTitlePart" class="header-center"></titlePart>
		<view class="header-right display-flex">
			<view class="iconfont icon-shezhi" @tap="gotoSetting"></view>
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
		}
	}
</script>

<style>
	.chat-header{
		z-index: 3;
	}
	.header-left, .header-right{
		width: 20vw;
	}
	.header-right{
		justify-content: flex-end;
	}
</style>