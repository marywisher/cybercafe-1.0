<template>
	<cybercafe-view class="pop-view" ref="popView" isAbsolute closeAble viewTitle="语序调整"
		popViewStyle="position:relative;height:80vh;" @close="closeView">
		<view class="hint display-flex display-line" @tap="gotoOrderSetting">
			<view class="iconfont icon-shezhi"></view> 更多设置
		</view>
		<view class="list-item display-flex display-line sp-between">
			<view v-if="list.length > 0">{{default_title}}</view>
		</view>
		<cybercafe-draggableList ref="osDragList" :list="list"></cybercafe-draggableList>		
	</cybercafe-view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import common from '@/func/common/common';
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
			...mapState('setting', ['entityId', 'globalTreeOrder']),
		},
		methods:{
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			async init(){
				//读取当前容器的设子结构，组织成list
				console.log(this.entityId);
				let entity_data = await baseQuery.getDataByKey('cybercafe_entity', {'entity_id': this.entityId});
				console.log(entity_data[0].entity_tree_order);
				if(entity_data && entity_data[0].entity_tree_order) this.list = JSON.parse(entity_data[0].entity_tree_order);
				else this.list = JSON.parse(this.globalTreeOrder);
				//再读切片，以防个性化设置
				let detail_data = await baseQuery.getDataByKey('cybercafe_entity_detail', {'entity_id': this.entityId});
				for(let i = 0; i < detail_data.length; i ++){
					let character_id = detail_data[i].character_id;
					//console.log(character_id);
					let character_data = await baseQuery.getDataByKey('cybercafe_character', {'character_id': character_id});
					if(character_data && character_data[0].character_description 
						&& common.isJsonString(character_data[0].character_description)){
						//console.log(character_data[0].character_description);
						let character_json = JSON.parse(character_data[0].character_description);
						for(let key in character_json.基础信息){
							//console.log(key);
							let is_in_list = false;
							for(let j = 0; j < this.list.length; j ++){
								if(this.list[j].title == key){
									is_in_list = true;
									break;
								} 
							}
							if(!is_in_list) this.list.push({
								id: this.list.length + 1,
								title: key,
								enable: true
							})
						}
						for(let key in character_json.扩展信息){
							//console.log(key);
							let is_in_list = false;
							for(let j = 0; j < this.list.length; j ++){
								if(this.list[j].title == key){
									is_in_list = true;
									break;
								} 
							}
							if(!is_in_list) this.list.push({
								id: this.list.length + 1,
								title: key,
								enable: true
							})
						}
					}
				}
				//console.log(this.list);
				if(this.list.length > 0){
					this.$nextTick(() => {
						this.$refs.osDragList.init();
					})
				}
			},
			openView(){
				uni.$emit('closeRightMenu');
				this.init();
				this.$refs.popView.openView();
			},
			closeView(){
				//处理全局
				let global_tree = [];
				this.list.forEach(function(item) {
					//console.log(item.id, item.title)
					if(item.id < 5){
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
			gotoOrderSetting(){
				this.closeView();
				/*uni.navigateTo({
					url: '/pages/setting/aiSetting'
				}) */
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