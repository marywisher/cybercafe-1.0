<template>
	<cybercafe-view class="pop-view" ref="popView" isAbsolute isScrollable closeAble viewTitle="知识树调整">
		<view class="hint display-flex display-line">
			<view class="iconfont icon-shezhi"></view> 更多设置
		</view>
		<view class="flag-tag">系统提示词</view>
		<view class="after-tag"></view>
		<cybercafe-view v-for="(item, index) in range" :key="index"
			:disabledView="!item.enabled" popViewStyle="position:relative;">
			<view >
				<view class="display-flex sp-between">aaa
				</view>
			</view>
		</cybercafe-view>
		<view class="flag-tag">聊天记录</view>
		<view class="after-tag"></view>
	</cybercafe-view>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'orderSetting',
		data(){
			return{
				range: []
			}
		},
		watch:{
			
		},
		computed:{
			...mapState('user', ['modalData', 'modalShow']),
			...mapState('dialogue', ['ai', 'aiRange']),
			...mapState('setting', ['aiShowInMenu']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('dialogue', ['getDiaData']),
			...mapMutations('setting', ['getSettingData']),
			openView(){
				this.$refs.popView.openView();
			}
		},
	}
</script>

<style lang="scss">
	.pop-view{
		position: fixed;
		top: 0;
		left: 0;
		z-index: 2;
	}
	@media (prefers-color-scheme: dark) {
		
	}
</style>