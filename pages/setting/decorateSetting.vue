<template>
	<view>
		<globalDecorateSetting ref="globalSetting"></globalDecorateSetting>
		<bubbleSetting ref="bubbleSetting"></bubbleSetting>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import bubbleSetting from '@/modules/setting/decorate/bubbleSetting';
	import globalDecorateSetting from '@/modules/setting/decorate/globalDecorateSetting';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		components: {
			bubbleSetting,
			globalDecorateSetting
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'decorateSetting'){
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
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
		},
		onLoad() {
			this.$nextTick(() => {
				this.$refs.globalSetting.init();
				this.$refs.bubbleSetting.init();
			})
		}
	}
</script>

<style>
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
</style>