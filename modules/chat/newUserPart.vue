<template>
	<view class="new-user-part group-item">
		<view><b>数据迁移入口：</b></view>
		<view>屏幕右上角<span class="iconfont icon-shezhi guide-icon"></span>系统设置 -> 下载数据</view>
		<view>完成旧数据本系统安装</view>
		<br>
		<view><b>容器新建入口：</b></view>
		<view>屏幕左上角<span class="iconfont icon-xitongcaidan guide-icon"></span>快捷菜单 -> 
			<span class="iconfont icon-shangxiajiantou guide-icon"></span>切换容器</view>
		<view>或<span class="iconfont icon-shezhi guide-icon"></span>本容器设置 下方-> 舞台控制</view>
		<br>
		<view><b>载入新角色：</b></view>
		<view>屏幕右上角<span class="iconfont icon-shezhi guide-icon"></span>系统设置 -> 发现线上角色 或 本地角色</view>
		<br>
		<view><b>误删开场白：</b></view>
		<view>屏幕左上角<span class="iconfont icon-xitongcaidan guide-icon"></span>快捷菜单 -> 
			<span class="iconfont icon-shezhi guide-icon"></span>本容器设置 下方-> 舞台控制</view>
		<view>点击 角色头像 进入角色切片页 -></view>
		<view>屏幕右上角 -> <span class="iconfont icon-chatou guide-icon"></span>进入容器，会给没有开场白的容器再导入开场白</view>
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
				//console.log('newUser init');
				uni.hideLoading();
			}
		}
	}
</script>

<style lang="scss">
	.new-user-part{
		background-color: $uni-bg-color-grey-half-transparent;
		color: $uni-text-color;
		line-height: calc(1.5 * $uni-font-size-huge);
		margin-top: calc($page-header-height + $uni-spacing-lg);
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