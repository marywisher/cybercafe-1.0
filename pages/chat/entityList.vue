<template>
	<view>
		<cybercafe-view v-for="(item, index) in entity_list" :key="item.entity_id">
			 <view class="display-flex" @tap="gotoEntity" :id="item.entity_id">
				<image v-if="item.entity_img && item.entity_img != default_img"
					class="entity-img" mode="aspectFill" :src="item.entity_img"></image>
				<view class="item-content">
					<view class="display-flex sp-between">
						<view>{{item.entity_title}}</view>
						<view class="hint">{{item.message_count}}条记录 <span class="iconfont icon-xiayibu"></span></view>
					</view>
					<view class="display-flex item-character-line">
						<image v-for="(citem, cindex) in item.character_img" mode="aspectFill"
							class="item-character" :src="citem" :key="cindex"></image>
					</view>
				</view>				
			 </view>
		</cybercafe-view>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import dialogueQuery from '@/func/dbManager/dialogueQuery';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		data() {
			return {
				entity_list: [],
				default_img: configData.defaultImg
			}
		},
		computed:{
			...mapState('setting', ['entityId']),
		},
		methods: {
			...mapMutations('setting', ['setSettingData']),
			async init(){
				this.entity_list = await dialogueQuery.getAllEntityList();
			},
			async gotoEntity(e){
				this.setSettingData({'entityId': e.currentTarget.id});
				uni.navigateBack({
				    delta: 1, // 返回上一级页面
				    success: () => {
				        uni.redirectTo({ // 或者使用uni.reLaunch({...})
				            url: '/pages/chat/index'
				        });
				    }
				});
			}
		},
		onLoad() {
			this.init();
		}
	}
</script>

<style lang="scss">
	.entity-img{
		width: $uni-img-size-huge;
		height: $uni-img-size-huge;
		border-radius: $uni-border-radius-lg;
		margin-right: $uni-spacing-lg;
		flex-grow: 0;
	}
	.item-content{
		flex-grow: 1;
		line-height: $uni-font-size-lg;
	}
	.item-character-line{
		flex-wrap: wrap;
	}
	.item-character{
		width: calc(2 * $uni-spacing-lg);
		height: calc(2 * $uni-spacing-lg);
		border-radius: $uni-border-radius-circle;
		margin: $uni-spacing-base $uni-spacing-base $uni-spacing-base 0;
	}
</style>