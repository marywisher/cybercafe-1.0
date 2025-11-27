<template>
	<view class="card-container" :class="cardType" @tap="clickCard">
		<view v-if="cardType == 'past' || cardType == 'done'" class="text-center iconfont icon-dagouwuquan"></view>
		<view v-else class="text-center">{{cardTitle}}</view>
		<view v-if="btnTitle.length > 0" class="card-btn text-center">{{btnTitle}}</view>
	</view>
</template>

<script>
	export default{
		name: 'cyberdafe-card2',
		data(){
			return{
				btn_enable: true, 
			}
		},
		props: {
			cardType: {
				type: String,
				default: 'past' //past过期 wait待操作 done完成 future将来
			},
			cardTitle: {
				type: String,
				default: ''
			},
			btnTitle: {
				type: String,
				default: ''
			}
		},
		methods:{
			clickCard(e){
				if(this.cardType == 'wait' && this.btn_enable){
					this.btn_enable = false;
					this.$emit('clickBtn', e);
				}
			}
		}
	}
</script>

<style lang="scss">
	.card-container{
		border-radius: $uni-border-radius-base;
		border-width: $uni-border-base;
		border-style: solid;
		margin: $uni-spacing-mini;
		width: 100%;
		font-size: $uni-font-size-sm;
	}
	.card-btn {
		padding: $uni-spacing-base $uni-width-none;
	}
	.future{
		border-color: $uni-text-color-placeholder;
		color: $uni-bg-color-grey;
		background-color: $uni-text-color-placeholder;
	}
	.future .card-btn{
		background-color: $uni-color-dark-main;
		color: $uni-text-color;
	}
	.done{
		border-color: $uni-color-main;
		color: $uni-color-main;
	}
	.done .card-btn{
		background-color: $uni-color-main;
		color: $uni-bg-color-hover;
	}
	.wait{
		border-color: $uni-color-main;
		color: $uni-bg-color-grey;
		background-color: $uni-color-main;
	}
	.wait .card-btn{
		background-color: $uni-color-secondary;
		color: $uni-text-color-grey;
	}
	.past{
		border-color: $uni-text-color-grey;
		color: $uni-text-color-grey;
	}
	.past .card-btn{
		background-color: $uni-text-color-grey;
		color: $uni-text-color-grey;
	}
	@media (prefers-color-scheme: dark) {
		.future{
			border-color: $uni-text-color;
			color: $uni-text-color-placeholder;
			background-color: $uni-text-color;
		}
		.future .card-btn{
			background-color: $uni-color-dark-main;
			color: $uni-text-color;
		}
		.done{
			border-color: $uni-color-dark-main;
			color: $uni-color-dark-main;
		}
		.done .card-btn{
			background-color: $uni-color-dark-main;
			color: $uni-text-color;
		}
		.wait{
			border-color: $uni-color-dark-main;
			color: $uni-text-color;
			background-color: $uni-color-dark-main;
		}
		.wait .card-btn{
			background-color: $uni-color-dark-main;
			color: $uni-text-color;
		}
		.past{
			border-color: $uni-text-color-placeholder;
			color: $uni-text-color-placeholder;
		}
		.past .card-btn{
			background-color: $uni-text-color-placeholder;
			color: $uni-text-color;
		}
	}
</style>