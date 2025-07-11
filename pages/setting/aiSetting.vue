<template>
	<view>
		<tttSetting :enable="tttSettingShow" ref="tttS"></tttSetting>
		<customAiSetting ref="aiCS"></customAiSetting>
		<aiSetting ref="aiS"></aiSetting>
		
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import aiFun from '@/func/setting/aiFun';
	import aiSetting from '@/modules/setting/settingPage/aiSetting';
	import customAiSetting from '@/modules/setting/settingPage/customAiSetting'
	import tttSetting from '@/modules/setting/settingPage/tttSetting';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data(){
			return{
				tttSettingShow: true,
			}
		},
		components:{
			aiSetting,
			customAiSetting,
			tttSetting
		},
		computed:{
			...mapState('user', ['modalData', 'modalShow']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(){
				this.getUserData();
				//console.log(this.modalShow);
				
				this.$nextTick(() => {
					this.$refs.aiS.init();
					this.$refs.tttS.init();
					this.$refs.aiCS.init();
				})
				//this.$forceUpdate();
				let _self = this;
				uni.$on('openModal', () => {
					_self.$refs.cModal.show(_self.modalData);
					_self.setUserData({
						'modalShow': false
					})
				})
				uni.$on('toggleTTT', (param) => {
					_self.tttSettingShow = param;
				})
			},
		},
		onLoad() {
			this.init();
		}
	}
</script>

<style lang="scss">
	.ai-setting-label{
		width: 30vw;
	}
	.ai-setting-right{
		width: 50vw;
	}
	.ai-setting-btn{
		margin-top: $uni-spacing-lg;
		justify-content: flex-end;
	}
	.vip-hint{
		position: absolute;
		bottom: $uni-spacing-sm;
		right: $uni-spacing-sm;
		color: $uni-text-color-disable;
		font-size: $uni-font-size-mini;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
</style>