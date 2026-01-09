<template>
	<cybercafe-view class="pop-view" ref="popView" isAbsolute closeAble viewTitle="语序调整"
		popViewStyle="position:relative;height:80vh;" @close="closeView">
		<view class="hint display-flex display-line" @tap="gotoPromptSetting">
			<view class="iconfont icon-shezhi"></view> 提示词设置
		</view>
		<view v-if="list.length > 0" class="list-item display-flex display-line sp-between">
			<view>{{default_title}}</view>
		</view>
		<cybercafe-draggableList v-if="list.length > 0" ref="osDragList" :list="list"></cybercafe-draggableList>		
		<view v-else class="hint">暂无提示词，请先设置或导入</view>
	</cybercafe-view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import common from '@/func/common/common';
	import promptFun from '@/func/entity/promptFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'orderSetting',
		data(){
			return{
				default_title: '系统提示词',
				list: [
					/* {id: 1, title: '故事背景', enable: true},
					{id: 2, title: '人物外貌', enable: true},
					{id: 3, title: '聊天记录', enable: false},
					{id: 4, title: '人物性格', enable: true},
					{id: 5, title: '限制指令', enable: true},
					{id: 6, title: '输出格式要求', enable: true} */
				]
			}
		},
		computed:{
			...mapState('setting', ['customPrompt', 'entityId', 'globalTreeOrder', 'promptSelect']),
		},
		methods:{
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			async init(){
				this.list = await promptFun.loadTreeOrder();
				
				//console.log(this.list);
				if(this.list.length > 0){
					this.$nextTick(() => {
						this.$refs.osDragList.init();
					})
				}
			},
			openView(){
				uni.$emit('closeRightMenu');
				if(this.list.length == 0){
					this.$nextTick(() => {
						this.init();
					})
				}
				//console.log(this.list);
				this.$refs.popView.openView();
			},
			closeView(){
				//处理全局
				let global_tree = [];
				this.list.forEach(function(item) {
					//console.log(item.id, item.title)
					let in_global = false;
					let prompt = this.customPrompt[this.promptSelect];
					for(let key in prompt){
						if(key == item) {
							in_global = true;
							break;
						}
					}
					if(item.id < 5 || in_global){
						global_tree.push(item);
					}
				}, this);
				//存信息
				baseQuery.updateDataByKey('cybercafe_entity', 
					{'entity_tree_order': JSON.stringify(this.list)},
					{'entity_id': this.entityId});
				this.setSettingData({
					'globalTreeOrder': JSON.stringify(global_tree)
				})
			},
			gotoPromptSetting(){
				this.closeView();
				uni.navigateTo({
					url: '/pages/setting/promptSetting'
				})
			},
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
	.display-line{
		margin-bottom: $uni-spacing-base;
	}
	.list-item{
		margin-bottom: 10px;
	}
	@media (prefers-color-scheme: dark) {
		
	}
</style>