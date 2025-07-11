<template>
	<cybercafe-view class="modal-container" :viewTitle="title" isAbsolute closeAble ref="modal">
		<view class="content-line text-center">{{content}}</view>
		<view class="display-flex btn-line sp-between">
			<cybercafe-button class="cancel-btn" btnClass="btn-default" v-if="cancelText"
				@btnClick="cancelFun" :btnName="cancelText"></cybercafe-button>
			<cybercafe-button class="confirm-btn" btnClass="btn-primary" v-if="confirmText"
				@btnClick="confirmFun" :btnName="confirmText"></cybercafe-button>
		</view>	
	</cybercafe-view>
</template>

<script>
	export default{
		name: 'cybercafe-modal',
		data() {
			return {
				title: '温馨提醒',
				content: '',
				confirmText: '',
				cancelText: 'OK',
				success: null
			}
		},
		methods: {
			show(options){
				Object.assign(this, options);
				this.$refs.modal.openView();
			},
			hide(){
				this.$refs.modal.closeView();
			},
			confirmFun(){
				this.success?.({ confirm: true })
				this.hide();
			},
			cancelFun(){
				this.success?.({ cancel: true })
				this.hide();
			}
		},
	}
</script>

<style lang="scss">
	.content-line{
		padding: calc(2 * $uni-spacing-lg) $uni-spacing-lg;
	}
	.btn-line{
		flex-direction: row-reverse;
	}
</style>