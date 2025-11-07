<template>
	<cybercafe-view ref="partContainer" isAbsolute closeAble isScrollable
		viewTitle="选择容器" @close="closeFun">
		<cybercafe-view>
			<view class="display-flex display-line" @tap="goToCharacter(0)">
				<view class="iconfont icon-jiahao"></view>
				<view>新建容器</view>
			</view>
		</cybercafe-view>
		<cybercafe-view v-for="(item, index) in entity_list" :key="index">
			<view class="display-flex display-line" @tap="goToCharacter(item.entity_id)">
				<image v-if="item.entity_img && item.entity_img != default_img"
					class="entity-img" mode="aspectFill" :src="item.entity_img"></image>
				<view>{{item.entity_title}}</view>
			</view>
		</cybercafe-view>
	</cybercafe-view>
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
	export default{
		name: 'previewEntityPart',
		data(){
			return{
				entity_list: [],
				default_img: configData.defaultImg
			}
		},
		props:{
			characterId: {
				type: Number,
				default: 0
			}
		},
		computed: {
			...mapState('dialogue', ['selectedEntityId']),
		},
		methods: {
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			async init(){
				this.$refs.partContainer.openView();
				//不包含当前online_id的entity
				this.entity_list = await dialogueQuery.getSpecialEntityList(this.characterId);
				//console.log(this.entity_list);
			},
			goToCharacter(entity_id){
				this.setDiaData({'selectedEntityId': entity_id});
				//console.log(entity_id);
				//console.log(this.characterId)
				uni.navigateTo({
					url: '/pages/character/index?online_id=' + this.characterId
				})
			},
			closeFun(){
				this.$emit('cancel');
			}
		}
	}
</script>

<style lang="scss">
	.entity-img{
		width: $uni-img-size-sm;
		height: $uni-img-size-sm;
		border-radius: $uni-border-radius-lg;
		margin-right: $uni-spacing-lg;
		flex-grow: 0;
	}
</style>