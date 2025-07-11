<template>
	<view>
		<view class="chat-bg" :style="dynamicBg(bgOpacity)" ></view>
	</view>
</template>

<script>
	import config from '@/config.json';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	export default{
		name: 'chatBg',
		computed:{
			...mapState('user', ['darkMode']),
			...mapState('dialogue', ['entityImage']),
			...mapState('setting', ['bgOpacity']),
			dynamicBg() {
				return function(bgOpacity){
					if(this.entityImage == configData.defaultImg){
						return '';
					}else{
						if(this.bgOpacity){//清晰
							return `background-image: url('${this.entityImage}');`;
						}else if(this.darkMode == 'light'){
							return `background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.9) 80%, rgba(255, 255, 255, 1) 95%, rgba(255, 255, 255, 1)), url('${this.entityImage}');`;
						}else{
							return `background-image: linear-gradient(to bottom, rgba(31, 31, 31, 0.5), rgba(31, 31, 31, 0.9) 80%, rgba(31, 31, 31, 1) 95%, rgba(31, 31, 31, 1)), url('${this.entityImage}');`;
						}
					}
					return `background-image: url('${this.entityImage}');`;
				} 
			}
		},
		methods:{
			...mapMutations('user', ['getUserData']),
			...mapMutations('dialogue', ['getDiaData']),
			...mapMutations('setting', ['getSettingData']),
		}
	}
</script>

<style lang="scss">
	.chat-bg{
		position: fixed;
		top:0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-attachment: fixed;
		background-repeat: no-repeat;
		background-size: 100% auto;
		background-position: 0 0;/* xy */
		z-index: -1;
	}
	@media (prefers-color-scheme: dark) {
		.chat-bg{
			background-color: $uni-bg-dark-color-gray;
		}
	}
</style>