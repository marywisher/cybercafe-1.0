<template>
	<view v-show="title">
		<view class="display-flex header-title display-line">
			<view class="title-label">{{title}}</view>
			<span class="iconfont icon-dianping" @tap="openPop"></span>
		</view>
		
		<cybercafe-dialogueModal class="pop-view" ref="popEditTitle" title="修改羁绊名称"
			:content="title" @confirm="editEntityName"></cybercafe-dialogueModal>
	</view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import common from '@/func/common/common';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: 'titlePart',
		computed: {
			...mapState('dialogue', ['title']),
			...mapState('setting', ['entityId']),
		},
		methods:{
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData']),
			init(){
				this.$refs.popEditTitle.closeView();
			},
			openPop(){
				this.$refs.popEditTitle.openView();
			},
			editEntityName(param){
				this.setDiaData({
					'title': param,
				});
				baseQuery.updateDataByKey('cybercafe_entity', 
					{entity_title: param,
					entity_updated_at: common.getCurrentTimeStampStr()},
					{entity_id: this.entityId});
			},
		},
	}
</script>

<style lang="scss">
	.header-title{
		justify-content: center;
		line-height: $uni-font-size-huge;
	}
	.title-label{
		font-size: $uni-font-size-sm;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 50vw;
	}
	.icon-dianping{
		font-size: $uni-font-size-sm !important;
		color: $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.icon-dianping{
			color: $uni-color-dark-main;
		}
	}
</style>