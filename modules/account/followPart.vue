<template>
	<view>
		<cybercafe-button :btnDisable="!follow_flag" :btnName="follow_str" btnClass="btn-primary"
			@tapBtn="follow"></cybercafe-button>
		<!-- <uni-fav :checked="follow_flag" :star="false" :content-text="follow_str" :circle="true" bg-color="#dd524d"
			bg-color-checked="#007aff" fg-color="#ffffff" fg-color-checked="#ffffff" @tap="follow" /> -->
	</view>
</template>

<script>
	import request from '@/func/common/request';
	export default {
		name: "followPart",
		props: {
			type: {
				type: Number,
				default: 1
			},
			aim: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				follow_flag: false,
				follow_str: {
					contentDefault: '+关注',
					contentFav: '已关注'
				}
			}
		},
		watch:{
			aim(newValue){
				this.init();
			}
		},
		methods: {
			init() {
				let data = {
					type: this.type,
					aim_id: this.aim
				};
				//console.log(this.aim);	
				if(this.aim > 0){
					let _self = this;
					request.post("userController/getFollow", 'globalSetting', data).then(res => {
						if (res.code == 200) {
							if (res.result == 1) {
								_self.follow_flag = true;
							} else {
								_self.follow_flag = false;
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
			follow() {
				let data = {
					type: this.type,
					aim_id: this.aim
				};
				
				if(this.aim > 0){
					let _self = this;
					request.post("userController/setFollow", 'globalSetting', data).then(res => {
						if (res.code == 200) {
							if (res.result == 1) {
								_self.follow_flag = true;
							} else {
								_self.follow_flag = false;
							}
							_self.$emit('tagTap', res.result);
						} else {
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
					});
				}
			}
		}
	}
</script>

<style>
</style>