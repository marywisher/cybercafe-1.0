<template>
	<view :class="{'cybercafe-container': isAbsolute}" v-show="visible">
		<view v-if="isAbsolute" class="cybercafe-view-bg" @tap="closeView"></view>
		<view class="cybercafe-main-view" 
			:class="{'crt-view': crtView, 
				'select-view': selectView, 
				'group-item': !isAbsolute, 
				'absolute-view': isAbsolute,
				'disabled-view': disabledView
			}" 
			:style="popViewStyle">
			<view class="view-top">
				<view class="title text-center" :class="{'title-red': titleRed}">{{viewTitle}}</view>
				<view v-if="isAbsolute && closeAble" class="iconfont icon-guanbi" @tap="closeView" />
			</view>
			<scroll-view v-if="isScrollable" class="cybercafe-scroll-part" scroll-y="true" refresher-default-style="black">
				<slot/>
			</scroll-view>
			<view v-else>
				<slot/>
			</view>
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
			},
			crtView: {
				type: Boolean,
				default: false,
			},
			selectView: {
				type: Boolean,
				default: false
			},
			disabledView: {
				type: Boolean,
				default: false
			},
			titleRed:{
				type: Boolean,
				default: false,
			}
		},
		data(){
			return{
				visible: false,
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
				this.visible = false;
				if(this.closeAble){
					this.$emit('close');
				}
			}
		}
	}
</script>

<style lang="scss">
	.cybercafe-container, .cybercafe-view-bg{
		position: fixed;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;		
	}
	.cybercafe-view-bg{
		background-color: $uni-bg-color-mask;
		z-index: -1;
	}
	.cybercafe-main-view{
		border-radius: $uni-border-radius-lg;
		border: $uni-border-base solid $uni-bg-color-grey;
		background-color: $uni-bg-color-grey;
		color: $uni-text-color;
		z-index: 2;
	}
	.view-top{
		position: relative;
	}
	.title{
		padding-left: $uni-spacing-lg;
		font-weight: bold;
	}
	.title-red{
		color: $uni-color-main;
	}
	.icon-guanbi{
		position: absolute;
		top: 0;
		right: 0;
	}
	.cybercafe-scroll-part{
		max-height: 75vh;
	}
	.crt-view{
		box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-color-main;
		border: $uni-border-base solid $uni-color-main;
	}
	.select-view{
		box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-color-secondary;
		border: $uni-border-base solid $uni-color-secondary;
	}
	.absolute-view{
		width: 80vw;
		padding: $uni-spacing-lg;
		margin: 10vh auto;
	}
	.disabled-view{
		color: $uni-text-color-disable;
	}
	@media (prefers-color-scheme: dark) {
		.cybercafe-main-view{
			border: $uni-border-base solid $uni-bg-dark-color-gray;
			background-color: $uni-bg-dark-color-gray;
			color: $uni-text-color-grey;
		}
		.crt-view{
			box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-color-dark-main;
			border: $uni-border-base solid $uni-color-dark-main;
		}
		.title-red{
			color: $uni-color-dark-main;
		}
		.disabled-view{
			color: $uni-color-subtitle;
		}
	}
</style>
