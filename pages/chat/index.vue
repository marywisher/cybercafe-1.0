<template>
	<view class="chat-main">
		<chatBg></chatBg>
		<water-mark v-if="userKey" class="watermark" :text1="userKey" 
			:text2="userName" :darkMode="dark_mode"></water-mark>
		<chatHeader ref="chatHeaderPart"></chatHeader>
		<view class="chat-body content" @longpress="handleLongPress" @touchmove="handleMove"
			@touchstart="handleTouchStart" @touchend="handleTouchEnd">
			<!-- 内容区 -->
			<listPart v-if="entityId > 0" ref="chatListPart" :lockMode="in_pull_down_mode"
				:viewMode="input_mode" @afterUpdate="afterUpdateList" :scroll="scroll"></listPart>
			<newUserPart v-else ref="chatNewUserPart"></newUserPart><!-- 新用户可见-->
			<view class="btm"></view>
		</view>
		<chatBottom v-if="entityId > 0" :inputMode="input_mode" ref="chatBottomPart"
			@chageInputMode="chageInputMode"></chatBottom>
		<view v-if="show_to_btm_btn" class="fix-btm" 
			:class="{'heigher-btn': input_mode == 'max'}" @tap="clickToBtm">>></view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import chatBg from '@/modules/chat/chatBg';
	import entityFun from '@/func/entity/entityFun';
	import listPart from '@/modules/chat/listPart';
	import messageFun from '@/func/entity/messageFun';
	import newUserPart from '@/modules/chat/newUserPart';
	import chatHeader from '@/modules/chat/chatHeader';
	import chatBottom from '@/modules/chat/chatBottom.vue';
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
			chatBg,
			listPart,
			newUserPart,
			chatHeader,
			chatBottom
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
			...mapState('dialogue', ['historylist'])
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			async init(){
				uni.showLoading({
					title: '加载中...'
				})
				this.getUserData();
				this.dark_mode = this.darkMode;
				await entityFun.entityInit();
				await messageFun.getMessage();
				
				this.$nextTick(() =>{
					this.$refs.chatHeaderPart.init();
					console.log(this.entityId);
					if(this.historylist.length == 0) this.$refs.chatNewUserPart.init();
					else this.$refs.chatBottomPart.init();
					//this.$refs.chatNewUserPart.init();
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
			chageInputMode(mode){
				//console.log(mode);
				this.input_mode = mode;
				this.toBtm();
			},
			handleTouchStart(e){
				//console.log(e);
				this.client_y = e.touches[0].clientY;
			},
			handleTouchEnd(e){
				//console.log(e);
				//console.log(this.client_y, e.changedTouches[0].clientY);
				//this.unlockScroll();
				this.in_pull_down_mode = false;
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
			},
			handleMove(){
				this.in_pull_down_mode = true;
			},
		},
		onLoad() {
			this.init();
		},
	}
</script>

<style lang="scss">
	.chat-body{
		margin: $page-header-height auto 8vh;
		width: calc(100vw - 2 * $uni-spacing-base);
	}
	.watermark{
		position: fixed;
		top: 0;
		left: -5vw;
		z-index: 2;
		pointer-events: none;
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
	}
</style>