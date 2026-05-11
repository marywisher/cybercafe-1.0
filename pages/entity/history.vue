<template>
    <view class="chat-main">
        <chatBg></chatBg>
		<water-mark v-if="userKey" class="watermark" :text1="userKey" 
			:text2="userName" :darkMode="dark_mode"></water-mark>
		<historyHeader :bgOpacity="bg_opacity" @searchConfirm="handleSearchConfirm"></historyHeader>
        <view class="chat-body content">
			<!-- 内容区 -->
			<view v-for="(item, index) in history_list" :key="index" class="display-flex chat-line">
				<!-- 渲染历史消息 -->
				<view class="chat-box">
					<view class="chat-item">
						<view v-html="item.html" :style="dynamicFont(item.character_id ? 'left' : 'right')" :showline="false"></view>
					</view>
				</view>
			</view>
		</view>
		<view v-html="entity_css"></view>
    </view>
</template>

<script>
    import dialogueQuery from '@/func/dbManager/dialogueQuery';
    import historyHeader from '@/modules/entity/historyHeader';
	import chatBg from '@/modules/chat/chatBg';
	import common from '@/func/common/common';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data(){
			return{
				break_point: 0,
				dark_mode: 'light',
				history_list: [],
				entity_css: '',
				bg_opacity: 0,
				keyword: ''
			}
		},
        components:{
            historyHeader,
            chatBg
        },
		computed: {
			...mapState('user', ['userKey', 'userName']),
			...mapState('setting', ['bubbleAlign', 'bubbleColor', 'bubbleOpacity', 
				'chatCss', 'chatPattern', 'darkMode',
				'fontColor', 'fontSize']),
			dynamicFont() {
				return function(side) {
					if(side == 'left'){
						return `font-size: ${this.fontSize}px; color: ${this.fontColor[0]}`;
					}
					return `font-size: ${this.fontSize}px; color: ${this.fontColor[1]}`;
				}
			},
		},
		methods: {
			...mapMutations('user', ['getUserData']),
			...mapMutations('setting', ['getSettingData']),
			async init(){
				uni.showLoading({
					title: '加载中...'
				})
				this.dark_mode = this.darkMode;
				//console.log(this.dark_mode);
				//console.log(this.userKey);
				this.replaceParam();
				this.history_list = await dialogueQuery.getMessageHistoryByEntityId(this.keyword, this.break_point);
				for(let i = 0; i < this.history_list.length; i ++){
					//console.log(this.history_list[i]);
					this.history_list[i].html = common.textToHtml(this.history_list[i].message_content, 
						this.history_list[i].character_id == 0 ? 'right' : 'left', true);
				}
				//console.log(this.history_list);
				this.break_point += this.history_list.length;
				uni.hideLoading();
			},
			loadMore(){
				// 加载更多历史消息
				dialogueQuery.getMessageHistoryByEntityId(this.keyword, this.break_point).then(newMessages => {
					if (newMessages.length > 0) {
						for(let i = 0; i < newMessages.length; i ++){
							newMessages[i].html = common.textToHtml(newMessages[i].message_content, 
								newMessages[i].character_id == 0 ? 'right' : 'left', true);
						}
						this.history_list = this.history_list.concat(newMessages);
						this.break_point += newMessages.length;
					} else {
						uni.showToast({
							title: '没有更多历史消息了',
							icon: 'none'
						});
					}
				});
			},
			replaceParam(){
				// console.log(this.chatCss);
				this.entity_css = this.chatCss.replace(new RegExp('{{bg-color1}}', 'g'), this.bubbleColor[0])
					.replace(new RegExp('{{bg-color2}}', 'g'), this.bubbleColor[1])
					.replace(new RegExp('{{color1}}', 'g'), this.fontColor[0])
					.replace(new RegExp('{{color2}}', 'g'), this.fontColor[1])
					.replace(new RegExp('{{bubbleOpacity}}', 'g'), this.bubbleOpacity);
				// console.log(this.entity_css);
				this.$forceUpdate();
			},
			handleSearchConfirm(keyword){
				this.break_point = 0;
				this.keyword = keyword;
				this.init();
			}
		},
		onLoad() {
			this.init();
		},
		onReachBottom() {
			this.loadMore();
		},
		onPageScroll(e) {
			// 根据滚动距离计算透明度，从 0 到 1
			this.bg_opacity = Math.min(e.scrollTop / 300, 1);
		},
	}
</script>

<style lang="scss">
	.chat-body{
		margin: $page-header-height auto $page-bottom-height;
		width: calc(100vw - 2 * $uni-spacing-base);
	}
	.watermark{
		position: fixed;
		top: 0;
		left: -5vw;
		z-index: 2;
		pointer-events: none;
	}
	.chat-line{
		padding: $uni-spacing-lg $uni-width-none;
		flex-direction: row;
	}
</style>