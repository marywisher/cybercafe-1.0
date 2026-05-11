<template>
	<cybercafe-header :bgOpacity="bgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-sousuo" @tap="showSearchModal"></view>
			<label class="hint" v-if="entityId > 0" @tap="showSearchModal">搜索</label>
			<view class="iconfont icon-duanxin" @tap="sendHistory"></view>
			<label class="hint" v-if="entityId > 0" @tap="sendHistory">发送至邮箱</label>
		</view>
		<cybercafe-dialogueModal class="cdModal" ref="searchHistoryView" title="请输入搜索关键字" btnName="搜索" @confirm="searchHistory"/>
	</cybercafe-header>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'historyHeader',
		data(){
			return{
				
			}
		},
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
		},
		computed: {
			...mapState('setting', ['entityId']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData']),
			async init(){
				this.$refs.searchHistoryView.closeView();
			},
			back(){
				uni.navigateBack();
			},
			sendHistory(){
				//
				console.log('wait');
			},
			showSearchModal(){
				//
				this.$refs.searchHistoryView.openView();
			},
			searchHistory(keyword){
				this.$emit('searchConfirm', keyword);
			}
		}
	}
</script>

<style lang="scss">
	.iconfont{
		font-size: calc(2 * $uni-font-size-sm);
	}
	.iconback{
		transform: rotate(180deg);
	}
</style>