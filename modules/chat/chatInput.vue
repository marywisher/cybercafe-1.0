<template>
	<view class="display-flex display-line sp-around input-container" :class="{'max-view': input_mode == 'max'}">
		<view v-show="input_mode == 'min'" class="input-box">
			<input class="chat-input" v-model="chat_input" @input="autoSaveContent"
				placeholder="回复由AI生成，仅供娱乐"/>
			<view class="iconfont icon-quanping" @tap="changeInputMode"></view>
		</view>
		<view v-show="input_mode == 'min'" class="iconfont icon-fasong" @tap="sendMessage"></view>
		
		<view v-show="input_mode == 'max'" ref="popup">
			<view class="textarea-box">
				<textarea v-model="chat_input" :cursor-spacing="150"
				 placeholder="回复由AI生成，仅供娱乐" adjust-position  class="chat-textarea"
				 confirm-type="done" @input="autoSaveContent"></textarea>
			</view>
			<view class="textarea-btn display-flex display-line sp-around">
				<view class="iconfont icon-feiquanping" @tap="changeInputMode"></view>
				<view class="iconfont icon-fasong" @tap="sendMessage"></view>
			</view>
		</view>
	</view>
</template>

<script>
	import promptFun from '@/func/entity/promptFun';
	import messageFun from '@/func/entity/messageFun';
	import common from '@/func/common/common';
	import responseFun from '@/func/entity/responseFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'chatInput',
		data(){
			return {
				chat_input: '',
				input_mode: 'min',//max min
			}
		},
		computed: {
			...mapState('setting', ['editContent', 'entityId', 'replyMode']),
			...mapState('dialogue', ['crtCharacterId', 'messageTime', 'optionFlag', 'optionFirst', 
				'options', 'prevMessageTime']),
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(){
				this.chat_input = this.editContent[this.entityId];
			},
			async sendMessage(){
				this.input_mode = 'min';
				//敏感审核
				let response_feedback = await responseFun.toolRequest('sensitive', this.chat_input.trim(), 'chat');
				if(response_feedback == 200){
					this.setDiaData({
						'optionFirst': this.chat_input.trim(),
						'crtCharacterId': 0,
						'prevMessageTime': this.messageTime,
						'messageTime': common.getCurrentTimeStampStr(true),
						'optionFlag': true,
						'options': []
					});
					await messageFun.saveMessage(0, this.optionFirst, this.messageTime + ':option.writing');
					if(this.replyMode == 'auto') {
						this.$emit('autoSpeak');
					}
					this.chat_input = '';
				}else if(response_feedback == 302){
					this.setUserData({
						'modalData': {
							title: "温馨提示",
							content: "请修改填写内容再试",
							cancelText: "OK",
						},
						'modalShow': true,
						'modalPageId': 'chat'
					})
				}else{
					this.setUserData({
						'modalData': {
							title: "温馨提示",
							content: "请联系管理员修复问题",
							cancelText: "OK",
						},
						'modalShow': true,
						'modalPageId': 'chat'
					})
				}
			},
			autoSaveContent(e){
				//console.log(e);
				this.editContent[this.entityId] = e.value;
				this.setSettingData({
					'editContent': this.editContent,
				});
			},
			changeInputMode(){
				if(this.input_mode == 'min'){
					this.input_mode = 'max';
				}else{
					this.input_mode = 'min';
				}
				this.$emit('inputModeChange', this.input_mode);
			}
		}
	}
</script>

<style lang="scss">
	.input-container{
		width: 88vw;
	}
	.input-container.max-view{
		width: 100vw;
	}
	.input-box{
		position: relative;
	}
	.chat-input{
		width: calc(100vw - 10 * $uni-spacing-lg);
	}
	.icon-fasong{
		color: $uni-color-main;
		font-size: $uni-font-size-lg;
		line-height: calc(2 * $uni-font-size-lg);
	}
	.icon-quanping{
		position: absolute;
		right: $uni-spacing-lg;
		bottom: $uni-spacing-lg;
		color: $uni-color-main;
	}
	.chat-textarea{
		width: 90vw;
		height: calc(30vh - 1.5 * $uni-font-size-lg);
	}
	.textarea-box{
		padding: $uni-spacing-lg;
	}
	.textarea-btn{
		width: 30vw;
		float: right;
	}
	.icon-feiquanping, .textarea-box .icon-fasong{
		color: $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.icon-fasong, .icon-quanping, .icon-feiquanping{
			color: $uni-color-dark-main;
		}
	}
</style>