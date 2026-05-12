<template>
    <view class="chat-main">
        <chatBg></chatBg>
		<water-mark v-if="userKey" class="watermark" :text1="userKey" 
			:text2="userName" :darkMode="dark_mode"></water-mark>
		<historyHeader ref="hHeader" :bgOpacity="bg_opacity" :networkType="network_type" :len="break_point"
			@searchConfirm="handleSearchConfirm" @sendHistory="sendFun"></historyHeader>
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
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
    </view>
</template>

<script>
    import dialogueQuery from '@/func/dbManager/dialogueQuery';
    import historyHeader from '@/modules/entity/historyHeader';
	import chatBg from '@/modules/chat/chatBg';
	import common from '@/func/common/common';
	import request from '@/func/common/request';
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
				keyword: '',
				network_type: 'none'
			}
		},
        components:{
            historyHeader,
            chatBg
        },
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'entityHistory'){
				    	this.$nextTick(() => {
				    		if(this.$refs.cModal){ this.$refs.cModal.show(this.modalData); }
						});
				    	this.setUserData({
				    		'modalShow': false,
				    		'modalPageId': ''
				    	})
				    }
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		computed: {
			...mapState('dialogue', ['title']),
			...mapState('user', ['modalData', 'modalPageId', 'modalShow', 
				'userEmail', 'userKey', 'userName']),
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
			...mapMutations('dialogue', ['getDiaData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			async init(){
				if(this.network_type == 'offline'){
					uni.showToast({
						title: '当前处于离线状态，无法加载历史消息',
						icon: 'none'
					});
				}else if(this.network_type == 'none'){
					this.network_type = await request.checkNetwork('index');
				}

				this.$nextTick(() => {
					this.$refs.hHeader.init();
				});	
				
				uni.showLoading({
					title: '加载中...'
				})
				this.dark_mode = this.darkMode;
				//console.log(this.title);
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
			},
			sendFun(){
				uni.showLoading({
					title: '发送中...'
				});
				let _self = this;
				// 处理发送历史消息的逻辑
				dialogueQuery.getMessageHistoryByEntityId().then(newMessages => {
					console.log(newMessages.length);
					if (newMessages.length > 0) {
						let content = '';
						for(let i = 0; i < newMessages.length; i ++){
							content += newMessages[i].message_content + '\n';
						}
						console.log(content.length);
						request.post('entityController/sendEntityHistory', 'entityHistory', {
							'email': this.userEmail,
							'entity_name': this.title,
							'history': content
						}).then(res => {
							console.log(res);
							uni.hideLoading();
							if(res.code == 200){
								_self.setUserData({
									'modalData':{
										title: '邮件发送成功',
										content: '历史消息已发送至您的邮箱，请注意查收',
										confirmText: '',
										cancelText: "OK",
										success: (res) => {},
									},
									'modalShow': true, 
									'modalPageId': 'entityHistory'});
							}else{
								_self.setUserData({
									'modalData':{
										title: '邮件发送失败',
										content: '发送失败，请稍后再试',
										confirmText: '',
										cancelText: "OK",
										success: (res) => {},
									},
									'modalShow': true, 
									'modalPageId': 'entityHistory'});
							}
						}).catch(err => {
							console.log(err.msg);
							uni.hideLoading();
							let msg = '发送失败，请截图反馈给系统管理员：' + err.msg;
							_self.setUserData({
									'modalData':{
										title: '邮件发送失败',
										content: msg,
										confirmText: '',
										cancelText: "OK",
										success: (res) => {},
									},
									'modalShow': true, 
									'modalPageId': 'entityHistory'});
						});
					}
				});
			}
		},
		onLoad(option) {
			if(option && option.from == 'offline'){
				this.network_type = 'offline';
			}
			console.log('network type:', this.network_type);
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
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
</style>