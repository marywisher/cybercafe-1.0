<template>
	<view>
		<login ref="cpLogin" :showIcon="false"></login>
		<register ref="cpRegister"></register>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	import login from '@/modules/login/login.vue';
	import register from '@/modules/login/register.vue';
	export default{
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
		components: {
			login,
			register
		},
		computed:{
			...mapState('user', ['modalData', 'modalShow']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
		},
		onLoad(options) {
			let _self = this;
			uni.$on('chagePop', function(param){
				_self.$refs[param].show();
			})
			this.$nextTick(() => {
				if(options.msg != 'undefined') this.$refs.cpLogin.show(options.msg);
				else this.$refs.cpLogin.show();
				this.$refs.cpRegister.hide();
			})
		},
	}
</script>

<style>
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
</style>