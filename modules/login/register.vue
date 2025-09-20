<template>
	<view>
		<cybercafe-view ref="registerView" :isAbsolute="true" :closeAble="false" viewTitle="注册/验证码登录"
			popViewStyle="margin:20vh auto;padding: 5vw;">
			<view class="content">
				<label class="hint required">* 为必填项</label><br>
				<view class="display-flex display-line sp-between register-line">
					<label>邮箱<span class="required">*</span></label>
					<input v-model="username"  focus placeholder="请输入注册邮箱" @input="checkEmail" />
				</view>
				<view class="display-flex display-line sp-between register-line">
					<label>验证码<span class="required">*</span></label>
					<view class="display-flex">
						<input v-model="verify_code" maxlength="6" style="width: 158px;" @input="setVerifyCode" />
						<cybercafe-button btnClass="btn-default" @tapBtn="sendVerify"
							btnName="发送"></cybercafe-button>
					</view>					
				</view>
				<view class="display-flex display-line sp-between">
					<label>邀请码</label>
					<input v-model="invite_code" maxlength="8" placeholder="请填写邀请码" @input="setInviteCode" />
				</view>
				<view class="display-flex register-line" style="justify-content: flex-end;">
					<view class="hint">（注册成功送1w米粒，填写邀请码再送1w米粒）</view>
				</view>
				
				<view class="display-flex display-line sp-between">
					<view>
						<cybercafe-button btnClass="btn-default" @tapBtn="login"
							btnName="密码登录"></cybercafe-button>
					</view>
					<view>
						<cybercafe-button btnClass="btn-primary" @tapBtn="submitRegister"
							btnName="注册/登录"></cybercafe-button>
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
		name: 'register',
		data() {
			return {
				// 表单数据
				username: '',
				invite_code: '',
				verify_code: '',
				
				email_check: false,
			}
		},
		computed: {
			...mapState('user', ['darkMode', 'isLogin', 'modalData', 'modalPageId',
				'modalShow']),
		},
		methods: {
			...mapMutations('user', ['setUserData', 'getUserData']),
			show(){
				this.$refs.registerView.openView();
			},
			hide(){
				this.$refs.registerView.closeView();
			},
			login(){
				this.hide();
				uni.$emit('chagePop', 'cpLogin');
			},
			checkEmail(e){
				this.username = e.detail.value;
				if(this.username.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) == this.username){
					this.email_check = true;
				}else{
					this.email_check = false;
				}
			},
			setVerifyCode(e){
				this.verify_code = e.detail.value;
			},
			setInviteCode(e){
				this.invite_code = e.detail.value;
			},
			sendVerify(e){
				if(this.username.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) != this.username){
					uni.showToast({
						title: '请正确填写邮箱',
						icon: 'none'
					})
					return;
				}
				
				uni.showLoading();
				request.post("userController/sendVerifyCode", 'login', {
					name: this.username,
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: res.msg,
							icon: "success"
						});
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
			},
			submitRegister() {
				let _self = this;
				console.log(this.invite_code.match(/^\d{6}$/))
				/* if(this.invite_code.match(/^\d{6}$/) != this.invite_code){
					uni.showToast({
						title: '请正确填写验证码',
						icon: 'none'
					})
					return;
				} */
				if(this.username.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) != this.username){
					uni.showToast({
						title: '请正确填写邮箱',
						icon: 'none'
					})
					return;
				}
				if(this.invite_code){
					if(this.invite_code.match(/^(?=.*[A-Z])(?=.*\d)[A-Z\d]{8}$/) == null) {
						uni.showToast({
							title: '邀请码为8个大写字母或数字',
							icon: 'none'
						})
						return;
					}
				}
				
				uni.showLoading();
				request.post("userController/newRegister", 'chat', {
					name: this.username,
					verify: this.verify_code,
					code: this.invite_code,
				}).then(res => {
					if (res.code == 200) {
						//console.log(res.result);
						//登录跳转
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
						_self.setUserData(data);
						_self.setUserData({
							'modalData': {
								content: '欢迎，' + res.result.name,
								success: (res) => {}
							},
							'modalShow': true,
							'modalPageId': 'chat'
						});
						/* uni.switchTab({
							url: '/pages/index/index'
						}) */
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
			},
			gotoInfo(){
				uni.navigateTo({
					url: '../index/info?p=using'
				})
			}
		},
	}
</script>

<style lang="scss">
	.register-line{
		margin-bottom: $uni-spacing-lg;
	}
	.info{
		margin-top:20rpx;
	}
</style>