<template>
	<view class="display-flex display-line sp-around input-container">
		<input class="chat-input" v-model="chat_input" @input="autoSaveContent" />
		<view class="iconfont icon-fasong" @tap="sendMessage"></view>
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
			}
		},
		computed: {
			...mapState('setting', ['editContent', 'entityId', 'replyMode']),
			...mapState('dialogue', ['messageTime', 'optionFirst', 'prevMessageTime']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			init(){
				this.chat_input = this.editContent[this.entityId];
			},
			async sendMessage(){
				//敏感词审核
				this.setDiaData({
					'optionFirst': this.chat_input.trim()
				});
				this.setDiaData({
					'crtCharacterId': 0,
					'prevMessageTime': this.messageTime,
					'messageTime': common.getCurrentTimeStampStr(),
					'optionFlag': true,
					'options': []
				});
				await messageFun.saveMessage(0, this.optionFirst, this.messageTime + ':option.writing');
				if(this.replyMode == 'auto') {
					this.$emit('autoSpeak');
				}
				this.chat_input = '';
			},
			autoSaveContent(e){
				//console.log(e);
				this.editContent[this.entityId] = e.value;
				this.setSettingData({
					'editContent': this.editContent,
				});
			},
		}
	}
</script>

<style>
	.input-container{
		width: 88vw;
	}
</style>