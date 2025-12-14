<template>
	<view>
		<cybercafe-view ref="registerView" :isAbsolute="true" :closeAble="false" viewTitle="注册/验证码登录"
			popViewStyle="margin:20vh auto;padding: 5vw;">
			<view class="content">
				<label class="hint required">* 为必填项</label>
				<view class="display-flex display-line sp-between register-line">
					<view class="register-label">邮箱<span class="required">*</span></view>
					<view class="register-input">
						<input v-model="username"  focus placeholder="请输入注册邮箱" @input="checkEmail"
							:placeholder-style="placeholderStyle"/>
					</view>
				</view>
				<view class="display-flex display-line sp-between register-line">
					<view class="register-label">验证码<span class="required">*</span></view>
					<view class="display-flex display-line sp-between register-input">
						<input v-model="verify_code" maxlength="6" style="width: 60%;" @input="setVerifyCode" />
						<cybercafe-button :btnDisable="email_check" btnClass="btn-primary" @tapBtn="sendVerify"
							btnName="发送"></cybercafe-button>
					</view>
				</view>
				<view class="hint text-center info">—— 以下仅注册时填写 ——</view>
				<view class="display-flex display-line sp-between register-line">
					<view class="register-label">昵称</view>
					<view class="register-input">
						<input v-model="nickname" placeholder="请填写昵称（默认同邮箱名）" @input="setNickname"
							:placeholder-style="placeholderStyle"/>
					</view>
				</view>
				<view class="display-flex display-line sp-between register-line">
					<view class="register-label">邀请码</view>
					<view class="register-input">
						<input v-model="invite_code" maxlength="8" placeholder="请填写邀请码" @input="setInviteCode"
							:placeholder-style="placeholderStyle"/>
					</view>
				</view>
				<view class="display-flex register-line" style="justify-content: flex-end;">
					<view class="hint">（注册成功送1w米粒，填写邀请码再送）</view>
				</view>
				
				<view class="display-flex display-line sp-between">
					<view>
						<cybercafe-button btnClass="btn-default" @tapBtn="login"
							btnName="密码登录"></cybercafe-button>
					</view>
					<view>
						<cybercafe-button btnClass="btn-primary" @tapBtn="submitRegister"
							btnName="注册/验证码登录"></cybercafe-button>
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
	import { VERSION } from "@/func/common/common";
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
				nickname: '',
				
				email_check: false,
			}
		},
		computed: {
			...mapState('user', ['deviceInfo', 'modalData', 'modalPageId', 'modalShow']),
			...mapState('setting', ['darkMode', 'isLogin', 'token', 'userId']),
			placeholderStyle(){
				return this.darkMode == 'light' ? 'color: #c0c0c0;' : 'color: #808080;';
			}
		},
		methods: {
			...mapMutations('user', ['setUserData', 'getUserData']),
			...mapMutations('setting', ['setSettingData', 'getSettingData']),
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
			setNickname(e){
				this.nickname = e.detail.value;
			},
			sendVerify(e){
				if(this.username.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) != this.username){
					uni.showToast({
						title: '请正确填写邮箱',
						icon: 'none'
					})
					return;
				}
				
				let _self = this;
				uni.showLoading();
				this.email_check = false;
				request.post("userController/sendVerifyCode", 'login', {
					name: this.username,
				}).then(res => {
					if (res.code == 200) {
						_self.setUserData({
							'modalData': {
								content: res.result,
								confirmText: '',
								cancelText: 'OK',
								success: (res) => {}
							},
							'modalShow': true,
							'modalPageId': 'login'
						});
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
						_self.email_check = true;
					}
				}).catch(e => {
					uni.showToast({
						title: e.msg,
						icon: "none"
					});
					_self.email_check = true;
				}).finally(() => {
					uni.hideLoading();
				});
			},
			submitRegister() {
				let _self = this;
				//console.log(this.verify_code.match(/^\d{6}$/))
				if(this.verify_code.match(/^\d{6}$/) != this.verify_code){
					uni.showToast({
						title: '请正确填写验证码',
						icon: 'none'
					})
					return;
				}
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
				request.post("userController/newRegister", 'login', {
					name: this.username,
					verify: this.verify_code,
					code: this.invite_code,
					nickname: this.nickname,
					version: VERSION,
					device: this.deviceInfo,
				}).then(res => {
					if (res.code == 200) {
						//console.log(res.result);
						//登录跳转
						_self.hide();
						_self.setSettingData({
							'userId': res.result.id,
							'token': res.result.token,
							'groupExpiration': res.result.expiration,
							'isLogin': true
						})
						let data = {
							userName: res.result.name,//Base64.decode(res.result.name),
							userKey: res.result.key,
							userGroup: res.result.group,
							latestVersion: res.result.latest_version,
							powerLevel: res.result.power_level,
						};
						_self.setUserData(data);
						_self.setUserData({
							'modalData': {
								content: '欢迎，' + res.result.name,
								confirmText: '',
								cancelText: 'OK',
								success: (res) => {}
							},
							'modalShow': true,
							'modalPageId': 'chat'
						});
						/* uni.switchTab({
							url: '/pages/index/index'
						}) */
						handleFun.beforeInit('login');
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
		margin: $uni-spacing-lg auto;
	}
	.register-label{
		width: 25%;
	}
	.register-input{
		width: 75%;
	}
</style>