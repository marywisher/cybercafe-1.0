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
		<view class="flag-tag branch-story-tag" @tap="gotoCharacterList">舞台控制</view>
		<view class="entity-line after-tag"></view>
		<view class="entity-line">
			
		</view>
	</cybercafe-view>
</template>

<script>
	//import responseFun from '@/func/entity/responseFun';
	import common from '@/func/common/common';
	import baseQuery from '@/func/dbManager/baseQuery';
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
				subject_description: ''
			}
		},
		computed: {
			...mapState('user', ['darkMode', 'modalData', 'modalPageId', 'modalShow']),
			...mapState('setting', ['entityId']),
			...mapState('dialogue', ['title']),
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
				this.entity_title = entity_data[0].entity_title;
				this.subject_name = entity_data[0].subject_name;
				this.subject_description = entity_data[0].subject_description;
				this.$emit('afterLoad',
					{'image': entity_data[0].entity_img});
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
					/* let response_feedback = await responseFun.toolRequest('sensitive',
						value, 'entity');
					if(response_feedback == 200){ */
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
					/* }else{
						this.setUserData({
							'modalData': {
								title: "温馨提示",
								content: response_feedback,
								confirmText: '',
								cancelText: "OK",
							},
							'modalShow': true,
							'modalPageId': 'entity'
						})
					} */
				}
			},
			gotoCharacterList(){
				uni.navigateTo({
					url: '/pages/character/characterList'
				})
			}
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
</style>