<template>
	<view>
		<cybercafe-view ref="registerView" :isAbsolute="true" :closeAble="false" viewTitle="注册"
			popViewStyle="width: 80vw;margin:20vh auto;">
			<view class="content">
				<label class="hint required">* 为必填项</label><br>
				<view class="display-flex sp-between register-line">
					<label>昵称<span class="required">*</span></label>
					<input focus v-model="nickname" maxlength="10" />
				</view>
				<view class="display-flex sp-between register-line">
					<label>QQ号<span class="required">*</span></label>
					<input v-model="username" maxlength="12" />
				</view>
				<view class="display-flex sp-between">
					<label>设置密码<span class="required">*</span></label>
					<input type="password" v-model="pwd" placeholder="请输入密码" />
				</view>
				<view class="display-flex register-line">
					<label class="hint">（至少8个字符，包含至少1个大写字母、1个小写字母和1个数字）</label>
				</view>
				<view class="display-flex sp-between register-line">
					<label>重复密码<span class="required">*</span></label>
					<input type="password" v-model="repeatpwd" placeholder="与密码一致" />
				</view>
				<view class="display-flex sp-between register-line">
					<label>邀请码<span class="required">*</span></label>
					<input v-model="inviteCode" />
				</view>
				
				<view class="display-flex sp-between">
					<view>
						<button @tap="login" size="mini">已有账号</button>
					</view>
					<view>
						<button type="primary" @tap="submitRegister" size="mini">注册</button>
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
		name: 'register',
		data() {
			return {
				// 表单数据
				nickname: '',
				username: '',
				pwd: '',
				repeatpwd: '',
				inviteCode: '',
			}
		},
		computed: {
			...mapState('user', ['isLogin']),
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
			submitRegister() {
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
				if(this.username.match(/^[1-9][0-9]{6,11}$/) != this.username){
					uni.showToast({
						title: '请正确填写QQ号',
						icon: 'none'
					})
					return;
				}
				if(this.inviteCode.match(/^(?=.*[A-Z])(?=.*\d)[A-Z\d]{8}$/) == null) {
					uni.showToast({
						title: '邀请码为8个大写字母或数字',
						icon: 'none'
					})
					return;
				}
				
				
				uni.showLoading();
				request.post("userController/autoRegister", {
					nickname: this.nickname,
					qq: this.username,
					pwd: this.pwd,
					code: this.inviteCode,
				}).then(res => {
					uni.hideLoading();
					if (res.code == 200) {
						console.log(res.result);
						uni.showModal({
							title: '温馨提示',
							content: res.result.msg,
							showCancel: false,
							confirmText: '明白了',
							success: function (res) {
								if (res.confirm) {
									//console.log('用户点击确定');
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
			},
		},
	}
</script>

<style lang="scss">
	.register-line{
		margin-bottom: $uni-spacing-base;
	}
</style>