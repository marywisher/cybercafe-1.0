<template>
	<view>
		<cybercafe-card cardTitle="容器气泡样式" :showDetail="show_detail" @toggleDetail="toggleDetail">
			<view class="sample">
				<view class="chat-line left">
					<view class="chat-img-box" :style="dynamicImg">
						<image :style="dynamicImg" :src="default_character_img"></image>
					</view>
					<view class="chat-box" :style="dynamicChatBox">
						<view class="chat-item">
							<view v-html="test_text_left" :style="dynamicFont('left')" :showline="false"></view>
						</view>
					</view>
				</view>
				<view class="chat-line right">
					<view class="chat-img-box" :style="dynamicImg">
						<image :style="dynamicImg" :src="default_user_img"></image>
					</view>
					<view class="chat-box" :style="dynamicChatBox">
						<view class="chat-item">
							<view v-html="test_text_right" :style="dynamicFont('right')" :showline="false"></view>
						</view>
					</view>
				</view>
				<bubbleGeneralSetting ref="bubbleGS"></bubbleGeneralSetting>
				<cybercafe-view>
					<marketPart @patternChange="patternChange"></marketPart>
					<bubbleColorSetting ref="bubbleCS"></bubbleColorSetting>
					<patternCode ref="bubblePC"></patternCode>
					<bubbleButtons></bubbleButtons>
				</cybercafe-view>
			</view>
		</cybercafe-card>
		<patternPart ref="patternList"></patternPart>
		<view v-html="dynamicPrevStyle"></view>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import bubbleFun from '@/func/setting/bubbleFun';
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	
	import bubbleColorSetting from '@/modules/setting/decorate/bubbleColorSetting';
	import bubbleButtons from '@/modules/setting/decorate/bubbleButtons';
	import bubbleGeneralSetting from '@/modules/setting/decorate/bubbleGeneralSetting';
	import marketPart from '@/modules/setting/decorate/marketPart';
	import patternCode from '@/modules/setting/decorate/patternCode';
	import patternPart from '@/modules/setting/decorate/patternPart';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "bubbleSetting",
		data() {
			return {
				default_character_img: configData.avatarImg,
				default_user_img: configData.voiceOver,
				test_text_left: '',
				test_text_right: '',
				show_detail: false,
			}
		},
		components:{
			bubbleColorSetting,
			bubbleButtons,
			bubbleGeneralSetting,
			marketPart,
			patternCode,
			patternPart
		},
		computed: {
			...mapState('user', ['settingOpen']),
			...mapState('setting', ['bubbleAlign', 'bubbleColor', 'bubbleOpacity', 
				'chatCss', 'chatHtml', 'chatPattern', 'fontColor', 'fontSize',
				'imgWidth', 'imgRadius']),
			...mapState('bubble', ['bubbleColor1', 'bubbleColor2', 'displayCss', 'displayHtml',
				'fontColor1', 'fontColor2', 'patternCss', 'patternHtml', 
				'previewCss', 'sampleTextLeft', 'sampleTextRight']),
			dynamicFont() {
				return function(side) {
					if (side == 'left') {
						return `font-size: ${this.fontSize}px; color: ${this.fontColor1}`;
					}
					return `font-size: ${this.fontSize}px; color: ${this.fontColor2}`;
				}
			},
			dynamicImg() {
				return `width: ${this.imgWidth}px; height: ${this.imgWidth}px; border-radius: ${this.imgRadius}px;`;
			},
			dynamicChatBox() {
				return this.bubbleAlign == true ? `width: calc(95vw - 40rpx - 10px - ${this.imgWidth}px);` :
					`width: calc(95vw - 40rpx - 20px - ${this.imgWidth * 2}px);`; //true为平铺
			},
			dynamicPrevStyle(){
				return this.previewCss.replace(new RegExp('{{bg-color1}}', 'g'), this.bubbleColor1)
					.replace(new RegExp('{{bg-color2}}', 'g'), this.bubbleColor2)
					.replace(new RegExp('{{color1}}', 'g'), this.fontColor1)
					.replace(new RegExp('{{color2}}', 'g'), this.fontColor2)
					.replace(new RegExp('{{bubbleOpacity}}', 'g'), this.bubbleOpacity);
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			...mapMutations('bubble', ['getBubbleData', 'setBubbleData']),
			async init() {
				await bubbleFun.updateLocalData();
				
				this.getUserData();
				this.getSettingData();
				this.getBubbleData();
				if(this.settingOpen.bubble) this.show_detail = true;
				else this.show_detail = false;
				if (this.fontColor.length != 2) {
					this.setSettingData({
						'fontColor': ['rgb(52,52,52)', 'rgb(52,52,52)'],
						'bubbleColor': ['rgba(204,204,204, {{bubbleOpacity}})', 'rgba(204,204,204,{{bubbleOpacity}})']
					});
				}
				await bubbleFun.getPatternRange();
				await bubbleFun.loadPattern(this.chatPattern);
				this.setBubbleData({
					'patternHtml': this.chatHtml,
					'patternCss': this.chatCss.substr(7, this.chatCss.length - 15),
					'displayHtml': this.chatHtml,
					'displayCss': this.chatCss.substr(7, this.chatCss.length - 15),
					'fontColor1': this.fontColor[0],
					'fontColor2': this.fontColor[1],
					'bubbleColor1': this.bubbleColor[0],
					'bubbleColor2': this.bubbleColor[1]
				});
				this.test_text_left = common.textToHtml(this.sampleTextLeft, 'left', true, this.patternHtml);
				this.test_text_right = common.textToHtml(this.sampleTextRight, 'right', true, this.patternHtml);
				//console.log(this.test_text_right);
				if(this.show_detail){
					this.initComp();
				}
			},
			initComp(){
				this.$refs.bubbleGS.init();
				this.$refs.bubbleCS.init();
				this.$refs.bubblePC.init();
			},
			toggleDetail(param){
				this.show_detail = param;
				
				let tmp = this.settingOpen;
				tmp.bubble = this.show_detail;
				this.setUserData({'settingOpen': tmp});
			},
			patternChange(){//更多pattern
				this.$refs.patternList.openView();
			},
		},
	}
</script>

<style lang="scss">
	.chat-line {
		padding: 10rpx 0;
		display: flex;
		flex-direction: row;
	}

	.chat-line.right {
		flex-direction: row-reverse;
	}

	.chat-line.left .chat-img-box {
		margin-right: 10px;
	}

	.chat-line.right .chat-img-box {
		margin-left: 10px;
	}

	
	/* .market-list .group-item {
		width: 45vw;
	}

	.scroll-part {
		max-height: 55vh;
	}

	.swiper-box {
		width: 100vw;
		height: 60vh;
	}
	.bubble-setting-label{
		width: 30vw;
	}
	.bubble-setting-right{
		width: 50vw;
	} */
	
	/* .pattern-list .scroll-part2 {
		max-height: 95vh;
	}
	 */
	
	
	@media (prefers-color-scheme: dark) {
		/* .pattern-list{
			background-color: #1f1f1f;
		}
		.close-btn{
			color: #999;
		} */
	}
</style>