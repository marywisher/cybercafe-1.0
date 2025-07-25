<template>
	<view>
		<view>
			<view class="iconfont icon-xitongcaidan" @tap="openMenuFun"></view>
		</view>
		<cybercafe-menu ref="rightMenuPop" class="pop-menu display-flex sp-between"
			viewTitle="快捷菜单">
			<view class="display-flex pop-menu-line">
				<view class="display-flex" @tap="openSetting('ai')">
					<view class="iconfont icon-chatou menu-icon-left"></view>
					<view class="under-line text-center">{{aiSelect}}</view>
				</view>				
				<view class="iconfont icon-shezhi menu-icon-right iconai" @tap="gotoAiSetting"></view>
			</view>
			<view class="display-flex pop-menu-line" @tap="openSetting('order')">
				<view class="iconfont icon-shangxiajiantou menu-icon-left"></view>
				<span>知识树调整</span>
			</view>
			<view class="display-flex pop-menu-line">
				<view class="iconfont icon-shezhi menu-icon-left"></view>
				<span>本容器设置</span>
			</view>
			<view class="display-flex pop-menu-line" @tap="changeEntity">
				<view class="iconfont icon-shangxiajiantou1 menu-icon-left"></view>
				<span>切换容器</span>
			</view>
			<!-- <view class="display-flex pop-menu-line required" @tap="delEntity">
				<view class="required iconfont icon-shanchu menu-icon-left"></view>
				<span>解散本容器</span>
			</view> -->
			<!-- 正则 破甲 -->
		</cybercafe-menu>
		
		<aiSetting ref="aiSettingView"></aiSetting>
		<orderSetting ref="orderSettingView"></orderSetting>
	</view>
</template>

<script>
	import aiSetting from '@/modules/setting/quickMenu/aiSetting';
	import entityBaseInfo from '@/func/entity/entityBaseInfo';
	import orderSetting from '@/modules/setting/quickMenu/orderSetting';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'popMenu',
		components:{
			aiSetting,
			orderSetting
		},
		watch:{
			aiRange(newValue){
				if(newValue.hasOwnProperty(this.ai)){
					this.setDiaData({
						'aiSelect': newValue[this.ai].nickName
					})
				}
			},
			ai(newValue){
				if(this.aiRange.hasOwnProperty(newValue)){
					this.setDiaData({
						'aiSelect': this.aiRange[newValue].nickName
					})
				}
			}
		},
		computed:{
			...mapState('dialogue', ['ai', 'aiRange', 'aiSelect']),
		},
		methods:{
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			init(){
				this.$refs.popAiSetting.closeView();
				this.$refs.rightMenuPop.closeView();
			},
			openMenuFun(){
				this.$refs.rightMenuPop.toggleView();
			},
			openSetting(param){
				this.$refs.rightMenuPop.closeView();
				this.$refs[param + 'SettingView'].openView();
			},
			gotoAiSetting(){
				this.$refs.rightMenuPop.closeView();
				uni.navigateTo({
					url: '/pages/setting/aiSetting'
				})
			},
			delEntity(){
				entityBaseInfo.delEntity();
			},
			changeEntity(){
				this.$refs.rightMenuPop.closeView();
				uni.navigateTo({
					url: '/pages/chat/entityList'
				})
			}
		}
	}
</script>

<style lang="scss">
	.pop-menu{
		position: fixed;
		height: 80vh;
		flex-direction: column;
		z-index: 4;
	}
	.pop-menu-line{
		margin: calc(4 * $uni-spacing-lg) $uni-width-none;
		position: relative;
	}
	.cybercafe-main-menu span{
		font-size: $uni-font-size-lg;
		line-height: calc(2 * $uni-font-size-lg);
	}
	.cybercafe-main-menu .iconfont{
		font-size: calc(2 * $uni-font-size-lg);
	}
	.cybercafe-main-menu-long span{
		display: block;
	}
	.cybercafe-main-menu-short span{
		display: none;
	}
	.pop-menu-line .menu-icon-left{
		margin: $uni-width-none $uni-spacing-base;
	}
	.cybercafe-main-menu-short .pop-menu-line .menu-icon-right{
		display: none;
	}
	.cybercafe-main-menu-long .pop-menu-line .menu-icon-right{
		position: absolute;
		top: 0;
		right: 0;
	}
	.under-line{
		border-bottom: $uni-border-base solid $uni-color-main;
		color: $uni-color-main;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 30vw;
	}
	.required .iconfont{
		color: $uni-color-error !important;
	}
	.icon-shangxiajiantou1{
		transform: rotate(90deg);
	}
	@media (prefers-color-scheme: dark) {
		.cybercafe-main-menu .iconfont{
			color: $uni-text-color-grey;
		}
		.cybercafe-main-menu{
			background-color: $uni-bg-dark-color-gray;
		}
		.under-line{
			border-bottom-color: $uni-color-dark-main;
			color: $uni-color-dark-main;
		}
	}
</style>