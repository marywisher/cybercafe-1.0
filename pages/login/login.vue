<template>
	<view>
		<cybercafe-button v-if="isLogin" class="logout-btn"
			btnClass="btn-primary" btnName="安全退出" @tapBtn="logoutFun"></cybercafe-button>
		<cybercafe-button v-else class="logout-btn"
			btnClass="btn-default" btnName="登录" @tapBtn="loginFun"></cybercafe-button>
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
				if(newValue && this.modalPageId == 'login'){
					this.$refs.cModal.show(this.modalData);
					this.setUserData({
						'modalShow': false,
						'modalPageId': ''
					})
				}
			}
		},
		components: {
			login,
			register
		},
		computed:{
			...mapState('user', ['isLogin', 'modalData', 'modalPageId', 'modalShow', 
				'token']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			logoutFun(){
				let _self = this;
				this.setUserData({
					'modalData': {
						title: '温馨提示',
						content: '确定需要退出当前账号吗？',
						confirmText: '登出',
						cancelText: '手滑了',
						success: function (res) {
							if (res.confirm) {
								_self.setUserData({
									'isLogin': false,
									'token': ''
								})
								uni.showToast({
									title: '账号已退出'
								})
							}
						}
					},
					'modalShow': true,
					'modalPageId': 'login'
				})
			},
			loginFun(){
				this.$refs.cpLogin.show();
			}
		},
		onLoad(options) {
			let _self = this;
			if(options && options.msg){
				this.setUserData({
					'modalData': {
						title: '温馨提示',
						content: options.msg,
						cancelText: 'OK'
					},
					'modalShow': true,
					'modalPageId': 'login'
				})
			}
			uni.$on('chagePop', function(param){
				_self.$refs[param].show();
			})
			this.$nextTick(() => {
				this.$refs.cpLogin.hide();
				this.$refs.cpRegister.hide();
				if(!this.isLogin){
					if(options.msg != 'undefined') this.$refs.cpLogin.show(options.msg);
					else this.$refs.cpLogin.show();
				}
			})
		},
	}
</script>

<style>
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	.logout-btn{
		width: 50vw;
		margin: 20vh auto;
	}
</style>