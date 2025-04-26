<template>
	<view class="content text-center">
		<image class="logo" src="/static/logo.png"></image>
		<view >
			<text class="title">{{slogan}}</text>
			<text class="title2">{{slogan2}}</text>
		</view>
	</view>
</template>

<script>
	import sqlite from '@/func/common/sqlite';
	import handleFun from '@/func/common/handleFun';
	export default {
		data() {
			return {
				slogan: 'Cyber',
				slogan2: 'Cafe'
			}
		},
		created() {
			sqlite.initTable();
				
			handleFun.beforeInit();
		},
		onLoad() {
			
		},
		methods: {
			
		}
	}
</script>

<style lang="scss">
	.logo{
		margin-top: 30vh;
		width: 108px;
		height: 108px;
	}
	.title{
		color: $uni-color-main;
	}
	.title2{
		color: $uni-color-secondary;
	}
</style>
