<template>
	<cybercafe-view ref="emailView" isAbsolute closeAble viewTitle="修改邮箱">
		<view class="required">* 重要提醒：如果需要更换手机，请务必先上传数据，至新手机下载<br/><br/>
		* 若有合并账号需求，请联系管理员<br/><br/>
	    * 请注意将 cybercafe.app@foxmail.com 添加到您的邮箱白名单中，以确保能接收到验证码。<br/><br/>
		* 原密码（如果有）保持不变</view>
		<cybercafe-view>
			<view class="display-flex display-line sp-between register-line">旧邮箱：{{user_email}}</view>
			<view class="display-flex display-line sp-between register-line">
				<view>新邮箱<span class="required">*</span></view>
				<input v-model="email_str" :maxlength="-1" style="width: 70%;" @input="emailCheck"/>
			</view>
			<view class="display-flex display-line sp-between register-line">
				<input v-model="email_code" :maxlength="6" style="width: 60%;" @input="codeCheck"/>
				<cybercafe-button btnClass="btn-default" :btnDisable="code_btn_disable"
					@tapBtn="sendCode" btnName="获取验证码"></cybercafe-button>
			</view>
			<cybercafe-button btnClass="btn-primary" :btnDisable="change_btn_disable"
					@tapBtn="changeEmail" btnName="修改邮箱"></cybercafe-button>
		</cybercafe-view>
	</cybercafe-view>
</template>

<script>
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'changeEmail',
		data(){
			return{
				email_str: '',
				email_code: '',
				code_btn_disable: true,
				change_btn_disable: true,
				user_email: ''
			}
		},
		computed:{
			...mapState('setting', ['token', 'userId']),
			...mapState('user', ['modalData', 'modalPageId', 'modalShow', 'userEmail']),
		},
		methods: {
			...mapMutations('setting', ['setSettingData', 'getSettingData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			open(){
				this.$refs.emailView.openView();
				this.user_email = this.userEmail;
			},
			emailCheck(e){
				this.email_str = e.detail.value;
				if(this.email_str.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) == this.email_str){
					this.code_btn_disable = false;
				}else{
					this.code_btn_disable = true;
				}
			},
			sendCode(){
				uni.showLoading();
				this.code_btn_disable = true;
				let _self = this;
				request.post("userController/sendVerifyCode", 'globalSetting', {
					name: this.email_str,
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
							'modalPageId': 'globalSetting'
						});
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
						_self.code_btn_disable = false;
					}
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: "none"
					});
					_self.code_btn_disable = false;
				}).finally(() => {
					uni.hideLoading();
				});
			},
			codeCheck(e){
				this.email_code = e.detail.value;
				if(this.email_code.match(/^\d{6}$/) != this.email_code){
					this.change_btn_disable = true;
				}else{
					this.change_btn_disable = false;
				}
			},
			changeEmail(){
				if(this.email_code.match(/^\d{6}$/) != this.email_code){
					uni.showToast({
						title: '请正确填写验证码',
						icon: 'none'
					})
					return;
				}
				if(this.email_str.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) != this.email_str){
					uni.showToast({
						title: '请正确填写邮箱',
						icon: 'none'
					})
					return;
				}
				
				let _self = this;
				request.post("userController/changeEmail", 'globalSetting', {
					email: this.email_str,
					code: this.email_code
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
							'modalPageId': 'globalSetting',
							
							'userEmail': _self.email_str
						});
						
						_self.setSettingData({
							'userId': res.result.id,
							'token': res.result.token
						})
						_self.user_email = _self.email_str;
						_self.email_str = '';
						_self.email_code = '';
						_self.code_btn_disable = true;
						_self.change_btn_disable = true;
						_self.$refs.emailView.closeView();
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: "none"
					});
				}).finally(() => {
					uni.hideLoading();
				});
			}
		}
	}
</script>

<style lang="scss">
	.register-line{
		margin-bottom: $uni-spacing-lg;
	}
</style>