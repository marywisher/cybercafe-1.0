<template>
	<view class="character-container">
		<image mode="aspectFill" class="item-character" :src="characterImg" @tap="gotoCharacter"></image>
		<view v-if="characterType != 'default'" class="iconfont red-point" @tap="operation" 
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
				default: 'in' //in 待上场   out 待离场	default 最后一个，无符号
			}
		},
		computed:{
			...mapState('setting', ['entityId']),
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			operation(){
				if(this.entityId == 0 || this.characterId == 0 || this.characterType == 'default') return;
				let status = 0;
				let hint_str = '离场';
				if(this.characterType == 'in'){
					status = 1;
					hint_str = '登场';
				}
				entityFun.updateEntityDetail(this.entityId, this.characterId, status);
				uni.showToast({
					title: '角色已' + hint_str,
					icon: 'none'
				})
				this.$emit('afterTap', this.characterId);
			},
			gotoCharacter(){
				console.log(this.characterId);
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "温馨提醒",
						content: "即将跳转到角色切片页？",
						confirmText: '前往角色切片页',
						cancelText: '手滑了',
						success: (res) => {
							if(res.confirm == true){
								uni.navigateTo({
									url: '/pages/character/index?id=' + _self.characterId
								})
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'entity'
				})
			}
		}
	}
</script>

<style lang="scss">
	.character-container{
		position: relative;
		width: calc(2 * $uni-font-size-huge);
		height: calc(2 * $uni-font-size-huge);
		margin: $uni-spacing-base $uni-spacing-base $uni-spacing-base $uni-width-none;;
	}
	.item-character{
		width: calc(2 * $uni-font-size-huge);
		height: calc(2 * $uni-font-size-huge);
		border-radius: $uni-border-radius-circle;
	}
	.red-point{
		font-size: $uni-font-size-mini;
		background-color: $uni-color-main;
		color: $uni-color-secondary;
		width: calc(4 * $uni-spacing-sm);
		height: calc(4 * $uni-spacing-sm);
		border-radius: $uni-border-radius-circle;
		position: absolute;
		top: 0;
		right: 0;
		text-align: center;
		line-height: calc(4 * $uni-spacing-sm);
	}
	@media (prefers-color-scheme: dark) {
		.red-point{
			background-color: $uni-color-dark-main;
			color: $uni-text-color-grey;
		}
	}
</style>