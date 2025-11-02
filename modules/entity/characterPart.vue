<template>
	<view class="character-container">
		<image mode="aspectFill" class="item-character" :src="characterImg"></image>
		<view class="iconfont red-point" @tap="operation" 
			:class="{'icon-jiahao': characterType == 'in', 'icon-jianhao': characterType == 'out'}"></view>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import entityFun from '@/func/entity/entityFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'characterPart',
		props: {
			characterId: {
				type: Number,
				default: 0
			},
			characterImg: {
				type: String,
				default: configData.defaultImg
			},
			characterType: {
				type: String,
				default: 'in' //in 待上场   out 待离场
			}
		},
		computed:{
			...mapState('setting', ['entityId']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData']),
			operation(){
				if(this.entityId == 0 || this.characterId == 0) return;
				let status = 0;
				if(this.characterType == 'in'){
					status = 1;
				}
				entityFun.updateEntityDetail(this.entityId, this.characterId, status);
				this.$emit('afterTap', this.characterId);
			}
		}
	}
</script>

<style lang="scss">
	.character-container{
		position: relative;
	}
	.item-character{
		width: calc(2 * $uni-font-size-huge);
		height: calc(2 * $uni-font-size-huge);
		border-radius: $uni-border-radius-circle;
	}
	.red-point{
		font-size: $uni-font-size-mini;
		background-color: $uni-color-main;
		color: $uni-text-color-disable;
		width: calc(2 * $uni-spacing-sm);
		height: calc(2 * $uni-spacing-sm);
		border-radius: $uni-border-radius-circle;
		position: absolute;
		top: 0;
		right: 0;
	}
	@media (prefers-color-scheme: dark) {
		.red-point{
			background-color: $uni-color-dark-main;
			color: $uni-text-color-grey;
		}
	}
</style>