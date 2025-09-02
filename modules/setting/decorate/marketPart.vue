<template>
	<view class="display-flex sp-between display-line">
		<view>当前气泡样式：</view>
		<view class="pattern-select" @tap="patternChange">{{patternName}}</view>
		<view>
			<cybercafe-button btnClass="btn-primary"
				 btnName="气泡市场" @btnClick="morePattern"></cybercafe-button>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "marketPart",
		computed: {
			...mapState('bubble', ['patternName']),
		},
		methods: {
			...mapMutations('bubble', ['getBubbleData']),
			init(){
				this.getBubbleData();
			},
			patternChange(){//更多pattern
				this.$emit('patternChange');
			},
			morePattern(){//气泡市场
				uni.navigateTo({
					url: '/pages/setting/bubbleMarket'
				})
			},
		},
	}
</script>

<style lang="scss">
	.pattern-select {
		border-bottom: $uni-border-base solid $uni-color-main;
		color: $uni-color-main;
		padding: $uni-width-none $uni-spacing-lg;
		font-size: $uni-font-size-base;
		height: calc(8 * $uni-spacing-sm);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	@media (prefers-color-scheme: dark) {
		.pattern-select {
			border-bottom-color: $uni-color-dark-main;
			color: $uni-color-dark-main;
		}
	}
</style>