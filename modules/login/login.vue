<template>
	<view @tap="loginShow">
		<view class="iconfont icon-geren" v-show="showIcon"/>
		
		<cybercafe-view ref="loginView" :is-absolute="true" :closeAble="false" :viewTitle="form_flag == 'login' ? '登录' : '修改密码'"
			popViewStyle="width: 80vw;margin:20vh auto;">
			<view class="content">
				<view class="display-flex sp-between login-line">
					<label>账号<span class="required">*</span></label>
					<input v-model="account" focus placeholder="请输入账号(qq号@qq.com)" />
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
						<button @tap="register" size="mini">注册</button>
					</view>
					<view>
						<button type="primary" @tap="submit('loginForm')" size="mini">登录</button>
					</view>
				</view>
				<view v-else class="display-flex sp-between">
					<view>
						<button type="primary" @tap="submit('resetForm')" size="mini">修改</button>
					</view>
					<view>
						<button @tap="closeReset" size="mini">取消</button>
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
			...mapState('user', ['isLogin']),
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
			show(){
				this.$refs.loginView.openView();
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
						uni.hideLoading();
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
								isLogin: true
							};
							
							for(let key in data){
								_self.setUserData({'key': key, 'data': data[key]});
							}
							
							uni.showModal({
								title: '登录',
								content: '欢迎，' + res.result.name,
								showCancel: false,
								confirmText: 'ok',
								success: function (res) {
									if (res.confirm) {
										console.log('用户点击确定');
									} 
								}
							});
							/* uni.switchTab({
								url: '/pages/index/index'
							}) */
							uni.navigateTo({
								url: '/pages/index/index'
							})
						} else {
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
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
						uni.hideLoading();
						if (res.code == 200) {
							console.log(res.result);
							uni.showModal({
								title: '温馨提示',
								content: res.result.msg,
								showCancel: false,
								confirmText: '明白了',
								success: function (res1) {
									if (res1.confirm) {
										//console.log('用户点击确定');
										if(res.result.msg == '密码已更新，请重新登录'){
											_self.form_flag = 'login';
											_self.$forceUpdate()
										}
									} 
								}
							});
						} else {
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
					});
				}
			},
			logoutConfirm() {
				console.log('logout');
				this.resetUserData();
				uni.showModal({
					title: '登出',
					content: '安全退出',
					showCancel: false,
					confirmText: 'ok',
					success: function (res) {
						if (res.confirm) {
							console.log('用户点击确定');
						} 
					}
				});
				this.$emit('afterLogout');
			},
		}
	}
</script>

<style lang="scss">
	.login-line{
		margin-bottom: $uni-spacing-base;
	}
</style>
