<template>
	<view class="chat-bottom content display-flex display-line sp-around">
		<view class="chat-bottom-bg" :class="{'chat-bottm-big-bg': inputMode == 'max'}"></view>
		<characterPart v-show="inputMode == 'min'" ref="chatCharPart"></characterPart>
		<chatInput ref="chatInputPart" @autoSpeak="autoSpeakFun" @inputModeChange="changeBtmPart"></chatInput>
		<!-- 底部 -->
	</view>
</template>

<script>
	import characterPart from '@/modules/chat/characterPart';
	import chatInput from '@/modules/chat/chatInput';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'chatBottom',
		props: {
			inputMode: {
				type: String,
				default: 'min'
			}
		},
		components: {
			characterPart,
			chatInput,
		},
		computed: {
			...mapState('dialogue', ['ai']),
		},
		methods:{
			...mapMutations('dialogue', ['getDiaData']),
			init(){
				this.$nextTick(() =>{
					this.$refs.chatCharPart.init();
					this.$refs.chatInputPart.init();
				});
			},
			autoSpeakFun(){
				let delay = 0;
				if(this.ai == 0) delay = 3000;
				this.$nextTick(() => {
					setTimeout(() => {
						this.$refs.chatCharPart.speakFun();
					}, delay);
				})
			},
			changeBtmPart(mode){
				//console.log(mode);
				this.$emit('chageInputMode', mode);
			},
			
		}
	}
</script>

<style lang="scss">
	.chat-bottom{
		position: fixed;
		bottom: 0;
		left: 0;
		width: calc(100vw - 2 * $uni-spacing-base);
		padding-top: $uni-spacing-base;
		padding-bottom: $uni-spacing-base;
	}
	.chat-bottom-bg{
		position: absolute;
		width: 100vw;
		height: calc(5vh + 2 * $uni-spacing-base);
		background-color: $uni-bg-color-grey-half-transparent;
		box-shadow: $uni-width-none calc(-1 * $uni-spacing-mini) $uni-spacing-lg $uni-text-color-grey;
		z-index: -1;
	}
	.chat-bottm-big-bg{
		height: 35vh;
	}
	@media (prefers-color-scheme: dark) {
		.chat-bottom-bg{
			background-color: $uni-bg-dark-color-grey-half-transparent;
			box-shadow: $uni-width-none calc(-1 * $uni-spacing-mini) $uni-spacing-lg $uni-bg-color-mask;
		}
	}
</style>