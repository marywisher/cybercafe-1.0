<template>
	<view class="new-user-part">
		<view><b>数据迁移入口：</b></view>
		<view>屏幕右上角<span class="iconfont icon-shezhi guide-icon"></span>系统设置 -> 下载数据</view>
		<view>完成旧数据本系统安装</view>
		<br>
		<view><b>容器新建入口：</b></view>
		<view>屏幕左上角<span class="iconfont icon-xitongcaidan guide-icon"></span>快捷菜单 -> 
			<span class="iconfont icon-shangxiajiantou guide-icon"></span>切换容器</view>
		<view>或<span class="iconfont icon-shezhi guide-icon"></span>本容器设置，调整容器内角色</view>
		<br>
		<view><b>载入新角色：</b></view>
		<view>屏幕右上角<span class="iconfont icon-shezhi guide-icon"></span>系统设置 -> 发现线上角色</view>
		<br>
		<view>更多新功能，敬请留意启动页tip，欢迎踊跃探索与分享</view>
	</view>
</template>

<script>
	export default{
		name: 'newUserPart',
		data(){
			return {
				new_user_guide: '',
				md_data: ''
			}
		},
		methods: {
			init(){
				console.log('newUser init');
				uni.hideLoading();
			}
		}
	}
</script>

<style lang="scss">
	.new-user-part{
		padding: calc(3 * $uni-spacing-lg); 
		background-color: $uni-bg-color-grey-half-transparent;
		margin: calc($page-header-height + $uni-img-size-lg) 5vw;
		border-radius: $uni-border-radius-base;
		color: $uni-text-color;
		line-height: calc(1.5 * $uni-font-size-huge);
		border: $uni-border-base solid $uni-bg-color-grey;
	}
	.guide-icon{
		border: $uni-border-base solid $uni-color-main;
		color: $uni-color-main;
		border-radius: $uni-border-radius-lg;
		padding: $uni-spacing-base;
		margin: $uni-width-none $uni-spacing-base;
	}
	@media (prefers-color-scheme: dark) {
		.new-user-part{
			background-color: $uni-bg-dark-color-grey-half-transparent;
			color: $uni-text-color-grey;
		}
		.guide-icon{
			border: $uni-border-base solid $uni-color-dark-main;
			color: $uni-color-dark-main;
		}
	}
</style>