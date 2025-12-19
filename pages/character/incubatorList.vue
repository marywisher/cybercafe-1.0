<template>
	<view>
		<incubatorListHeader></incubatorListHeader>
		<view class="list-part">
			<cybercafe-view v-for="(item, index) in incubator_list" :key="item.incubator_id">
				 <view class="display-flex sp-between" @tap="gotoDetail(item.incubator_id)">
					<view>
						<image v-if="item.character_img && item.character_img != default_img"
						 	class="character-img" mode="aspectFill" :src="item.character_img"></image>
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
							<view class="tag-item">{{item.character_status_cn}}</view>
						</view>
					</view>	
				 </view>
			</cybercafe-view>
			<view class="text-center hint">—— 没有更多了，该催更了 ——</view>
		</view>
		
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import incubatorFun from '@/func/character/incubatorFun';
	import baseQuery from '@/func/dbManager/baseQuery';
	import incubatorListHeader from '@/modules/character/incubatorListHeader';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data() {
			return {
				incubator_list: [],
				default_img: configData.defaultImg,
			}
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
					//console.log(newValue);
					if(newValue && this.modalPageId == 'incubatorList'){
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
		components: {
			incubatorListHeader
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			async loadList(){
				//let sql_str = 'select * from cybercafe_incubator where character_status > 3';
				let incubator_data = await baseQuery.getDataByKey('cybercafe_incubator');
				for (let i in incubator_data) {
					if(incubator_data[i].character_status < 3) continue;
					//console.log(incubator_data[i]);
					this.incubator_list.push(incubatorFun.parseData(incubator_data[i]));
					//console.log(this.incubator_list[i]);
				}
				
				//this.$forceUpdate();
			},
			gotoDetail(incubator_id){
				//console.log(incubator_id);
				uni.navigateTo({
					url: '/pages/character/incubator?id=' + incubator_id
				})
			}
		},
		onLoad() {
			this.loadList();
		}
	}
</script>

<style lang="scss">
	.list-part{
		margin-top: calc($uni-spacing-lg + $page-header-height);
	}.character-img{
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