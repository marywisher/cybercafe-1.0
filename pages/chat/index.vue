<template>
	<view class="chat-main">
		<chatBg></chatBg>
		<water-mark v-if="userKey" class="watermark" :text1="userKey" :text2="userName" :darkMode="dark_mode"></water-mark>
		<view class="chat-header content display-flex sp-between">
			<!-- 顶部 -->
			<view class="header-left">
				<popMenu ref="chatRMenuPart"></popMenu>
			</view>
			<titlePart ref="chatTitlePart" class="header-center"></titlePart>
			<view class="header-right display-flex">
				<view class="iconfont icon-shezhi" @tap="gotoSetting"></view>
			</view>
		</view>
		<view class="chat-body content" @longpress="handleLongPress">
			<!-- 内容区 -->
			<listPart v-if="entityId > 0" id="chatList" ref="chatListPart" :lockMode="in_pull_down_mode"
				@afterUpdate="afterUpdateList" :scroll="scroll"></listPart>
			<view v-else>新用户可见</view>
		</view>
		<view class="chat-bottom content display-flex sp-between">
			<characterPart ref="chatCharPart"></characterPart>
			<input class="chat-input" />
			<view class="iconfont icon-fasong"></view>
			<!-- 底部 -->
		</view>
		<view v-if="show_to_btm_btn" class="fix-btm" @tap="clickToBtm">>></view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import characterPart from '@/modules/chat/characterPart';
	import chatBg from '@/modules/chat/chatBg';
	import entityBaseInfo from '@/func/entity/entityBaseInfo';
	import listPart from '@/modules/chat/listPart';
	import popMenu from '@/modules/chat/popMenu';
	import titlePart from '@/modules/chat/titlePart';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		data(){
			return {
				in_pull_down_mode: false,
				show_to_btm_btn: false,
				upcount: 0,
				scroll: 0,
				dark_mode: 'light'
			}
		},
		components: {
			characterPart,
			chatBg,
			listPart,
			popMenu,
			titlePart
		},
		watch:{
			modalShow(newValue){
				if(newValue){
					this.$refs.cModal.show(this.modalData);
					this.setUserData({
						'modalShow': false
					})
				}
			}
		},
		computed:{
			...mapState('user', ['userKey', 'userName', 'darkMode', 'modalData', 'modalShow']),
			...mapState('setting', ['entityId']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			async init(){
				uni.showLoading({
					title: '加载中...'
				})
				this.getUserData();
				this.dark_mode = this.darkMode;
				await entityBaseInfo.entityInit();
				await entityBaseInfo.getMessage();
			},
			gotoSetting(){
				uni.navigateTo({
					url: '/pages/setting/globalSetting'
				})
			},
			afterUpdateList(){//非锁定状态时，自动下滑到底部
				//console.log(this.in_pull_down_mode)
				if(!this.in_pull_down_mode){
					this.toBtm();
					uni.hideLoading();
				}else{
					this.in_pull_down_mode = false;
				}
			},
			clickToBtm(){
				//console.log('clickbtm');
				this.in_pull_down_mode = true;
				this.toBtm();
				setTimeout(() => {
					this.in_pull_down_mode = false;
				}, 2000);
			},
			toBtm(){
				//this.scroll = this.upcount;
				this.show_to_btm_btn = false;
				this.$refs.chatListPart.toBtm();
			},
			handleLongPress(e){
				//console.log(e);
				setTimeout(() => {
					this.$refs.chatListPart.handleLongPress(e);
				}, 1000);
			},
		},
		onLoad() {
			this.init();
			uni.$on('refreshScroll', (pos_y, is_lock) => {
				//console.log(pos_y);
				this.upcount = Math.max(pos_y, this.upcount);
				if(!is_lock){
					//console.log(this.upcount); 
					if(this.upcount - pos_y > 1000 && !this.in_pull_down_mode){
						this.show_to_btm_btn = true;
					}else{
						this.show_to_btm_btn = false;
					}
				}else{
					//console.log(this.upcount);
					//console.log(pos_y);
					this.upcount += pos_y;
				}
			});
			
			this.$nextTick(() =>{
				this.$refs.chatCharPart.init();
				this.$refs.chatListPart.init();
				this.$refs.chatRMenuPart.init();
				this.$refs.chatTitlePart.init();
			})
		},
	}
</script>

<style lang="scss">
	.chat-main{
		position: fixed;
		width: 100vw;
		height: 100vh;
	}
	.chat-header{
		position: absolute;
		top: 5vh;
		left: 0;
		width: calc(100vw - 2 * $uni-spacing-base);
		color: $uni-color-main;
	}
	.chat-body{
		position: absolute;
		top: 8vh;
		left: 0;
		width: calc(100vw - 2 * $uni-spacing-base);
		height: calc(90vh - 2 * $uni-font-size-lg);
	}
	.chat-bottom{
		position: absolute;
		bottom: 0;
		left: 0;
		width: calc(100vw - 2 * $uni-spacing-base);
		padding-bottom: $uni-spacing-base;
	}
	.watermark{
		position: fixed;
		top: 0;
		left: -5vw;
		z-index: 2;
		pointer-events: none;
	}
	.chat-input{
		width: calc(100vw - 10 * $uni-spacing-lg);
	}
	.icon-fasong{
		color: $uni-color-main;
		font-size: $uni-font-size-lg;
		line-height: calc(2 * $uni-font-size-lg);
	}
	.header-left, .header-right{
		width: 20vw;
	}
	.header-right{
		justify-content: flex-end;
	}
	.chat-header .iconfont{
		font-size: $uni-font-size-huge;
	}
	.fix-btm{
		position: fixed;
		right: 0;
		bottom: 20vh;
		border-radius: 0 0 $uni-border-radius-base $uni-border-radius-base;
		//border:$uni-border-base solid $uni-text-color;
		background-color: $uni-color-main;//$uni-text-color-inverse;
		color: $uni-bg-color-grey;
		font-size: $uni-font-size-sm;
		padding: $uni-spacing-base;
		transform: rotate(90deg);
		//box-shadow: 0 $uni-spacing-mini $uni-spacing-lg $uni-bg-color-mask;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	@media (prefers-color-scheme: dark) {
		.chat-header{
			color: $uni-color-dark-main;
		}
		.icon-fasong{
			color: $uni-color-dark-main;
		}
		.fix-btm{
			background-color: $uni-color-dark-main;
			color: $uni-bg-dark-color-gray;
		}
	}
</style>