<template>
	<view>
		<view v-if="edit">
			<textarea adjust-position autoHeight :cursor-spacing="150"
				v-model="edit_text" class="edit-box" :styles="dynamicStyle"
				trim="both" @input="autoSaveContent" @confirm="confirmFun"></textarea>
			<view class="display-flex display-line sp-between icon-part">
				<view class="iconfont icon-guanbi" @tap="cancelFun"></view>
				<view class="iconfont icon-dagouwuquan" @tap="confirmFun"></view>
			</view>
		</view>
		<view v-else class="display-flex display-line sp-between">
			<view>
				<cybercafe-swiper-dot v-if="option_list.length > 1" :list="option_list"
					@tapDot="clickItem" :swiperCurrent="swiper_current"></cybercafe-swiper-dot>
			</view>
			<view class="display-flex display-line icon-part">
				<view v-if="!refresh_disabled" class="iconfont icon-shuaxin" @tap="respeakFun"/>
				<view class="iconfont icon-dianping" @tap="changeToEdit"/>				
			</view>
		</view>
	</view>
</template>

<script>
	import common from '@/func/common/common';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'editPart',
		data(){
			return{
				swiper_current: 0,
				refresh_disabled: true,//没有chatlist或Options时不可用true
				edit_text: '',//等价于editContent[this.entity_id]
				option_list: [],
			}
		},
		props: {
			edit: {
				type: Boolean,
				default: false
			},
			side: {
				type: String,
				default: 'left'
			}
		},
		computed: {
			...mapState('user', ['darkMode']),
			...mapState('dialogue', ['cDisplayId', 'options']),
			...mapState('setting', ['editContent', 'entityId', 'fontColor', 'fontSize']),
			dynamicStyle: function(){
				let style_obj = `font-size: ${this.fontSize}px;`;
				if(this.side == 'left'){
					style_obj += `color: ${this.fontColor[0]};`;
				}else{
					style_obj += `color: ${this.fontColor[1]};`;
				}
				if(this.darkMode == 'light'){
					style_obj += `backgroundColor: #fff;`;
					//style_obj['color'] = '#333';
				}else{
					style_obj += `backgroundColor: #1f1f1f;`;
					//style_obj['color'] = '#999';
				}
				return style_obj;
			},
		},
		methods:{
			...mapMutations('user', ['getUserData']),
			...mapMutations('dialogue', ['getDiaData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			init(){
				this.option_list = this.options;
				if(this.option_list.length == 0) this.refresh_disabled = true;
			},
			respeakFun(e){
				if (this.refresh_disabled == false) {// && content.text === '重说'
					//console.log(this.ai);
					uni.showLoading({
						title: '内容由AI生成，仅供娱乐'
					});
					//console.log(this.option_count);
					let tmpChatData = this.chatlist;
					//request.bothSideRequest(LIVELY, tmpChatData, this.ai, 'options');
				}
			},
			autoSaveContent(e){
				this.editContent[this.entityId] = e;
				this.setSettingData({
					'editContent': this.editContent,
				});
			},
			clickItem(e){
				//console.log(e);
				this.swiper_current = e;
				this.$emit('swiperChange', this.swiper_current);
			},
			changeToEdit(){
				this.edit_text = this.options[this.swiper_current].text;
				this.$emit('editChange', true);
			},
			cancelFun(){
				this.$emit('editChange', false);
			},
			confirmFun(){
				//敏感检测
				/* this.setDiaData({key: 'optionFirst', data: newOptionFirst});
				this.updateMessage(); */
				this.$emit('editChange', false);
			}
		}
	}
</script>

<style lang="scss">
	.edit-box{
		width: 90%;
		line-height: 46rpx;
	}
	.icon-part{
		color: $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.icon-part{
			color: $uni-color-dark-main;
		}
	}
</style>