<template>
	<view>
		<view v-if="edit">
			<textarea adjust-position autoHeight :cursor-spacing="150"
				v-model="edit_text" class="edit-box" :styles="dynamicStyle"
				trim="both" @input="autoSaveContent" @confirm="confirmFun"></textarea>
			<view class="display-flex display-line sp-between icon-part">
				<cybercafe-button btnClass="btn-default"
					btnName="" class="iconfont icon-guanbi" @tapBtn="cancelFun"/>
				<cybercafe-button btnClass="btn-default"
					btnName="" class="iconfont icon-dagouwuquan" @tapBtn="confirmFun"/>
			</view>
		</view>
		<view v-else class="display-flex display-line sp-between">
			<view>
				<cybercafe-swiper-dot ref="epSwiperDot" v-if="option_list.length > 1" :list="option_list"
					@tapDot="clickItem" :swiperCurrent="swiper_current"></cybercafe-swiper-dot>
			</view>
			<view class="display-flex display-line icon-part">
				<cybercafe-button v-if="!refresh_disabled" btnClass="btn-default" 
					btnName="" class="iconfont icon-shuaxin" @tapBtn="respeakFun"/>
				<cybercafe-button btnClass="btn-default" btnName="" class="iconfont icon-dianping" 
					@tapBtn="changeToEdit" />
			</view>
		</view>
	</view>
</template>

<script>
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	import promptFun from '@/func/entity/promptFun';
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
				refresh_disabled: false,//没有chatlist或Options时不可用true
				edit_text: '',//等价于editContent[this.entity_id]
				option_list: [],
			}
		},
		props: {
			edit: {
				type: Boolean,
				default: false
			},
			crtIndex: {
				type: Number | String,
				default: 0
			}
		},
		watch: {
			refreshList: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue){
				    	this.init();
				    }
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		computed: {
			...mapState('user', ['darkMode', 'modalData', 'modalPageId', 'modalShow']),
			...mapState('dialogue', ['cDisplayId', 'optionFirst', 'options', 'refreshList']),
			...mapState('setting', ['editContent', 'entityId', 'fontColor', 'fontSize',
				'promptLength', 'tokenSetting']),
			dynamicStyle: function(){
				return `font-size: ${this.fontSize}px;color: ${this.fontColor[0]};`;
			},
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			init(){
				//console.log(this.crtIndex);
				this.option_list = this.options;
				//console.log(this.option_list.length);
				this.swiper_current = this.crtIndex;
				//if(this.option_list.length == 0) this.refresh_disabled = true;
			},
			async respeakFun(e){
				if (this.refresh_disabled == false) {// && content.text === '重说'
					await promptFun.preOperation(false);
					if(this.promptLength > this.tokenSetting){
						this.setUserData({
							'modalData': {
								content: "当前提示词字数已超限，请调整最大token数设置，或删减提示词",
								cancelText: "晓得了"
							},
							'modalShow': true,
							'modalPageId': 'chat'
						});
						return;
					}
					uni.showLoading({
						title: '内容由AI生成，仅供娱乐'
					});
					request.chatRequest();
					this.swiper_current = this.options.length;
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
				this.setDiaData({
					'optionFirst': this.options[this.swiper_current].text
				});
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
		backgroundColor: $uni-text-color-inverse;
	}
	.icon-part{
		color: $uni-color-main;
		margin-top: $uni-spacing-base;
	}
	.icon-shuaxin{
		margin-right: $uni-spacing-base;
	}
	@media (prefers-color-scheme: dark) {
		.icon-part{
			color: $uni-color-dark-main;
		}
		.edit-box{
			backgroundColor: $uni-bg-dark-color-gray;
		}
	}
</style>