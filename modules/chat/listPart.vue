<template>
	<view>
		<scroll-view class="scroll-view" scroll-y="true" scroll-with-animation :scroll-top="new_scroll"
			@scroll="scrolling">
			<view class="hint loading-view text-center" v-show="showing" @tap="moreMessage">{{loading_text}}</view>
			<view :class="'message' + item.message_id" v-for="(item, index) in history_list" :key="index" 
					v-show="index < history_list.length - 1">
				<view :id="item.message_id" @tap="hideMenu" @longpress="handleLongPress">
					<view v-if="entityMode == 'novel'" class="novel-line" 
						:class="{ 'novel-subject': !item.character_id, 'deep-cell': index % 2 }" 
						:style="dynamicNovelStyle(item.character_id)">
						<view class="novel-box">
							<view v-html="item.html" :style="dynamicFont(item.character_id ? 'left' : 'right')" :showline="false"></view>
						</view>
					</view>
					<view class="display-flex chat-line" :class="{'right' : !item.character_id, 'left': item.character_id}">
						<view class="chat-img-box" :style="dynamicImgStyle">
							<image v-if="item.character_id > 0" 
								:src="dynamicsImg('list-left:', item.character_id)" 
								:style="dynamicImgStyle" @tap="gotoDetail(item.character_id)"></image>
							<image v-if="item.character_id == 0"
								:src="dynamicsImg('list-right:', item.character_id)" 
								:style="dynamicImgStyle"></image>
						</view>
						<view class="chat-box" :style="dynamicChatBox">
							<view class="chat-item">
								<view v-html="item.html" :style="dynamicFont(item.character_id ? 'left' : 'right')" :showline="false"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="btm" v-if="history_list.length > 0">
				<view id="0" @longpress="handleLongPress">
					<view v-if="entityMode == 'novel'" class="novel-line" 
						:class="{ 'deep-cell': (history_list.length - 1) % 2 }" 
						:style="dynamicNovelStyle(cDisplayId)">
						<view class="novel-box">
							<view v-html="option_first_html" :style="dynamicFont(cDisplayId ? 'left' : 'right')" :showline="false"></view>
						</view>
					</view>
					<view v-else class="display-flex chat-line" :class="{'right' : !cDisplayId, 'left': cDisplayId}">
						<view class="chat-img-box" :style="dynamicImgStyle">
							<image v-if="cDisplayId > 0" 
								:src="dynamicsImg('crt-left:', cDisplayId)" 
								:style="dynamicImgStyle" @tap="gotoDetail(cDisplayId)"></image>
							<image v-if="cDisplayId == 0"
								:src="dynamicsImg('crt_right:', cDisplayId)" 
								:style="dynamicImgStyle"></image>
						</view>
						<view class="chat-box" :style="dynamicChatBox">
							<view v-if="!edit_mode" class="chat-item">
								<view v-html="option_first_html" :showline="false" 
								:style="dynamicFont(cDisplayId ? 'left' : 'right')"></view>
							</view>
							<editPart ref="chatEditPart" :edit="edit_mode" :side="cDisplayId ? 'left' : 'right'"
								:style="dynamicChatBox" @editChange="editChange"
								@swiperChange="swiperChange"></editPart>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<view :style="dynamicsHeight" v-html="entity_css"></view>
		
		<listMenu ref="customMenu" @menu-click="handleMenuClick"></listMenu>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import baseQuery from '@/func/dbManager/baseQuery';
	import common from '@/func/common/common';
	import entityBaseInfo from '@/func/entity/entityBaseInfo';
	import listMenu from '@/modules/chat/listMenu';
	import editPart from '@/modules/chat/editPart';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: 'listPart',
		props: {
			lockMode: {//是否响应菜单
				type: Boolean,
				default: false
			},
			scroll: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				option_first_html: '',
				option_first_text: '',
				history_list: [],
				default_img: configData.defaultImg,
				
				menu_x: 0,//菜单x坐标
				entity_css: '',
				old_scroll: 0,
				new_scroll: 0,
				
				lock_mode: false,
				hiding: false,
				showing: false,
				loading_text: '点击加载更多数据',
				edit_mode: false,
			}
		},
		components:{
			listMenu,
			editPart
		},
		watch: {
			refreshList(newOption){
				if(newOption){
					this.init();
				} 
			},
			lockMode(newValue){
				this.lock_mode = newValue;
				if(newValue){
					this.$nextTick(() => {
						this.hideMenu();
					})
				}
			},
			openEdit(newValue){
				if(newValue == true){
					this.$emit('afterUpdate');
				}
			},
			bubbleOpacity(newValue){
				this.entity_css = this.chatCss.replace(new RegExp('{{bg-color1}}', 'g'), this.bubbleColor[0])
					.replace(new RegExp('{{bg-color2}}', 'g'), this.bubbleColor[1])
					.replace(new RegExp('{{color1}}', 'g'), this.fontColor[0])
					.replace(new RegExp('{{color2}}', 'g'), this.fontColor[1])
					.replace(new RegExp('{{bubbleOpacity}}', 'g'), newValue);
			},
			scroll(newValue){
				console.log(newValue);
				this.new_scroll = 0;
				let _self = this;
				this.$nextTick(() => {
					_self.new_scroll = newValue;
				})
			}
		},
		computed: {
			...mapState('user', ['darkMode']),
			...mapState('dialogue', ['cDisplayId', 'characterlist', 'crtCharacterId', 
				'entityMode', 'historylist', 
				'openEdit', 'optionFirst', 'options', 'refreshList']),
			...mapState('setting', ['bubbleAlign', 'bubbleColor', 'bubbleOpacity', 
				'chatCss', 'chatPattern', 'editContent', 'entityId', 
				'fontColor', 'fontSize', 'imgWidth', 'imgRadius',]),
			dynamicNovelStyle() {
				return function(character_id) {
					//console.log(this.characterlist, character_id);
					let arr = Object.keys(this.characterlist);
					let character_img = '';
					if(arr.length == 0 || this.characterlist[character_id].character_img == this.default_img
					 || this.characterlist[0].character_img == this.default_img){//空obj
						return '';
					} else if(character_id){
						character_img = this.characterlist[character_id].character_img;
					} else {
						character_img = this.characterlist[0].character_img;
					}
					
					let bgcolor = this.bubbleColor[0];
					if(this.darkMode == 'light'){
						bgcolor = '255, 255, 255';
					}else{
						bgcolor = '31, 31, 31';
					}
					
					return `background-image: linear-gradient(to bottom, rgba(${bgcolor}, 0.3), rgba(${bgcolor}, 0.8) 58%, rgba(${bgcolor}, 1) 70%, rgba(${bgcolor}, 1)), url('${character_img}');`;
				}
			},
			dynamicsImg(){
				return function(tip, character_id){
					//console.log(tip, character_id);
					let arr = Object.keys(this.characterlist);
					if(character_id == undefined || arr.length == 0 || !this.characterlist){ 
						return this.default_img;
					}else{ 
						return this.characterlist[character_id].character_img;
					}
				}
			},
			dynamicsHeight(){
				return (this.openEdit ? `height: 500rpx;` : `height: 70rpx;`);
			},
			dynamicFont() {
				return function(side) {
					if(side == 'left'){
						return `font-size: ${this.fontSize}px; color: ${this.fontColor[0]}`;
					}
					return `font-size: ${this.fontSize}px; color: ${this.fontColor[1]}`;
				}
			},
			dynamicImgStyle(){
				return `width: ${this.imgWidth}px; height: ${this.imgWidth}px; border-radius: ${this.imgRadius}px;`;
			},
			dynamicChatBox(){
				return this.bubbleAlign == true ? `width: calc(100vw - 40rpx - 10px - ${this.imgWidth}px);` 
					: `width: calc(100vw - 40rpx - 20px - ${this.imgWidth * 2}px);`;//true为平铺
			},
		},
		methods: {
			...mapMutations('user', ['getUserData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			async init(){
				this.getDiaData();
				this.getUserData();
				this.option_first_text = this.optionFirst;
				this.option_first_html = common.textToHtml(this.optionFirst, this.cDisplayId ? 'left' : 'right', true);
				this.history_list = this.historylist;
				//console.log('option_first_text:' + JSON.stringify(this.option_first_text));
				if(!this.lock_mode) this.$emit('afterUpdate');
				//console.log(this.chatPattern);
				let pattern_data = await baseQuery.getDataByKey('cybercafe_bubble_pattern', {pattern_id: this.chatPattern});
				this.setDiaData({
					'refreshList': false,
					'chatCss': pattern_data[0].pattern_css,
				}); 
				//let poptions = JSON.parse(pattern_data[0].pattern_options);
				this.entity_css = this.chatCss.replace(new RegExp('{{bg-color1}}', 'g'), this.bubbleColor[0])
					.replace(new RegExp('{{bg-color2}}', 'g'), this.bubbleColor[1])
					.replace(new RegExp('{{color1}}', 'g'), this.fontColor[0])
					.replace(new RegExp('{{color2}}', 'g'), this.fontColor[1])
					.replace(new RegExp('{{bubbleOpacity}}', 'g'), this.bubbleOpacity);
				//console.log(this.entity_css);
				uni.hideLoading();
				if(this.history_list.length) {
					setTimeout(() => {
						this.showing = true;
					}, 2000);
				}
				
				this.$refs.chatEditPart.init();
			},
			async handleLongPress(event) {
				//console.log(event.currentTarget);
				//console.log(this.lockMode);
				//this.handleContextMenu(event);
				//this.reset(); // 重置状态
				if(!this.lockMode && !this.openEdit && event.currentTarget.id){
					//console.log('menu');
					const { pageX, pageY } = event.touches[0];
					let menu_items = [
						/* { label: '帮写', value: 'ai', icon: 'dengpao' }, */
						{ label: '气泡', value: 'bubble', icon: 'ziyuan' },
						{ label: '复制', value: 'copy', icon: 'fuzhi' },
						{ label: '删除', value: 'delete', icon: 'shanchu' }
					];
					if(event.currentTarget.id != 0){//开场白不可删
						let message_data = await baseQuery.getDataByKey('cybercafe_message', {'message_id': event.currentTarget.id});
						if(message_data && message_data[0].prev_message_time == 0){
							menu_items = [
								{ label: '气泡', value: 'bubble', icon: 'ziyuan' },
								{ label: '复制', value: 'copy' },
							];
						}
					}
					
					this.$refs.customMenu.showMenu(this.menu_x * 0.32, pageY - 120, menu_items, event.currentTarget.id, this.option_first_text);
				}
			},
			handleMenuClick(item, id) {
				//console.log('选择了菜单项:', item.value, id);
				if(item.value == 'delete'){
					this.$emit('afterDel');
				}
			},
			hideMenu(){
				this.$nextTick(() => {
					this.$refs.customMenu.hideMenu();
				});				
			},
			toBtm(){
				let _self = this;
				this.new_scroll = 0;
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(_self);
					query.select('.btm').boundingClientRect(rect => {}).exec((s) => {
						if(s[0]){
							_self.old_scroll = Math.max(s[0].bottom, _self.old_scroll);
							_self.$nextTick(function() {
								_self.new_scroll = _self.old_scroll;
							});
						}
					})
				});
			},
			scrolling(e){
				this.hideMenu();
				uni.$emit('refreshScroll', e.detail.scrollTop, this.lock_mode);
			},
			async moreMessage(){
				if(this.loading_text != '点击加载更多数据')return;
				let old_top_id = this.history_list[0].message_id;
				let old_length = this.historylist.length;
				this.lock_mode = true;
				//this.showing = true;
				//this.hiding = false;
				this.loading_text = '数据加载中...';
				this.hideMenu();
				await entityBaseInfo.getMessage();
				if(this.historylist.length - old_length < 50){
					this.loading_text = '无更多数据';
					return;
				} 
				let _self = this;
				this.new_scroll = 0;
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(_self);
					query.select('.message' + old_top_id).boundingClientRect(rect => {}).exec((s) => {
						if(s[0]){
							_self.old_scroll += s[0].top;
							_self.$nextTick(function() {
								_self.new_scroll = s[0].top - 100;
							});
						}
					})
				});
				setTimeout(() => {
					//this.hiding = true;
					//this.showing = false;
					this.lock_mode = false;
					this.loading_text = '点击加载更多数据';
				}, 2000);
			},
			gotoDetail(character_id){
				uni.navigateTo({
					url: '/pages/chat/character?id=' + character_id
				})
			},
			swiperChange(crt_index){
				this.option_first_html = common.textToHtml(this.options[crt_index].text, this.cDisplayId ? 'left' : 'right', true);
			},
			editChange(param){
				this.hideMenu();
				this.edit_mode = param;
			}
		},
		mounted(){
			// 获取系统信息
			const systemInfo = uni.getSystemInfoSync();
			
			// 屏幕宽度
			this.menu_x = systemInfo.windowWidth;
			//console.log('屏幕宽度:', this.menu_x);
		}
	}
</script>

<style lang="scss">
	.loading-view{
		height: 3vh;
		color: $uni-color-main;
	}
	.scroll-view{
		height: calc(90vh - 2 * $uni-font-size-lg);
	}
	.novel-line, .chat-line .chat-box{
		font-size: 28rpx;
		font-weight: 500;
		line-height: 46rpx;
	}
	.novel-line{
		padding: 16rpx 20rpx;
		border-bottom: 1px #EBEEF5 solid;
		background-repeat: no-repeat;
		background-size: auto 100%;/* 宽高 */
		background-origin: border-box;
		background-position: top left;
	}
	.novel-subject{
		background-position: top right;
	}
	.deep-cell{
		background-color: rgba(204,204,204,0.7);
	}
	.chat-line{
		padding: 10rpx 0;
		flex-direction: row;
	}
	.chat-line.right{
		flex-direction: row-reverse;
	}
	.chat-line.left .chat-img-box{
		margin-right: 10px;
	}
	.chat-line.right .chat-img-box{
		margin-left: 10px;
	}
	.ani-show{
		animation: showView 0.5s forwards;
	}
	.ani-hide{
		animation: hideView 0.5s forwards;
	}
	@media (prefers-color-scheme: dark) {
		.loading-view{
			color: $uni-color-dark-main;
		}
		.novel-line{
			color: #999;
			border-bottom: 1px #333 solid;
		}
		.deep-cell{
			background-color: rgba(51,51,51,0.7);
		}
	}
	@keyframes showView {
		from { height: 0; }
		to { height: 5vh; }
	}
	@keyframes hideView {
		from { height: 5vh; }
		to { height: 0; }
	}
</style>