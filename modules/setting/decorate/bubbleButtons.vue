<template>
	<view>
		<view class="display-flex sp-between">
			<view v-if="(patternStatus == 4 || patternStatus == 6) && showCode">
				<cybercafe-button btnClass="btn-warn" :btnDisable="patternHtml.length == 0 || patternCss.length == 0"
					@tapBtn="saveNew" btnName="另存" btnStyle="font-size: 10px;"></cybercafe-button>
			</view>
			<view v-if="(patternStatus == 4 || patternStatus == 6) && showCode && patternIndex > 2">
				<cybercafe-button :btnDisable="patternHtml.length == 0 || patternCss.length == 0"
					@tapBtn="save" btnName="保存" btnStyle="font-size: 10px;"></cybercafe-button>
			</view>
			<view>
				<cybercafe-button @tapBtn="reset" btnName="重置" btnStyle="font-size: 10px;"></cybercafe-button>
			</view>
			<view>
				<cybercafe-button btnClass="btn-primary" @tapBtn="apply" btnName="应用"></cybercafe-button>
			</view>
		</view>
		<cybercafe-dialogueModal ref="newPatterName" title="样式名" @confirm="dialogInputConfirm"></cybercafe-dialogueModal>
	</view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import bubbleFun from '@/func/setting/bubbleFun.js';
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "bubbleButtons",
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow', 'userKey']),
			...mapState('bubble', ['bubbleColor1', 'bubbleColor2', 'bubbleRefresh',
				'cssAfter', 'cssPrev',
				'displayCss', 'displayHtml',
				'fontColor1', 'fontColor2', 'nextId',
				'patternCss', 'patternHtml', 'patternIndex', 'patternKey', 
				'patternName', 'patternRange', 'patternStatus', 'showCode']),
			...mapState('setting', ['bubbleColor', 'chatCss', 'chatHtml', 'chatPattern', 
				'fontColor']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('bubble', ['getBubbleData', 'setBubbleData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			saveNew() {
				this.$refs.newPatterName.open();
			},
			async dialogInputConfirm(val) {//样式名弹窗
				let date = common.getCurrentTimeStampStr();
				let next_key = this.userKey + '-b-' + this.nextId;
				let insertData = {
					'pattern_key': next_key,
					'pattern_name': val,
					'pattern_html': this.patternHtml,
					'pattern_css': this.cssPrev + this.patternCss + this.cssAfter,
					'pattern_options': JSON.stringify(bubbleFun.getOptions()),
					'pattern_created_at': date,
					'pattern_updated_at': date,
					'pattern_status': 4
				};
				let pattern_index = await baseQuery.insertDataByKey('cybercafe_bubble_pattern', insertData, true);
				insertData.pattern_id = pattern_index;
				this.patternRange.push(insertData);
				
				this.setBubbleData({
					'patternIndex': pattern_index,
					'patternKey': next_key,
					'patternName': val,
					'nextId': this.nextId + 1,
					'patternRange': this.patternRange
				})
					
				this.showModal();
			},
			showModal(){
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "上传样式",
						content: "上传当前气泡样式吗？",
						cancelText: "取消",
						confirmText: "上传",
						success: (res) => {
							if (res.confirm) {
								_self.upload();
							}else{
								uni.showToast({
									title: '保存成功',
									icon: 'success'
								})
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'decorateSetting'
				})
			},
			upload() {
				let _self = this;
				let date = common.getCurrentTimeStampStr();
				uni.showLoading();
				request.post("settingController/updatePattern", 'decorateSetting', {
					key: this.patternKey,
					type: 'b',
					name: this.patternName,
					html: this.patternHtml,
					css: this.patternCss,
					options: JSON.stringify(bubbleFun.getOptions())
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						})
						console.log(res.result);
						let updateData = {
							'pattern_key': res.result.key,
							'pattern_updated_at': date,
							'pattern_status': 6
						};
						let whereObj = {
							'pattern_id': _self.patternIndex
						};
						baseQuery.updateDataByKey('cybercafe_bubble_pattern', updateData, whereObj);
						_self.setBubbleData({'patternKey': res.result.key});
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
				});
			},
			save() {
				console.log(this.patternCss);
				let date = common.getCurrentTimeStampStr();
				let updateData = {
					'pattern_html': this.patternHtml,
					'pattern_css': this.cssPrev
						+ this.patternCss.replace(new RegExp("'", 'g'), "\'") + this.cssAfter,
					'pattern_updated_at': date,
					'pattern_status': 4
				};
				let whereObj = {
					'pattern_id': this.patternIndex
				};
				//console.log(this.patternIndex);
				baseQuery.updateDataByKey('cybercafe_bubble_pattern', 
					updateData, whereObj).then(()=>{}, (e)=>{console.log(e)});
				this.showModal();
			},
			apply() {
				let fontColor = [this.fontColor1, this.fontColor2];
				let bubbleColor = [this.bubbleColor1, this.bubbleColor2];
				this.setSettingData({
					'chatPattern': this.patternIndex,
					'fontColor': fontColor,
					'bubbleColor': bubbleColor
				});
				if (this.patternStatus == 1) {
					this.setSettingData({
						'chatHtml': this.displayHtml,
						'chatCss': this.cssPrev + this.displayCss + this.cssAfter
					});
				} else {
					this.setSettingData({
						'chatHtml': this.patternHtml,
						'chatCss': this.cssPrev + this.patternCss + this.cssAfter
					});
				}
				this.setBubbleData({
					'bubbleRefresh': true
				})
				this.setUserData({
					'modalData': {
						title: "温馨提示",
						content: "已全局应用",
						cancelText: "OK",
						confirmText: "",
						success: (res) => {
						},
					},
					'modalShow': true,
					'modalPageId': 'decorateSetting'
				})
			},
			async reset() {
				await bubbleFun.loadPattern(this.patternIndex, true);
				this.$forceUpdate();
			},
		}
	}
</script>

<style>
</style>