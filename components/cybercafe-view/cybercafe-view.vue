<template>
	<view v-show="visible">
		<view v-if="isAbsolute" class="cybercafe-view-bg" @tap="closeView"></view>
		<view class="cybercafe-main-view" :style="popViewStyle">
			<view class="display-flex sp-between">
				<view class="title">{{viewTitle}}</view>
				<view v-if="isAbsolute && closeAble" class="iconfont icon-guanbi" @tap="closeView" />
			</view>
			<scroll-view class="scroll-part2" scroll-y="true" refresher-default-style="black">
				<slot/>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'cybercafe-view',
		props:{
			isAbsolute:{
				type: Boolean,
				default: false,
			},
			isScrollable:{
				type: Boolean,
				default: false,
			},
			closeAble:{
				type: Boolean,
				default: true
			},
			popViewStyle: {
				type: String,
				default: ''
			},
			viewTitle:{
				type: String,
				default: ''
			}
		},
		data(){
			return{
				visible: true,
			}
		},
		mounted() {
			if(!this.isAbsolute){
				this.visible = true;
			}
		},
		methods: {
			openView(){
				this.visible = true;
			},
			closeView(){
				//if(this.isAbsolute && this.closeAble){
					this.visible = false;
				//}
			}
		}
	}
</script>

<style lang="scss">
	.cybercafe-view-bg{
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		background-color: $uni-bg-color-mask;
		z-index: -1;
	}
	.cybercafe-main-view{
		border-radius: $uni-border-radius-lg;
		margin: $uni-spacing-sm auto $uni-spacing-sm;
		padding: $uni-spacing-lg $uni-spacing-base $uni-spacing-base;
		box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-spacing-mini $uni-box-shadow-color;
		background-color: $uni-bg-color-grey;
		color: $uni-text-color;
		z-index: 1;
	}
	.title{
		padding-left: $uni-spacing-lg;
		font-weight: bold;
	}
	@media (prefers-color-scheme: dark) {
		.cybercafe-main-view{
			box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-spacing-mini $uni-color-subtitle;
			background-color: $uni-bg-dark-color-gray;
			color: $uni-text-color-grey;
		}
	}
</style>