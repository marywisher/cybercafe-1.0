<template>
	<view class="chat-main">
		<chatBg></chatBg>
		<water-mark v-if="userKey" class="watermark" :text1="userKey" 
			:text2="userName" :darkMode="dark_mode"></water-mark>
		<cybercafe-header :bgOpacity="1" class="chat-header">
			<!-- 顶部 -->
			<view class="header-left">
				<popMenu ref="chatRMenuPart"></popMenu>
			</view>
			<titlePart ref="chatTitlePart" class="header-center"></titlePart>
			<view class="header-right display-flex">
				<view class="iconfont icon-shezhi" @tap="gotoSetting"></view>
			</view>
		</cybercafe-header>
		<view class="chat-body content" @longpress="handleLongPress"
			@touchstart="handleTouchStart" @touchend="handleTouchEnd">
			<!-- 内容区 -->
			<listPart v-if="entityId > 0" ref="chatListPart" :lockMode="in_pull_down_mode"
				:viewMode="input_mode" @afterUpdate="afterUpdateList" :scroll="scroll"></listPart>
			<view v-else></view><!--新用户可见-->
			<view class="btm"></view>
		</view>
		<view v-if="entityId > 0" class="chat-bottom content display-flex display-line sp-around">
			<characterPart v-show="input_mode == 'min'" ref="chatCharPart"></characterPart>
			<chatInput ref="chatInputPart" @autoSpeak="autoSpeakFun" @inputModeChange="changeBtmPart"></chatInput>
			<!-- 底部 -->
		</view>
		<view v-if="show_to_btm_btn" class="fix-btm" 
			:class="{'heigher-btn': input_mode == 'max'}" @tap="clickToBtm">>></view>
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
				input_mode: 'min',
				client_y: 0
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
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'chat'){
						this.$nextTick(() => {
				    		this.$refs.cModal.show(this.modalData);
						});
				    	this.setUserData({
				    		'modalShow': false,
				    		'modalPageId': ''
				    	})
				    }
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
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
			},
			toBtm(){
				//console.log('toBtm');
				let _self = this;
				this.$nextTick(() => {
					uni.pageScrollTo({
						selector: '.btm',
						duration: 300,
						success: () => {
							//console.log('scrollToBtm');
							_self.show_to_btm_btn = false;
							_self.in_pull_down_mode = false;
							_self.upcount = 0;
							//console.log(_self.maxHeight)
						},
					})
				});
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
			changeBtmPart(mode){
				this.input_mode = mode;
			},
			handleTouchStart(e){
				//console.log(e);
				this.client_y = e.touches[0].clientY;
			},
			handleTouchEnd(e){
				//console.log(e);
				//console.log(this.client_y, e.changedTouches[0].clientY);
				//this.unlockScroll();
				if(e.changedTouches[0].clientY - this.client_y > 50){
					//console.log('上滑');
					this.upcount += 1;
					if(this.upcount >= 3){
						this.show_to_btm_btn = true;
					}else{
						this.show_to_btm_btn = false;
					}
				}else if(e.changedTouches[0].clientY - this.client_y < -50){
					this.show_to_btm_btn = false;
					this.upcount -= 1;
				}
				this.client_y = e.changedTouches[0].clientY;
				//console.log(this.show_to_btm_btn);
			}
		},
		onLoad() {
			/* uni.$on('refreshScroll', (pos_y, is_lock) => {
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
			}); */
			this.init();
		},
	}
</script>

<style lang="scss">
	.chat-header{
		z-index: 3;
	}
	.chat-body{
		margin: 8vh auto;
		width: calc(100vw - 2 * $uni-spacing-base);
	}
	.chat-bottom{
		position: fixed;
		bottom: 0;
		left: 0;
		width: calc(100vw - 2 * $uni-spacing-base);
		padding-top: $uni-spacing-base;
		padding-bottom: $uni-spacing-base;
		background-color: $uni-bg-color-grey;
		box-shadow: $uni-width-none calc(-1 * $uni-spacing-mini) $uni-spacing-lg $uni-text-color-grey;
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
	.fix-btm{
		position: fixed;
		right: 0;
		bottom: 20vh;
		border-radius: $uni-width-none $uni-width-none $uni-border-radius-base $uni-border-radius-base;
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
	.heigher-btn{
		bottom: 50vh;
	}
	@media (prefers-color-scheme: dark) {
		.fix-btm{
			background-color: $uni-color-dark-main;
			color: $uni-bg-dark-color-gray;
		}
		.chat-bottom{
			background-color: $uni-bg-dark-color-gray;
			box-shadow: $uni-width-none calc(-1 * $uni-spacing-mini) $uni-spacing-lg $uni-bg-color-mask;
		}
	}
</style>