<template>
	<view>
		<ad-rewarded-video ref="adRewardedVideo" :url-callback="url_callback" adpid="1479798083" :preload="false"
		    :loadnext="false" :disabled="true" v-slot:default="{loading, error}" @load="onadload" @close="onadclose"
		    @error="onaderror">
		</ad-rewarded-video>
		<cybercafe-button v-show="is_show" btnClass="btn-primary" :btnName="看广告得米粒"
			@tapBtn="showAd"></cybercafe-button>
		<view class="video-btn" v-show="is_show" @click="showAd">看广告得米粒</view>
	</view>
</template>

<script>
	import request from '@/func/common/request';
	import common from '@/func/common/common';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "adPart",
		props: {
		},
		data() {
			return {
				url_callback: {
					userId: 0,
					extra: ''
				},
				is_show: false
			}
		},
		computed: {
			...mapState('user', ['lastTimestampAd', 'modalData', 'modalPageId', 'modalShow',
				'userId']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			initAd(){
				this.getUserData();
				const now = Date.now();
				//console.log(now);
				//console.log(this.last_timestamp_ad);
				let tmstp = 0;
				if(this.lastTimestampAd) tmstp = this.lastTimestampAd;
				if((now - tmstp) > (60 * 60 * 1000)){
					this.is_show = true;
				}
			},
			showAd() {
				const now = Date.now();
				this.url_callback.userId = this.userId;
				this.url_callback.extra = common.getCurrentTimeStampStr();
			    this.is_show = false;
				this.$refs.adRewardedVideo.load();
				this.setUserData({'lastTimestampAd': now});
			},
			onadload(e) {
			    console.log('广告数据加载成功');
				this.$refs.adRewardedVideo.show();
			},
			onadclose(e) {
			    const detail = e.detail
				// 用户点击了【关闭广告】按钮
				if (detail && detail.isEnded) {
					// 正常播放结束
					console.log("onClose " + detail.isEnded);
					this.checkPay();
			    } else {
			        // 播放中途退出
					console.log("onClose " + detail.isEnded);
					uni.showModal({
						title: '温馨提示',
						content: '广告没有完成播放，无法获得米粒，请稍后重试',
						showCancel: false,
						confirmText: 'OK',
						success: function (res) {
							if (res.confirm) {
								console.log('用户点击确定');
							} 
						}
					});
			    }
			    // 播放完毕 手动加载下一条广告
			    //this.$refs.adRewardedVideo.load();
			},
			onaderror(e) {
				// 广告加载失败
			    console.log(e.detail);
				if(e.detail.code == -5002){
						
				}else if(e.detail.code == -5005){
					uni.showToast({
						title: '暂无匹配广告，请稍后重试',
						icon: 'none'
					})
				}
			},
			checkPay(){
				let _self = this;
				uni.showLoading({
					title: '奖励发放中...'
				});
				setTimeout(() => {
					request.post('userController/getAdPay', 'globalSetting', {
						'adpid': '1479798083',
						'extra': this.url_callback.extra
					}).then(res => {
						uni.hideLoading();
						//console.log(res.result);
						if (res.code == 200) {
							_self.$emit('afterFinish', res.result.point);
							_self.setUserData({
								'modalData': {
									title: '温馨提示',
									content: res.result.msg,
									cancelText: "OK",
								},
								'modalShow': true,
								'modalPageId': 'globalSetting'
							})
						}else{
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}						
					});
				}, 2000);
			}
		},
	}
</script>

<style lang="scss">
	.video-btn{
		background-color: $uni-color-main;
		color: $uni-text-color-disable;
		line-height: calc(2 * $uni-spacing-lg);
		padding: $uni-spacing-mini $uni-spacing-base;
		position: relative;
		border-radius: $uni-border-radius-circle;
		height: calc(2 * $uni-spacing-lg);
		margin-left: $uni-spacing-lg;
	}
	@media (prefers-color-scheme: dark) {
		.video-btn{
			background-color: $uni-color-dark-main;
		}
	}
</style>