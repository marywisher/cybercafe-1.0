<template>
	<cybercafe-view class="entity-container" popViewStyle="box-shadow:none;">
		<view class="hint required entity-line">* 为必填项</view>
		<view class="flag-tag base-tag">容器信息</view>
		<view class="after-tag display-flex entity-line display-line">
			<view><label class="required">*</label>标题 </view>
			<view class="hint" style="margin-left: 10rpx;">{{entity_title.length}} / 32字</view>
		</view>
		<view class="entity-line">
			<input v-model="entity_title" maxlength="32" class="bg-color" 
			confirm-type="done" @confirm="autoSave('entity_title', entity_title)"></input>
		</view>
		<view class="flag-tag world-tag">主控信息</view>
		<view class="after-tag display-flex entity-line display-line">
			<view>昵称 </view>
			<view class="hint" style="margin-left: 10rpx;">{{subject_name.length}} / 32字</view>
		</view>
		<view class="entity-line">
			<input v-model="subject_name" maxlength="32" class="bg-color" 
			confirm-type="done" @confirm="autoSave('subject_name', subject_name)"></input>
		</view>
		<view class="entity-line">
			<view class="display-flex display-line sp-between">主控描述
				<view class="hint">{{subject_description.length}} 字</view>
			</view>
			<textarea autoHeight v-model="subject_description" :cursor-spacing="150" :maxlength="-1"
				 class="bg-color" placeholder="请输入对主控的描述，主要用于AI代写" adjust-position 
				 :placeholder-style="placeholderStyle" confirm-hold
				 @blur="autoSave('subject_description', subject_description)"></textarea>
		</view>
		<view class="flag-tag branch-story-tag">舞台控制</view>
		<view class="entity-line after-tag"></view>
		<view class="hint">场上角色：</view>
		<view class="entity-line character-line display-flex display-line">
			<characterPart v-for="item, index in character_on_stage" :key="index" 
				:character-type="character_on_stage.length == 1 ? 'default' : 'out'"
				:characterId="item.character_id" :characterImg="item.character_img" @afterTap="moveCharacter"></characterPart>
		</view>
		<view class="hint">候场角色：</view>
		<view class="entity-line character-line display-flex display-line">
			<characterPart v-for="item, index in character_off_stage" :key="index" character-type="in"
				:characterId="item.character_id" :characterImg="item.character_img"@afterTap="moveCharacter"></characterPart>
				
			<view class="character-more iconfont icon-jiahao" @tap="moreCharacter"></view>
		</view>
	</cybercafe-view>
</template>

<script>
	import common from '@/func/common/common';
	import baseQuery from '@/func/dbManager/baseQuery';
	import characterPart from './characterPart';
	import dialogueQuery from '@/func/dbManager/dialogueQuery';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'detailPart',
		data(){
			return{
				entity_title: '',
				subject_name: '',
				subject_description: '',
				character_on_stage: [],
				character_off_stage: [],
				character_in_entity: []
			}
		},
		components: {
			characterPart
		},
		computed: {
			...mapState('user', ['darkMode', 'modalData', 'modalPageId', 'modalShow']),
			...mapState('setting', ['entityId']),
			...mapState('dialogue', ['selectedEntityId', 'title']),
			placeholderStyle(){
				return this.darkMode == 'light' ? 'color: #c0c0c0;' : 'color: #808080;';
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			async init(){
				//console.log(this.entityId);
				let entity_data = await baseQuery.getDataByKey('cybercafe_entity', {'entity_id': this.entityId});
				//console.log(entity_data);
				this.entity_title = entity_data[0].entity_title ? entity_data[0].entity_title : '';
				this.subject_name = entity_data[0].subject_name ? entity_data[0].subject_name : '';
				this.subject_description = entity_data[0].subject_description ? entity_data[0].subject_description : '';
				let entity_img = entity_data[0].entity_img;
				
				let character_data = await dialogueQuery.getCharacterByEntityIdNoLimit();
				this.character_on_stage = [];
				this.character_off_stage = [];
				this.character_in_entity = [];
				for(let i in character_data){
					if(character_data[i].detail_status == 1){
						this.character_on_stage.push(character_data[i]);
					}else{
						this.character_off_stage.push(character_data[i]);
					}
					//console.log(character_data[i].character_online_id);
					if(character_data[i].character_online_id) this.character_in_entity.push(character_data[i].character_online_id);
				}
				//console.log(this.character_in_entity);
				this.$emit('afterLoad',
					{'image': entity_img,
					'character_in_entity': this.character_in_entity});
				
				this.$forceUpdate();
			},
			async autoSave(kind, value){
				if(kind == 'entity_title' && this.entity_title.trim().length == 0){
					this.setUserData({
						'modalData': {
							title: "温馨提醒",
							content: "容器标题不能为空",
							confirmText: '',
							cancelText: "OK",
							success: (res) => {},
						},
						'modalShow': true,
						'modalPageId': 'entity'
					})
					return;
				}else{
					let updateArr = {'entity_updated_at': common.getCurrentTimeStampStr()};
					updateArr[kind] = value;
					let whereArr = {entity_id: this.entityId};
					let feedback = await baseQuery.updateDataByKey('cybercafe_entity', updateArr, whereArr);
					if(feedback == 'inserted' || feedback == 'updated'){
						if(kind == 'entity_title'){
							this.setDiaData({
								'title': value,
							});
						}
						//保存
						uni.showToast({
							title: '数据已保存',
							icon: 'none'
						})
					}					
				}
			},
			moveCharacter(character_id){
				console.log(character_id);
				let flag = true;
				for(let i in this.character_on_stage){
					if(this.character_on_stage[i].character_id == character_id){
						let character_data = this.character_on_stage[i];
						this.character_off_stage.push(character_data);
						this.character_on_stage.splice(i, 1);
						flag = false;
						break;
					}
				}
				if(flag){
					for(let i in this.character_off_stage){
						if(this.character_off_stage[i].character_id == character_id){
							let character_data = this.character_off_stage[i];
							this.character_on_stage.push(character_data);
							this.character_off_stage.splice(i, 1);
							break;
						}
					}
				}
			},
			moreCharacter(){
				this.setDiaData({'selectedEntityId': this.entityId});
				/* uni.navigateTo({//此处排除已有角色的线上版
					url: '/pages/character/characterList'
				}) */
				this.$emit('selectCharacter');
			},
			addCharacter(character_data){
				console.log(character_data);
				this.character_on_stage.push(character_data);
				this.$forceUpdate();
			},
		}
	}
</script>

<style lang="scss">
	.entity-container{
		position: relative;
		margin-top: 90vw;
	}
	.entity-line{
		margin-bottom: $uni-spacing-lg;
	}
	.flag-tag{
		left: $uni-spacing-lg;
	}
	.character-line{
		flex-wrap: wrap;
	}
	.character-more{
		width: calc(2 * $uni-font-size-huge);
		height: calc(2 * $uni-font-size-huge);
		border-radius: $uni-border-radius-circle;
		border: $uni-border-base solid $uni-border-color;
		font-size: $uni-font-size-huge;
		text-align: center;
		line-height: calc(2 * $uni-font-size-huge);
	}
</style>