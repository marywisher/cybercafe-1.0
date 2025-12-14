<template>
	<view :class="{'btn-default': btnClass == 'btn-default', 
		'btn-primary': btnClass == 'btn-primary', 
		'btn-warn': btnClass == 'btn-warn',
		'disabled': btnDisable}" 
		@tap="btnFun" :style="btnStyle">{{btnName}}</view>
</template>

<script>
	export default{
		name: 'cybercafe-button',
		props:{
			btnClass: {
				type: String,
				default: 'btn-default'
			},
			btnName: {
				type: String,
				default: '点我'
			},
			btnDisable: {
				type: Boolean,
				default: false
			},
			btnStyle: {
				type: String,
				default: ''
			}
		},
		methods:{
			btnFun(param){
				//console.log(this.btnDisable);
				if(this.btnDisable) return;
				this.$emit('tapBtn', param);
			}
		}
	}
</script>

<style lang="scss">
	.btn-default, .btn-primary, .btn-warn{
		border-radius: $uni-border-radius-lg;
		font-size: $uni-font-size-sm;
		text-align: center;
		padding: $uni-spacing-sm $uni-spacing-lg;
		line-height: calc(8 * $uni-spacing-sm);
	}
	.btn-default{
		background-color: $uni-bg-color-grey;
		color: $uni-color-main;
		border: $uni-border-base solid $uni-color-main;
	}
	.btn-default.disabled, .btn-warn.disabled, .btn-primary.disabled{
		color: $uni-text-color-disable;
		border: $uni-border-base solid $uni-text-color-disable;
	}
	.btn-primary{
		background-color: $uni-color-main;
		border: $uni-border-base solid $uni-color-main;
		color: $uni-bg-color-grey;
	}
	.btn-primary.disabled{
		background-color: $uni-text-color-disable;
	}
	.btn-warn{
		background-color: $uni-color-secondary;
		color: $uni-color-main;
		line-height: calc(8 * $uni-spacing-sm);
	}
	@media (prefers-color-scheme: dark) {
		.btn-default{
			color: $uni-color-dark-main;
			border: $uni-border-base solid $uni-color-dark-main;
			background-color: $uni-bg-dark-color-gray;
		}
		.btn-default.disabled, .btn-warn.disabled, .btn-primary.disabled{
			color: $uni-text-color-placeholder;
			border: $uni-border-base solid $uni-text-color-placeholder;
		}
		.btn-primary{
			background-color: $uni-color-dark-main;
			border: $uni-border-base solid $uni-color-dark-main;
			color: $uni-bg-dark-color-gray;
		}
	}
</style>