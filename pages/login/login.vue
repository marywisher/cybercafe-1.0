<template>
	<view>
		<login ref="cpLogin" :showIcon="false"></login>
		
		<register ref="cpRegister"></register>
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
		onLoad() {
			let _self = this;
			uni.$on('chagePop', function(param){
				_self.$refs[param].show();
			})
			this.getUserData();
			//console.log(this.isLogin);
			//console.log(this.token)
			if(this.isLogin === false){
				this.$nextTick(() => {
					this.$refs.cpLogin.show();
					this.$refs.cpRegister.hide();
				})
			}
		},
		components: {
			login,
			register
		},
		computed: {
			...mapState('user', ['isLogin', 'darkMode']),
			dynamicStyle(){
				return this.darkMode == 'light' ? '#333' : '#999';
			}
		},
		methods:{
			...mapMutations('user', ['getUserData']),
			goIndex(){
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		}
	}
</script>

<style>
</style>