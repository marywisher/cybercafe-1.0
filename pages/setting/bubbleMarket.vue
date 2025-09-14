<template>
	<view>
		<cybercafe-view v-for="(item, index) in market_arr" :key="index">
			<view :class="'pattern' + item.pattern_id">
				<view class="text-center">
					<label>{{item.pattern_name}}</label>
					<text class="tag-item"
						style="margin-left: 10px;">{{'By:' + item.author_name}}</text>
				</view>
				<view>
					<view class="chat-line left">
						<view class="chat-img-box" :style="dynamicImg">
							<image :style="dynamicImg" :src="default_character_img"></image>
						</view>
						<view class="chat-box" :style="dynamicChatBox">
							<view class="chat-item">
								<view v-html="item.pattern_html_left" :showline="false"></view>
							</view>
						</view>
					</view>
					<view class="chat-line right">
						<view class="chat-img-box" :style="dynamicImg">
							<image :style="dynamicImg" :src="default_user_img"></image>
						</view>
						<view class="chat-box" :style="dynamicChatBox">
							<view class="chat-item">
								<view v-html="item.pattern_html_right" :showline="false"></view>
							</view>
						</view>
					</view>
				</view>
				<view v-html="item.pattern_css"></view>
			</view>
			<view class="text-center">
				<cybercafe-button btnClass="btn-default" @tapBtn="showModal(item.pattern_id)"
					btnName="下载（10,000米粒/次）"></cybercafe-button>
			</view>
		</cybercafe-view>
		<view v-show="show_btm_hint" class="text-center hint market-btm-hint">暂无更多样式，敬请期待</view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import bubbleFun from '@/func/setting/bubbleFun';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data(){
			return {
				search_keys: [],
				market_arr: [],
				operate_id: 0,
				default_character_img: configData.avatarImg,
				default_user_img: configData.voiceOver,
				show_btm_hint: false,
			}
		},
		watch:{
			modalShow(newValue){
				if(newValue && this.modalPageId == 'bubbleMarket'){
					this.$refs.cModal.show(this.modalData);
					this.setUserData({
						'modalShow': false,
						'modalPageId': ''
					})
				}
			}
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow', 'totalReward']),
			...mapState('setting', ['bubbleAlign', 'imgWidth', 'imgRadius']),
			...mapState('bubble', ['cssAfter', 'cssPrev',
				'sampleTextLeft', 'sampleTextRight', 'searchKeys']),
			dynamicImg() {
				return `width: ${this.imgWidth}px; height: ${this.imgWidth}px; border-radius: ${this.imgRadius}px;`;
			},
			dynamicChatBox() {
				return this.bubbleAlign == true ? `width: calc(95vw - 40rpx - 10px - ${this.imgWidth}px);` :
					`width: calc(95vw - 40rpx - 20px - ${this.imgWidth * 2}px);`; //true为平铺
			}
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			...mapMutations('bubble', ['getBubbleData', 'setBubbleData']),
			showModal(operate_id){
				this.operate_id = operate_id;
				let _self = this;
				if (this.totalReward < 10000) {
					this.setUserData({
						'modalData': {
							content: '米粒数不足，无法下载，请联系群主充值',
							cancelText: '晓得了',
							success: (res) => {},
						},
						'modalShow': true,
						'modalPageId': 'bubbleMarket'
					});
				} else {
					this.setUserData({
						'modalData': {
							content: '下载当前气泡样式将消耗10,000米粒',
							cancelText: '取消',
							confirmText: '下载',
							success: (res) => {
								if (res.confirm) {
									_self.buyPattern();
								}
							},
						},
						'modalShow': true,
						'modalPageId': 'bubbleMarket'
					});
				}
			},
			buyPattern() {
				let _self = this;	
				uni.showLoading();
				request.post("settingController/downloadPattern", 'bubbleMarket', {
					pattern_id: this.market_arr[this.operate_id].pattern_id
				}).then(res => {
					if (res.code == 200) {
						let pattern_data = res.result.pattern;
						pattern_data.search_keys = _self.search_keys;
						bubbleFun.afterBuy(pattern_data);
						_self.setUserData({
							totalReward: res.result.reward
						});
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				}).catch(e => {
					console.log(e);
				}).finally(() => {
					uni.hideLoading();
				});
			},
			loadPattern(){
				let _self = this;
				request.post("settingController/getPatterns", 'bubbleMarket', {
					type: 'b',
					except: this.search_keys ? this.search_keys.join() : '',
				}).then(res => {
					if (res.code == 200) {
						console.log(res.result);
						if (res.result.length > 0) {
							let prev_num = _self.search_keys.length;
							for (let i in res.result) {
								if(_self.search_keys.indexOf(res.result[i].pattern_key) > -1) return;
								
								let pattern_html_left = res.result[i].pattern_html
									.replace(new RegExp('{{text}}', 'g'), _self.sampleTextLeft)
									.replace(new RegExp('{{side}}', 'g'), 'left');
								let pattern_html_right = res.result[i].pattern_html
									.replace(new RegExp('{{text}}', 'g'), _self.sampleTextRight)
									.replace(new RegExp('{{side}}', 'g'), 'right');
								_self.market_arr.push({
									'pattern_id': res.result[i].pattern_id,
									'pattern_key': res.result[i].pattern_key,
									'pattern_name': res.result[i].pattern_name,
									'pattern_html_left': pattern_html_left,
									'pattern_html_right': pattern_html_right,
									'pattern_css': _self.cssPrev + res.result[i].pattern_css
										+ _self.cssAfter,
									'download_count': res.result[i].pattern_download_count,
									'author_name': res.result[i].author_name
								});
								//console.log(res.result[i].pattern_css);
								_self.search_keys.push(res.result[i].pattern_key);
							}
							if(_self.search_keys.length == prev_num){
								_self.show_btm_hint = true;
							}else{
								_self.$forceUpdate();
							}
						} else {
							_self.show_btm_hint = true;
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				}).catch(e => {
					console.log(e);
				}).finally(() => {
					uni.hideLoading();
				});
			}
		},
		onShow() {
			this.show_btm_hint = false;
			this.market_arr = [];
			this.search_keys = this.searchKeys;
			console.log(this.search_keys);
			this.loadPattern();
		},
		onReachBottom() {
			if(this.show_btm_hint) return;
			this.loadPattern();
		}
	}
</script>

<style lang="scss">
	.market-item{
		width: 100vw;
	}
	.chat-line {
		padding: $uni-spacing-base $uni-width-none;
		display: flex;
		flex-direction: row;
	}
	.chat-line.right {
		flex-direction: row-reverse;
	}
	.chat-line.left .chat-img-box {
		margin-right: $uni-spacing-lg;
	}
	.chat-line.right .chat-img-box {
		margin-left: $uni-spacing-lg;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	.market-btm-hint{
		padding-bottom: $uni-spacing-lg;
	}
	@media (prefers-color-scheme: dark) {
		
	}
</style>