<template>
	<view v-show="visible">
		<view class="cybercafe-menu-bg" @tap="closeView"></view>
		<view class="cybercafe-main-menu"
			:class="{'cybercafe-main-menu-short': mode == 'short', 'cybercafe-main-menu-long': mode == 'long'}">
			<view class="display-flex title-line"  @tap="changeMode">
				<view class="title iconfont icon-xiayibu"></view>
				<span>{{viewTitle}}</span>
			</view>
			<scroll-view class="scroll-part2" scroll-y="true" refresher-default-style="black">
				<slot/>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'cybercafe-menu',
		props:{
			closeAble:{
				type: Boolean,
				default: true
			},
			viewTitle:{
				type: String,
				default: ''
			}
		},
		data(){
			return{
				visible: false,
				mode: 'short', //short long
			}
		},
		methods: {
			openView(){
				this.mode = 'short';
				this.visible = true;
			},
			closeView(){
				this.visible = false;
			},
			changeMode(){
				if(this.mode == 'short') this.mode = 'long';
				else this.mode = 'short';
			},
			toggleView(){
				if(this.visible == false){
					this.mode = 'short';
					this.visible = true;
				} else this.visible = false;
			}
		}
	}
</script>

<style lang="scss">
	.cybercafe-menu-bg{
		position: absolute;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		z-index: -1;
		background-color: transparent;
	}
	.cybercafe-main-menu{
		position: fixed;
		left: 0;
		border: $uni-border-base solid $uni-bg-color-grey;
		background-color: $uni-bg-color-grey;
		color: $uni-text-color;
		padding: $uni-spacing-base;
		border-radius: $uni-width-none $uni-border-radius-lg $uni-border-radius-lg $uni-width-none;
		z-index: 2;
	}
	.cybercafe-main-menu-short{
		width: 10vw;
	}
	.cybercafe-main-menu-long{
		width: 60vw;
	}
	.title-line{
		border-bottom: $uni-border-base solid $uni-text-color-grey;
	}
	.cybercafe-main-menu-long .icon-xiayibu{
		transform: rotate(180deg);
	}
	.cybercafe-main-menu-long span{
		display: block;
	}
	.cybercafe-main-menu-short span{
		display: none;
	}
	.cybercafe-main-menu span{
		font-size: $uni-font-size-lg;
		line-height: calc(2 * $uni-font-size-lg);
	}
	.cybercafe-main-menu .iconfont{
		font-size: calc(2 * $uni-font-size-lg);
	}
	@media (prefers-color-scheme: dark) {
		.cybercafe-main-menu{
			border: $uni-border-base solid $uni-bg-dark-color-gray;
			background-color: $uni-bg-dark-color-gray;
			color: $uni-text-color-grey;
		}
	}
</style>