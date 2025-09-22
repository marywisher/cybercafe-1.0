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
		<view class="chat-body content" :class="{'max-view': input_mode == 'max'}" @longpress="handleLongPress">
			<!-- 内容区 -->
			<listPart v-if="entityId > 0" id="chatList" ref="chatListPart" :lockMode="in_pull_down_mode"
				@afterUpdate="afterUpdateList" :scroll="scroll"></listPart>
			<view v-else>新用户可见</view>
		</view>
		<view v-if="entityId > 0" class="chat-bottom content display-flex sp-around">
			<characterPart ref="chatCharPart"></characterPart>
			<chatInput ref="chatInputPart" @autoSpeak="autoSpeakFun"></chatInput>
			<!-- 底部 -->
		</view>
		<view v-if="show_to_btm_btn" class="fix-btm" @tap="clickToBtm">>></view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import characterPart from '@/modules/chat/characterPart';
	import chatBg from '@/modules/chat/chatBg';
	import entityFun from '@/func/entity/entityFun';
	import listPart from '@/modules/chat/listPart';
	import popMenu from '@/modules/chat/popMenu';
	import titlePart from '@/modules/chat/titlePart';
	import messageFun from '@/func/entity/messageFun';
	import chatInput from '@/modules/chat/chatInput.vue';
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
				dark_mode: 'light',
				edit: false,
				input_mode: 'min'
			}
		},
		components: {
			characterPart,
			chatBg,
			listPart,
			popMenu,
			titlePart,
			chatInput
		},
		watch:{
			modalShow(newValue){
				if(newValue && this.modalPageId == 'chat'){
					this.$refs.cModal.show(this.modalData);
					this.setUserData({
						'modalShow': false,
						'modalPageId': ''
					})
				}
			}
		},
		computed:{
			...mapState('user', ['darkMode', 'modalData', 'modalPageId', 'modalShow',
				'userKey', 'userName']),
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
				await entityFun.entityInit();
				await messageFun.getMessage();
				
				this.$nextTick(() =>{
					this.$refs.chatCharPart.init();
					//this.$refs.chatListPart.init();
					this.$refs.chatRMenuPart.init();
					this.$refs.chatTitlePart.init();
					this.$refs.chatInputPart.init();
				})
			},
			gotoSetting(){
				uni.navigateTo({
					url: '/pages/setting/globalSetting'
				})
			},
			afterUpdateList(){//非锁定状态时，自动下滑到底部
				//console.log(this.in_pull_down_mode)
				if(!this.in_pull_down_mode){
					setTimeout(() => {
						this.toBtm();
					}, 500);
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
				//console.log('toBtm');
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
			autoSpeakFun(){
				this.$refs.chatCharPart.speakFun();
			},
		},
		onLoad() {
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
			this.init();
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
	.max-view{
		height: 30vh;
		width: 100vw;
	}
	@media (prefers-color-scheme: dark) {
		.chat-header{
			color: $uni-color-dark-main;
		}
		.fix-btm{
			background-color: $uni-color-dark-main;
			color: $uni-bg-dark-color-gray;
		}
	}
</style>