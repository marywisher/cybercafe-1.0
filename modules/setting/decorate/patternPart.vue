<template>
	<view>
		<cybercafe-view ref="patternContainer" isAbsolute closeAble 
			isScrollable viewTitle="备选气泡样式" @close="closeView"
			popViewStyle="position:fixed; left: 7vw;">
			<cybercafe-view :crtView="item.pattern_id == patternIndex" 
				:selectView="(operate_id == item.pattern_id && item.pattern_id != patternIndex)"
				v-for="(item, index) in pattern_range" :key="index">
				<view @tap="selectOp(item.pattern_id)">
					<view class="display-flex sp-between">
						<view>{{item.pattern_name}}
							<span class="hint" :class="{'pattern-status1': item.pattern_status == 1, 
								'pattern-status4': item.pattern_status == 4, 
								'pattern-status6': item.pattern_status == 6}">
								{{item.pattern_status == 1 ? '下载' : (item.pattern_status == 4 ? '草稿' : '上架')}}
							</span>
						</view>
						<view>
							<cybercafe-button btnClass="btn-primary" @btnClick="changePattern" btnName="切换"
								 v-if="operate_id == item.pattern_id && item.pattern_id != patternIndex" ></cybercafe-button>
						</view>
					</view>
					<view v-if="item.pattern_id > 2" class="display-flex sp-between" style="padding-top: 10px;">
						<view>
							<cybercafe-button btnClass="btn-warn" 
								@btnClick="deletePattern(item.pattern_key, index, item.status)" btnName="删除" ></cybercafe-button>
						</view>
						<view>
							<cybercafe-button btnClass="btn-primary" @btnClick="renamePattern(index, item.pattern_name)" 
								btnName="重命名" v-if="item.pattern_status != 1" size="mini" ></cybercafe-button>
						</view>
						<view>
							<cybercafe-button btnClass="btn-default"
								@btnClick="clickToUpdateData(item.pattern_key, item.pattern_status)" btnName="更新" ></cybercafe-button>
						</view>
					</view>
				</view>
			</cybercafe-view>
		</cybercafe-view>
		
		<cybercafe-dialogueModal class="pop-view" ref="patternRename" title="修改气泡样式名称"
			:content="pattern_name" @confirm="dialogInputConfirm"></cybercafe-dialogueModal>
	</view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import bubbleFun from '@/func/setting/bubbleFun';
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "patternPart",
		data(){
			return{
				pattern_name: '',
				operate_id: 0,
				pattern_range: [],
				unsavable: true,
			}
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
			...mapState('bubble', ['patternIndex', 'patternRange']),
		},
		methods: {
			...mapMutations('user', ['setUserData']),
			...mapMutations('bubble', ['getBubbleData', 'setBubbleData']),
			openView(){
				uni.$emit('patternGSSlider', false);
				uni.$emit('globalDSSlider', false);
				this.operate_id = this.patternIndex;
				this.pattern_range = this.patternRange;
				this.$refs.patternContainer.openView();
				//console.log(this.operate_id);
			},
			selectOp(id){
				this.operate_id = id;
			},
			async changePattern(){
				this.setBubbleData({'patternIndex': this.operate_id});
				await bubbleFun.loadPattern(this.patternIndex, true);
				this.closeView();
				this.$refs.patternContainer.closeView();
			},
			closeView(){
				uni.$emit('patternGSSlider', true);
				uni.$emit('globalDSSlider', true);
				this.$forceUpdate();
			},
			renamePattern(index, name){
				this.pattern_name = name;
				this.operate_index = index;
				this.$refs.patternRename.openView();
			},
			deletePattern(key, index, status){
				let _self = this;
				if(status == 1){
					this.setUserData({
						'modalData': {
							title: '删除后需重新付费下载',
							confirmText: '删除',
							cancalText: '取消',
							success: (res) => {
								if (res.confirm) {
									_self.deleting(key, index);
								}
							}
						},
						'modalShow': true,
						'modalPageId': 'decorateSetting'
					})
				}else{
					this.setUserData({
						'modalData': {
							title: '删除后，线上内容同步下架',
							confirmText: '删除',
							cancalText: '取消',
							success: (res) => {
								if (res.confirm) {
									_self.confirmFun(key, index);
								}
							}
						},
						'modalShow': true,
						'modalPageId': 'decorateSetting'
					})
				}
			},
			confirmFun(key, index){
				let _self = this;
				uni.showLoading();
				request.post("settingController/setPatternStatus", 'decorateSetting', {
					key: key,
					status: 0
				}).then(res => {
					if (res.code == 200) {
						_self.deleting(key, index);
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				}).catch(e => {
					console.log(e);
				}).finally(() => {
					uni.hideLoading();
				});
			},
			deleting(key, index){
				//删除本地记录
				baseQuery.deleteDataByKey('cybercafe_bubble_pattern', {'pattern_key': key});
				this.pattern_range.splice(index, 1);
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
				if(this.patternIndex == this.operate_id){
					this.setBubbleData({'patternIndex': this.pattern_range[0]});
					bubbleFun.loadPattern(this.patternIndex, true);
				}
				this.setBubbleData({'patternRange': this.pattern_range});
			},
			clickToUpdateData(key, status) {
				let _self = this;
				if(status == 4){
					this.setUserData({
							'modalData': {
							title: '此操作将覆盖当前气泡本地代码',
							confirmText: '更新',
							cancalText: '取消',
							success: (res) => {
								if (res.confirm) {
									_self.updating(key);
								}
							}
						},
						'modalShow': true,
						'modalPageId': 'decorateSetting'
					})
				}else{
					_self.updating(key);
				}
			},
			updating(key){
				let _self = this;
				uni.showLoading();
				request.post("settingController/getPatternByKey", 'decorateSetting', {
					keys: key,
					time: 'ignore'
				}).then(res => {
					if (res.code == 200) {
						bubbleFun.updateData(res.result, true);
						uni.showToast({
							title: '更新完成',
							icon: 'success'
						})
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				}).catch(e => {
					uni.showToast({
						title: e,
						icon: 'none'
					})
				}).final(() => {
					uni.hideLoading();
				});
			},
			dialogInputConfirm(val) {//样式名弹窗
				let date = common.getCurrentTimeStampStr();
				uni.showLoading();
				let updateData = {
					'pattern_name': val,
					'pattern_updated_at': date,
				};
				let whereObj = {
					'pattern_id': this.operate_id
				};
				//console.log(this.pattern_index);
				baseQuery.updateDataByKey('cybercafe_bubble_pattern', 
					updateData, whereObj).then(()=>{}, (e)=>{console.log(e)});
				this.pattern_range[this.operate_index].pattern_name = val;
				request.post("settingController/updatePattern", 'decorateSetting', {
					key: this.pattern_range[this.operate_index].pattern_key,
					type: 'b',
					name: val,
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '重命名成功',
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				}).catch(e => {
					console.log(e);
				}).finally(() => {
					uni.hideLoading();
					this.$refs.patternRename.closeView();
				});
				this.setBubbleData({'patternRange': this.pattern_range});
			},
		}
	}
</script>

<style lang="scss">
	.pattern-status1, .pattern-status4, .pattern-status6{
		border-radius: $uni-border-radius-huge;
		font-size: $uni-font-size-sm;
		padding: $uni-width-none $uni-spacing-base;
		margin-left: $uni-spacing-lg;
	}
	.pattern-status1{
		color: $uni-color-secondary;
		border: $uni-border-base solid $uni-color-secondary;
	}
	.pattern-status4{
		color: $uni-text-color-grey;
		border: $uni-border-base solid $uni-text-color-grey;
	}
	.pattern-status6{
		color: $uni-color-main;
		border: $uni-border-base solid $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.pattern-status6{
			color: $uni-color-dark-main;
			border: $uni-border-base solid $uni-color-dark-main;
		}
	}
</style>