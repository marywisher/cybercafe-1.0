<template>
	<view>
		<cybercafe-view v-for="(item, index) in character_list" :key="item.character_id">
			 <view class="display-flex sp-between" @tap="gotoDetail(item.character_id)">
				<view>
					<image v-if="item.character_img && item.character_img != default_img"
					 	class="character-img" mode="aspectFill" :src="item.character_img"></image>
					<view class="hint creater-part item-character-right">By: {{item.user_nickname}}</view>
					<view class="display-flex display-line sp-between hint item-character-right creater-part">
						<view class="iconfont icon-kanguo hint">{{item.character_view_count}}</view>
						<view class="iconfont icon-chatou hint">{{item.character_link_count}}</view>
					</view>
				</view>
				<view class="item-content">
					<view class="display-flex sp-between display-line">
						<view class="display-flex display-line">
							<view>{{item.character_name}}</view>
							<view v-if="item.character_gender == 1" class="iconfont icon-xingbienan"></view>
							<view v-if="item.character_gender == 2" class="iconfont icon-xingbienv"></view>
							<view v-if="item.character_gender == 0" class="iconfont icon-WuXingBie2"></view>
						</view>
						<view class="hint display-flex display-line"><!--0个容器引用-->
							<view class="iconfont icon-xiayibu"></view>
						</view>
					</view>
					<view class="display-flex item-character-line display-line hint">{{item.short_description}}</view>
					<view class="display-flex display-line tag-part">
						<view v-for="(tag, index1) in item.character_tag" :key="index1" class="tag-item">{{tag}}</view>
					</view>
				</view>	
			 </view>
		</cybercafe-view>
		<view class="text-center hint">—— 没有更多了，粮袋见底了 ——</view>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	import characterFun from '@/func/entity/characterFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data() {
			return {
				character_list: [],
				default_img: configData.defaultImg,
				from: 'index',
				next_page: 1,
			}
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'characterList'){
				    	this.$nextTick(() => {
				    		this.$refs.cModal.show(this.modalData);
						});
				    	this.setUserData({
				    		'modalShow': false,
				    		'modalPageId': ''
				    	})
				    }
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
			...mapState('setting', ['userId']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			async loadList(){
				let request_data = {
					aim_id: this.userId,
					type: 'new',
					limit: 10,
					except: [],
				};
				//let _self = this;
				if(this.from == 'index') request_data.page = this.next_page;
				let result_data = await characterFun.loadList(request_data, 'characterList');
				this.next_page = result_data.next_page;
				for (let i in result_data.character_list) {
					this.character_list.push(result_data.character_list[i]);
				}
			},
			gotoDetail(character_id){
				//console.log(character_id);
				uni.navigateTo({
					url: '/pages/character/preview?id=' + character_id
				})
			}
		},
		onLoad() {
			this.loadList();
		},
		onReachBottom() {
			//console.log('pulling down');
			uni.startPullDownRefresh();
			this.loadList();
			
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 2000);
		}
	}
</script>

<style lang="scss">
	.character-img{
		width: calc(2 * $uni-img-size-lg);
		height: calc(2 * $uni-img-size-lg);
		border-radius: $uni-border-radius-lg;
		margin-right: $uni-spacing-lg;
	}
	.item-content{
		width: 80%;
		line-height: $uni-font-size-lg;
	}
	.item-character-line{
		padding: $uni-spacing-base $uni-width-none;
	}
	.tag-part{
		flex-wrap: wrap;
		row-gap: $uni-spacing-base;
	}
	.num-part{
		width: 20vw;
	}
	.creater-part{
		text-overflow: ellipsis;
		font-size: $uni-font-size-mini;
	}
	.item-character-right{
		width: calc(2 * $uni-img-size-lg);
		padding: $uni-spacing-base $uni-width-none;
	}
	@media (prefers-color-scheme: dark) {
		
	}
</style>