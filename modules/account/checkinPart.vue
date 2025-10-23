<template>
	<view class="display-flex checkin-box">
		<cybercafe-button v-show="show_checkin" :btnDisable="checkin_flag" @tapBtn="checkin"
			:btnName="checkin_flag ? checkin_str.contentFav : checkin_str.contentDefault"
			btnClass="btn-primary"></cybercafe-button>
		<view class="hint">{{checkin_tip}}</view>
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
		name: "checkinPart",
		props: {
		},
		data() {
			return {
				checkin_flag: false,
				checkin_str: {
					contentDefault: '签到',
					contentFav: '已签到'
				},
				checkin_tip: '',
				show_checkin: false,
			}
		},
		computed: {
			...mapState('setting', ['userId']),
		},
		methods: {
			...mapMutations('user', ['getSettingData']),
			init() {
				let _self = this;
				request.post("userController/getCheckin", 'globalSetting').then(res => {
					if (res.code == 200) {
						_self.show_checkin = true;
						if (res.result == 1) {
							_self.checkin_flag = true;//已签
						} else {
							_self.checkin_flag = false;
							_self.checkin_tip = res.result;//未签
						}
					} else {
						_self.show_checkin = false;
						/*uni.showToast({
							title: res.msg,
							icon: "none"
						});*/
						_self.checkin_tip = res.msg;
					}
				});
			},
			checkin() {
				let _self = this;
				if(this.checkin_flag == false){
					request.post("userController/setCheckin", 'globalSetting').then(res => {
						if (res.code == 200) {
							_self.checkin_flag = true;
							_self.checkin_tip = '';
							uni.showToast({
								title: res.result.message,
								icon: "none"
							});
							if(res.result.count > 0){
								_self.$emit('afterCheckin', res.result.count);
							}
						} else {
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
					});
				}
			},
			show(){
				this.show_checkin = true;
			}
		}
	}
</script>

<style lang="scss">
	.checkin-box{
		flex-direction: column;
		align-items: flex-end;
	}
	/* .checkin-btn{
		color: #fff;
		border-radius: 10px;
		font-size:12px;
		padding:2px 6px;
	} */
</style>