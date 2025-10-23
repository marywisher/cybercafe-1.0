<template>
	<view>
		<cybercafe-card :cardTitle="card_title" @toggleDetail="titleChange">
			<view class="display-flex account-top-part">
				<image mode="aspectFit" :src="avatar" class="account-avatar"
					@tap="changeAvatar"></image>
				<view class="account-info">
					<view class="account-title">{{account_name}}</view>
					<view class="display-flex display-line info-part sp-between">
						<view>
							<view class="display-flex display-line">
								{{'ID:' + user_key}}
								<view class="iconfont icon-fuzhi" @tap="copyKey"></view>
							</view>
							<view class="hint" v-if="aimId == userId">
								{{'IP属地:' + ip_pos}}
							</view>
						</view>
						<followPart v-if="aimId != userId" ref="acFollowPart"
							:type="1" :aim="aimId" @tagTap="refreshFollow"></followPart>
						<checkinPart ref="acCheckinPart" @afterCheckin="getRequestCount"></checkinPart>
					</view>
					<view class="display-flex display-line tag-part">
						<view v-for="(item, index) in tags" :key="index" class="tag-item">{{item}}</view>
					</view>
				</view>
			</view>
			<cybercafe-view class="reward-part">
				<view class="display-flex display-line account-detail" v-if="aimId == userId">
					剩余米粒数： {{request_count}} 
					<cybercafe-button class="reward-detail" btnName="明细" @tapBtn="showRewardDetail"></cybercafe-button>
					<!-- <adPart ref="acAP" @afterFinish="getRequestCount"></adPart> -->
				</view>
				<view v-if="aimId == userId && userGroup == 2"
					 class="hint" :class="{'required': group_alarm}">
					月卡有效期至：{{expiration}} 0时
				</view>
			</cybercafe-view>
		</cybercafe-card>
		<image-part ref="aImgPart" :origin_img="avatar" showCreate :dark="darkMode"
			showLocal :showOnline="false" @afterClick="uploadAvatar"></image-part>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	import baseQuery from '@/func/dbManager/baseQuery';
	import adPart from './adPart';
	import followPart from './followPart';
	import checkinPart from '@/modules/account/checkinPart';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "userinfo",
		props: {
			/*aimId: {
				type: Number,
				default: 0
			},*/
		},
		data() {
			return {
				account_name: '',
				fans_num: 0,
				follow_num: 0,
				avatar: '',
				default_avatar: configData.voiceOver,
				user_key: '',
				request_count: 0,
				mode_label: '',
				group_alarm: false,
				expiration: '',
				card_title: '',
				tags: [],
				ip_pos: '未知'
			}
		},
		components: {
			adPart,
			checkinPart,
			followPart
		},
		watch: {
			ippos: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    this.ip_pos = newValue;
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		computed: {
			...mapState('user', ['aimId', 'darkMode', 'groupExpiration', 'newMsgCount', 
				'tag', 'userAvatar', 'userKey', 'userGroup']),
			...mapState('setting', ['ippos', 'userId']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			initPage(){
				this.avatar = this.default_avatar;
				
				//console.log(this.ippos);
				//console.log(this.aimId);
				let _self = this;
				if(this.aimId == this.userId && this.userAvatar){
					//console.log(this.userAvatar);
					uni.getFileInfo({
						filePath: this.userAvatar,
						success: function (info) {
							_self.avatar = _self.userAvatar;
						},
						fail: function (error) {
							if (error.errMsg.includes('file not found')) {
								console.log('文件不存在');
								// 文件不存在的处理逻辑
							} else {
								// 其他错误处理
							}
						}
					});
				}
				
				if(this.aimId > 0){
					let data = {
						'aim_id': this.aimId
					};
					request.post("userController/getUserInfo", 'globalSetting', data).then(res => {
						if (res.code == 200) {
							//console.log(res.result);
							_self.setUserData({'newMsgCount': res.result.new_msg});
							_self.account_name = res.result.user_nickname;
							_self.user_key = res.result.user_key;
							_self.fans_num = res.result.fans_num;
							_self.follow_num = res.result.follow_num;
							_self.avatar = res.result.avatar ? res.result.avatar : _self.default_avatar;
							//console.log(res.result.avatar);
							if(_self.aimId != _self.userId) _self.$refs.acFollowPart.init();
							else _self.$refs.acCheckinPart.init();
							
							//_self.$emit('afterInit', res.result.character_num, res.result.character_fans_num);
						} else {
							uni.showToast({
								title: res.msg,
								icon: "none"
							});
						}
					});
				}
				
				if(this.userId == this.aimId){
					this.getRequestCount();
					this.$nextTick(() => {
						//this.$refs.acAP.initAd();
					});
					
					const tmp_date = new Date(this.groupExpiration);
					this.expiration = tmp_date.getFullYear() + '年' + (tmp_date.getMonth() + 1) + '月' 
						+ tmp_date.getDate() + '日';
						
					const today = new Date();
					const daysDiff = Math.ceil((tmp_date.getTime() - today.getTime()) / (1000 * 3600 * 24));
					//console.log(daysDiff);
					if(daysDiff < 5){
						this.group_alarm = true;
					}
					//console.log(this.group_alarm);
					
					if(this.tag != '') this.tags = this.tag.split(',');
				}
				
				//获取ip
				//request.getIp();
			},
			changeAvatar(){
				if(this.aimId != this.userId) return;
				//console.log(this.avatar);
				this.$refs.aImgPart.openBox('0');
				uni.$emit('hideHeader', true);
			},
			copyKey(){
				common.copyText(this.userKey)
			},
			refreshFollow(e) {
				if (e == 1) {
					this.fans_num += 1;
				} else {
					this.fans_num -= 1;
				}
			},
			getRequestCount(){
				let _self = this;
				request.post("aiController/getRequestCount", 'globalSetting').then(res => {
					if (res.code == 200) {
						//console.log(res.result);
						_self.setUserData({'total_reward': res.result});
						_self.request_count = res.result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				});
			},
			showRewardDetail(){
				uni.navigateTo({
					url: '/pages/setting/rewardDetail'
				})
			},
			uploadAvatar(tempFilePath){
				let _self = this;
				request.post('characterController/submitImage', 'globalSetting', {
					file: tempFilePath,
					key: this.userKey
				}).then(res => {
					uni.hideLoading();
					if(res.code == 200){
						//console.log(res.result.src);
						//本地图片路径更新
						_self.setUserData({
							'userAvatar': res.result.src
						});
						baseQuery.updateDataByKey('cybercafe_images',{
							image_src: res.result.src
						},{
							image_src: tempFilePath
						});
						_self.avatar = res.result.src;
						uni.$emit('hideHeader', false);
					}else {
						//console.error(res.msg);
						uni.showToast({
							title: res.msg,
							icon: "none"
						})
					}
				});
			},
			titleChange(param){
				if(param){
					this.card_title = '';
					this.$nextTick(() => {
						//if(this.aimId != this.userId) this.$refs.acFollowPart.init();
						//else 
						this.$refs.acCheckinPart.show();
					})
				}else{
					this.card_title = '账号信息';
				}
			}
		},
	}
</script>

<style lang="scss">
	.account-info{
		flex: 1;
	}
	.account-info, .account-detail{
		color: $uni-text-color;
	}
	.account-title{
		font-weight: bold;
		font-size: $uni-font-size-huge;
	}
	.account-top-part, .info-part .hint{
		padding: $uni-spacing-lg $uni-width-none;
	}
	.account-avatar{
		height: calc(2 * $uni-img-size-lg);
		width: calc(2 * $uni-img-size-lg);
	}
	.reward-detail, .icon-fuzhi, .info-part, .account-title, .tag-part{
		margin-left: $uni-spacing-lg;
	}
	.tag-item{
		color: $uni-color-secondary;
		border-color: $uni-color-secondary;
	}
	@media (prefers-color-scheme: dark) {
		.account-info, .account-detail{
			color: $uni-text-color-grey;
		}
		.tag-item{
			color: $uni-color-dark-secondary;
			border-color: $uni-color-dark-secondary;
		}
	}
</style>