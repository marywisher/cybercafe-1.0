<template>
	<view>
		<view class="iconfont icon-geren" v-show="showIcon"/>
		
		<cybercafe-view ref="loginView" :is-absolute="true" :closeAble="false" :viewTitle="form_flag == 'login' ? '登录' : '修改密码'"
			popViewStyle="margin:20vh auto;padding: 5vw;">
			<view class="content">
				<view class="display-flex display-line sp-between login-line">
					<label>账号<span class="required">*</span></label>
					<input v-model="account" focus placeholder="请输入注册邮箱" />
				</view>
				<view class="display-flex display-line sp-between login-line" v-if="form_flag == 'login'">
					<label>密码<span class="required">*</span></label>
					<input type="password" v-model="pwd" placeholder="请输入密码" />
				</view>
				<view v-show="form_flag == 'reset'">
					<view class="display-flex display-line sp-between">
						<label>新密码<span class="required">*</span></label>
						<input type="password" v-model="pwd" placeholder="请输入新的密码" />
					</view>
					<view class="display-flex login-line" style="justify-content: flex-end;">
						<view class="hint pwd-hint">（至少8个字符，包含至少1个大写字母、1个小写字母和1个数字）</view>
					</view>
					<view class="display-flex display-line sp-between login-line">
						<label>重复密码<span class="required">*</span></label>
						<input type="password" v-model="repeatpwd" placeholder="与密码一致" />
					</view>
				</view>
				<view v-show="form_flag == 'login'" class="display-flex display-line sp-between">
					<view class="hint" @tap="openReset">忘记密码？</view>
					<view>
						<cybercafe-button btnClass="btn-default" :btnDisable="true"
							btnName="注册稍后开放"></cybercafe-button><!--/验证码登录-->
					</view>
					<view>
						<cybercafe-button btnClass="btn-primary" @tapBtn="submit('loginForm')"
							btnName="登录"></cybercafe-button>
					</view>
				</view>
				<view v-show="form_flag == 'reset'" class="display-flex display-line sp-between">
					<view>
						<cybercafe-button btnClass="btn-default" @tapBtn="closeReset"
							btnName="取消"></cybercafe-button>
					</view>
					<view>
						<cybercafe-button btnClass="btn-primary" @tapBtn="submit('resetForm')"
							btnName="修改"></cybercafe-button>
					</view>
				</view>
				<view class="hint text-center info" @tap="gotoInfo">—— 食堂使用说明 ——</view>
			</view>
		</cybercafe-view>
	</view>
</template>

<script>
	import request from '@/func/common/request';
	import handleFun from '@/func/common/handleFun';
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
				default: false
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
			...mapState('user', ['isLogin', 'modalData', 'modalPageId', 'modalShow']),
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
				
				if(msg.length > 0){
					this.setUserData({
						'modalData': {
							content: msg,
							cancelText: 'OK',
						},
						'modalShow': true,
						'modalPageId': 'login'
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
					request.post("userController/login", 'login', {
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
							
							_self.setUserData({
								'modalData': {
									'title': '登录',
									'content': '欢迎，' + res.result.name,
									'cancelText': 'OK'
								},
								'modalShow': true,
								'modalPageId': 'chat'
							});
							handleFun.beforeInit();
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
					request.post("userController/resetPwd", 'login', {
						qq: this.account,
						pwd: this.pwd
					}).then(res => {
						if (res.code == 200) {
							console.log(res.result);
							_self.setUserData({
								'modalData': {
									content: res.result.msg,
									cancelText: 'OK',
									success: (res) => {
										if (res.cancel && res.result.msg == '密码已更新，请重新登录'){
											_self.form_flag = 'login';
											_self.$forceUpdate()
										}
									},
								},
								'modalShow': true,
								'modalPageId': 'login'
							});
						}
					}).catch(e => {
						console.log(e);
					}).finally(() => {
						uni.hideLoading();
					});
				}
			},
			gotoInfo(){
				uni.navigateTo({
					url: '../index/info?p=using'
				})
			}
		}
	}
</script>

<style lang="scss">
	.login-line{
		margin-bottom: $uni-spacing-lg;
	}
	label{
		width: 40vw;
	}
	.pwd-hint{
		margin-top: $uni-spacing-lg;
	}
	.info{
		margin-top:$uni-spacing-lg;
	}
</style>
