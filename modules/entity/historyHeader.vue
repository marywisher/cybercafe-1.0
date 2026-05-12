<template>
	<cybercafe-header :bgOpacity="bgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-sousuo" @tap="showSearchModal"></view>
			<label class="hint" @tap="showSearchModal">搜索</label>
			<view v-if="network_type != 'none' && len > 0" class="iconfont icon-duanxin" @tap="sendHistory"></view>
			<label class="hint" v-if="network_type != 'none' && len > 0" @tap="sendHistory">发送至邮箱</label>
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
				network_type: 'none',
			}
		},
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
			networkType: {
				type: String,
				default: 'none'
			},
			len: {
				type: Number,
				default: 0
			}
		},
		computed: {
			...mapState('user', ['emailTrusted', 'modalData', 'modalPageId', 
				'modalShow', 'userName']),
			...mapState('setting', ['entityId']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			async init(){
				this.network_type = this.networkType;
				this.$refs.searchHistoryView.closeView();
			},
			back(){
				uni.navigateBack();
			},
			sendHistory(){
				console.log(this.emailTrusted);
				if(!this.emailTrusted){
					this.setUserData({
						'modalData':{
							title: '邮箱待验证',
							content: '当前邮箱未验证，请前往系统设置界面验证邮箱后再使用此功能',
							confirmText: '',
							cancelText: "OK",
							success: (res) => {},
						},
						'modalShow': true, 
						'modalPageId': 'entityHistory'});
				}else{
					this.$emit('sendHistory');
				}
			},
			showSearchModal(){
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