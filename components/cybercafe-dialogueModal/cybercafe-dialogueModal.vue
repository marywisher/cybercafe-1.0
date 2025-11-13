<template>
	<cybercafe-view ref="dialogueView" isAbsolute closeAble :viewTitle="title">
		<view class="display-flex pop-content">
			<input v-model="value_str" :maxlength="-1" @input="check"/>
			<view>
				<cybercafe-button btnClass="btn-primary" :btnDisable="unsavable"
					@tapBtn="confirmFun" btnName="修改"
					btnStyle="height: 60rpx; border-radius: 0 12rpx 12rpx 0; font-size: 32rpx; line-height: 60rpx;"></cybercafe-button>
			</view>
		</view>
	</cybercafe-view>
</template>

<script>
	export default{
		name: 'cybercafe-dialogueModal',
		props:{
			title: {
				type: String,
				default: ''
			},
			content: {
				type: String,
				default: ''
			}
		},
		data(){
			return{
				value_str: '',
				unsavable: true
			}
		},
		methods: {
			openView(){
				this.value_str = this.content;
				if(this.value_str.trim().length) this.unsavable = false;
				this.$refs.dialogueView.openView();
			},
			closeView(){
				this.$refs.dialogueView.closeView();
			},
			check(e){
				if(e.target.value.trim().length == 0) this.unsavable = true;
				else this.unsavable = false;
			},
			confirmFun(){
				this.$emit('confirm', this.value_str.trim());
				this.closeView();
			}
		}
	}
</script>

<style lang="scss">
	.pop-content{
		margin-top: $uni-spacing-lg;
		justify-content: center;
	}
	input{
		width: 50vw;
		border-radius: $uni-border-radius-lg $uni-width-none $uni-width-none $uni-border-radius-lg;
	}
	.pop-view{
		position: fixed;
		z-index: 2;
	}
	
</style>