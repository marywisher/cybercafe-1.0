<template>
	<view class="progress-full">
		<view class="progress-front" :style="dynamicFront"></view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'cybercafe-progress-bar',
		props: {
			percent: {
				require: true,
				type: Number | String,
				default: 0
			}
		},
		computed:{
			...mapState('setting', ['darkMode']),
			dynamicFront(){
				return 'width:' + this.percent;
			}
		},
		methods:{
			...mapMutations('setting', ['getSettingData']),
		}
	}
</script>

<style lang="scss">
	.progress-full, .progress-front{
		border-radius: calc($uni-spacing-lg / 2);
	}
	.progress-full {
		width: 100%;
		height: $uni-spacing-lg;
		border: 1px solid $uni-color-main;
	}
	.progress-front{
		height: 100%;
		background-color: $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.progress-full {
			border: 1px solid $uni-color-dark-main;
		}
		.progress-front{
			background-color: $uni-color-dark-main;
		}
	}
</style>