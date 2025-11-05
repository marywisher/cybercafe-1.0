<template>
	<view>
		<entityListHeader></entityListHeader>
		<view class="list-part">
			<cybercafe-view v-for="(item, index) in entity_list" :key="item.entity_id">
				<view class="display-flex">
					<image v-if="item.entity_img && item.entity_img != default_img"
						class="entity-img" mode="aspectFill" :src="item.entity_img"
						 @tap="gotoEntity(item.entity_id)"></image>
					<view class="item-content">
						<view class="display-flex sp-between display-line">
							<view class="display-flex display-line">
								<view @tap="gotoEntity(item.entity_id)">{{item.entity_title}} </view>
								<span class="iconfont icon-shezhi" @tap="gotoEntitySetting(item.entity_id)"></span>
							</view>
							<view class="hint display-flex display-line" @tap="gotoEntity(item.entity_id)">{{item.message_count}}条记录 
								<view class="iconfont icon-xiayibu"></view>
							</view>
						</view>
						<view class="display-flex item-character-line display-line">
							<image v-for="(citem, cindex) in item.character_img" mode="aspectFill"
								class="item-character" :src="citem" :key="cindex" @tap="gotoCharacter(cindex)"></image>
							<view class="iconfont icon-jiahao" @tap="gotoEntitySetting(item.entity_id)"></view>
							<view class="iconfont icon-jianhao" @tap="gotoEntitySetting(item.entity_id)"></view>
						</view>
					</view>				
				 </view>
			</cybercafe-view>
		</view>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import dialogueQuery from '@/func/dbManager/dialogueQuery';
	import entityFun from '@/func/entity/entityFun';
	import entityListHeader from '@/modules/entity/entityListHeader';
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
		components:{
			entityListHeader
		},
		computed:{
			...mapState('setting', ['entityId']),
		},
		methods: {
			...mapMutations('setting', ['setSettingData']),
			async init(){
				this.entity_list = await dialogueQuery.getAllEntityList();
			},
			async gotoEntity(entity_id){
				this.setSettingData({'entityId': entity_id});
				entityFun.enterEntity();
			},
			gotoEntitySetting(entity_id){
				this.setSettingData({'entityId': entity_id});
				uni.navigateTo({
					url: '/pages/entity/index'
				})
			},
			gotoCharacter(character_id){
				uni.navigateTo({
					url: '/pages/character/index?id=' + character_id
				})
			}
		},
		onShow() {
			this.init();
		}
	}
</script>

<style lang="scss">
	.list-part{
		margin-top: calc($uni-spacing-lg + $page-header-height);
	}
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
		margin: $uni-spacing-base $uni-spacing-base $uni-spacing-base $uni-width-none;
	}
</style>