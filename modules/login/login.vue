<template>
	<view>
		<view class="iconfont icon-geren" v-show="showIcon"/>
		
		<cybercafe-view ref="loginView" :is-absolute="true" :closeAble="false" :viewTitle="form_flag == 'login' ? '登录' : '修改密码'"
			popViewStyle="margin:20vh auto;padding: 5vw;">
			<view class="content">
				<view class="display-flex sp-between login-line">
					<label>账号<span class="required">*</span></label>
					<input v-model="account" focus placeholder="请输入注册邮箱" />
				</view>
				<view class="display-flex sp-between login-line" v-if="form_flag == 'login'">
					<label>密码<span class="required">*</span></label>
					<input type="password" v-model="pwd" placeholder="请输入密码" />
				</view>
				<view v-else>
					<view class="display-flex sp-between">
						<label>新密码<span class="required">*</span></label>
						<input type="password" v-model="pwd" placeholder="请输入新的密码" />
					</view>
					<view class="display-flex login-line" style="justify-content: flex-end;">
						<view class="hint">（至少8个字符，包含至少1个大写字母、1个小写字母和1个数字）</view>
					</view>
					<view class="display-flex sp-between login-line">
						<label>重复密码<span class="required">*</span></label>
						<input type="password" v-model="repeatpwd" placeholder="与密码一致" />
					</view>
				</view>
				<view v-if="form_flag == 'login'" class="display-flex sp-between">
					<view class="hint" @tap="openReset">忘记密码？</view>
					<view>
						<cybercafe-button btnClass="btn-default" :btnDisable="true"
							btnName="注册稍后开放"></cybercafe-button><!--/验证码登录-->
					</view>
					<view>
						<cybercafe-button btnClass="btn-primary" @btnClick="submit('loginForm')"
							btnName="登录"></cybercafe-button>
					</view>
				</view>
				<view v-else class="display-flex sp-between">
					<view>
						<cybercafe-button btnClass="btn-primary" @btnClick="submit('resetForm')"
							btnName="修改"></cybercafe-button>
					</view>
					<view>
						<cybercafe-button btnClass="btn-default" @btnClick="closeReset"
							btnName="取消"></cybercafe-button>
					</view>
				</view>
			</view>
		</cybercafe-view>
	</view>
</template>

<script>
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: 'login',
		props: {
			loginText: {
				type: String,
				default: ''
			},
			showIcon: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				account: '',
				pwd: '',
				repeatpwd: '',
				// 表单数据
				form_flag: 'login', //login reset
			}
		},
		computed: {
			...mapState('user', ['darkMode', 'isLogin', 'modalData', 'modalShow']),
		},
		methods: {
			...mapMutations('user', ['setUserData', 'getUserData']),
			openReset(){
				this.form_flag = 'reset';
				this.$forceUpdate()
			},
			closeReset(){
				this.form_flag = 'login';
				this.$forceUpdate()
			},
			show(msg = ''){
				this.$refs.loginView.openView();
				
				if(msg){
					this.setUserData({
						'modalData': {
							content: msg,
							cancelText: '晓得了',
							success: (res) => {},
						},
						'modalShow': true,
					});
				}
			},
			hide(){
				this.$refs.loginView.closeView();
			},
			register(){
				this.hide();
				uni.$emit('chagePop', 'cpRegister');
			},
			submit(ref) {
				uni.showLoading();
				let _self = this
				if(this.form_flag == 'login'){//login
					request.post("userController/login", {
						account: this.account,//Base64.encode(this.account),
						pwd: this.pwd
					}).then(res => {
						if (res.code == 200) {
							console.log(res.result);
							_self.hide();
							let data = {
								userId: res.result.id,
								userName: res.result.name,//Base64.decode(res.result.name),
								userKey: res.result.key,
								token: res.result.token,
								userGroup: res.result.group,
								groupExpiration: res.result.expiration,
								latestVersion: res.result.latest_version,
								powerLevel: res.result.power_level,
								isLogin: true,
							};
							_self.setUserData(data);
							
							setTimeout(() => {
								_self.setUserData({
									modalData: {
										title: '登录',
										content: '欢迎，' + res.result.name,
										cancelText: 'OK'
									},
									modalShow: true,
								});
							}, 2000);
							uni.navigateTo({
								url: '/pages/index/index'
							})
							/* uni.switchTab({
								url: '/pages/index/index'
							}) */
						} else {
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
					}).catch(e => {
						uni.showToast({
							title: e.msg,
							icon: "none"
						});
					}).finally(() => {
						uni.hideLoading();
					});
				}else{//reset pwd
					if(this.pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/) == null) {
						uni.showToast({
							title: '密码至少8个字符，包含至少1个大写字母、1个小写字母和1个数字',
							icon: 'none'
						})
						return;
					}
					if(this.pwd != this.repeatpwd) {
						uni.showToast({
							title: '重复密码错误',
							icon: 'none'
						})
						return;
					}
					let _self = this;
					uni.showLoading();
					request.post("userController/resetPwd", {
						qq: this.account,
						pwd: this.pwd
					}).then(res => {
						if (res.code == 200) {
							console.log(res.result);
							_self.setUserData({
								'modalData': {
									content: res.result.msg,
									cancelText: '明白了',
									success: (res) => {
										if (res.cancel && res.result.msg == '密码已更新，请重新登录'){
											_self.form_flag = 'login';
											_self.$forceUpdate()
										}
									},
								},
								'modalShow': true,
							});
						}
					}).catch(e => {
						console.log(e);
					}).finally(() => {
						uni.hideLoading();
					});
				}
			},
			logoutConfirm() {
				console.log('logout');
				this.resetUserData();
				let _self = this;
				this.setUserData({
					'modalData': {
						title: '登出',
						content: '安全退出',
						cancelText: 'OK',
						success: (res) => {},
					},
					'modalShow': true,
				});
				this.$emit('afterLogout');
			},
		}
	}
</script>

<style lang="scss">
	.login-line{
		margin-bottom: $uni-spacing-lg;
	}
</style>
