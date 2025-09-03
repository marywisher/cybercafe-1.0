<template>
	<view>
		<cybercafe-card cardTitle="自设模型" :class="{'custom-card': ai == -1}">
			<cybercafe-segmented-control :list="custom_model_list" :currentIndex="crt_index"
				@selected="changeView">
				<view class="custom-api-part">
					<view v-if="crt_api.model == ''" class="display-flex sp-between display-line">
						<view class="ai-setting-label">api 参数</view>
						<view class="ai-setting-right">
							<view class="display-flex ai-setting-btn">
								<cybercafe-button btnClass="btn-primary"
									btnName="点击设置" @tapBtn="customChange"></cybercafe-button>
							</view>
						</view>
					</view>
					<view v-else>
						<view class="display-flex sp-between display-line">
							<view class="ai-setting-label">api url</view>
							<view class="ai-setting-right">
								<view class="custom-select" @tap="customChange">{{crt_api.domain}}</view>
								<view class="custom-select" @tap="customChange">{{crt_api.parsed_url}}</view>
							</view>
						</view>
						<view class="display-flex sp-between display-line">
							<view class="ai-setting-label">api model</view>
							<view class="ai-setting-right">
								<view class="custom-select" @tap="customChange">{{crt_api.model}}</view>
							</view>
						</view>
					</view>
					<view class="display-flex sp-between display-line">
						<view class="ai-setting-label">api key</view>
						<view class="ai-setting-right">
							<view v-show="crt_api.api_key != ''" class="custom-select" @tap="keyChange">{{crt_api.api_key}}</view>
							<view v-show="crt_api.api_key == ''" class="display-flex ai-setting-btn">
								<cybercafe-button btnClass="btn-primary"
									btnName="黏贴密钥" @tapBtn="keyChange"></cybercafe-button>
							</view>
						</view>
					</view>
					<view class="display-flex sp-between display-line">
						<view class="display-flex ai-setting-btn">
							<cybercafe-button btnClass="btn-default" :btnDisable="!crt_api.api_key || ai == (-1 - crt_index)" 
								btnName="设为默认模型"  @tapBtn="setAI"></cybercafe-button>
						</view>
						<view v-if="crt_api.connected" class="hint required text-center">{{crt_api.connect_text}}</view>
						<view class="display-flex ai-setting-btn">
							<cybercafe-button btnClass="btn-primary" :btnDisable="crt_api.connected || crt_api.uncheckable" 
								btnName="测试通讯"  @tapBtn="checkConnect"></cybercafe-button>
						</view>
					</view>
				</view>
			</cybercafe-segmented-control>
		</cybercafe-card>
		
		<cybercafe-view class="model-list" ref="modelList" isAbsolute isScrollable closeAble
			 viewTitle="大模型选择">
			<cybercafe-card v-for="(gitem, gindex) in group" :key="gindex" :showDetail="false"
				:cardTitle="gitem.groupName + gitem.cnName">
				<a v-if="gitem.url" class="hint" :href="gitem.url" target="_blank">官网链接</a>
				<cybercafe-view v-for="(item, index) in gitem.models" :key="index"
					:selectView="select_id == item.id"
					popViewStyle="position:relative;">
					<view @tap="selectItem(item)">
						<view v-if="item.id != 200" class="hint">模型名称：{{item.name}}</view>
					</view>
				</cybercafe-view>
			</cybercafe-card>
			<view class="hint">没找到？联系管理员添加</view>
		</cybercafe-view>
	</view>
</template>

<script>
	import aiFun from '@/func/setting/aiFun';
	import Base64 from '@/func/common/base64.min.js';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'customAiSetting',
		data(){
			return {
				group: {},
				select_id: -1,
				custom_model_list: [
					{'title': '自设1', 'level': 1},
					{'title': '自设2', 'level': 2},
					{'title': '自设3', 'level': 2}
				],
				custom_api: [],
				crt_index: 0,
				crt_api: {}
			}
		},
		computed:{
			...mapState('user', ['modalData', 'modalPageId', 'modalShow', 'userGroup']),
			...mapState('dialogue', ['ai', 'aiGroup', 'aiRange']),
			...mapState('setting', ['aiShowInMenu', 'customApi',
				'maxToken', 'temperature', 'tokenSetting', 'topP']),
		},
		methods:{
			...mapMutations('user', ['setUserData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			init(){
				let api_data = {
					'domain': '',
					'parsed_url': '',
					'model': '',
					'api_key': '',
					'connected': false,
					'connect_text': '通讯失败，请检查重试',
					'uncheckable': true
				};
				if(this.customApi.length > 0){
					this.custom_api[0] = this.customApi[0];
					if(this.userGroup > 1){
						if(this.customApi.length == 1){
							this.custom_api[1] = Object.assign({}, api_data);
							this.custom_api[2] = Object.assign({}, api_data);
						}else{
							this.custom_api[1] = this.customApi[1];
							this.custom_api[2] = this.customApi[2];
						}						
					}
				} 
				else{
					this.custom_api[0] = Object.assign({}, api_data);
					if(this.userGroup > 1){
						this.custom_api[1] = Object.assign({}, api_data);
						this.custom_api[2] = Object.assign({}, api_data);
					}
				}
				
				//console.log(this.aiGroup);
				const sortedKeys = Object.keys(this.aiGroup).sort((a, b) => {
					return a.localeCompare(b, undefined, {numeric: true});
				});					
				// 然后按照排序后的键访问对象
				sortedKeys.forEach(i => {
					//console.log(this.aiGroup[i]);
					let model = {};
					if(this.aiGroup[i].url == '') return;
					//console.log(this.aiGroup[i].url);
					for(let j in this.aiGroup[i].models){
						let aiId = this.aiGroup[i].models[j].id;
						//console.log(aiId);
						let ai = {
							'id': this.aiRange[aiId].id,
							'name': this.aiRange[aiId].name,
							'domain': this.aiRange[aiId].domain,
							'parsedUrl': this.aiRange[aiId].parsedUrl,
							'model': this.aiRange[aiId].model,
							'temperature': this.aiRange[aiId].temperature,
							'topP': this.aiRange[aiId].topP,
							'maxTokens': this.aiRange[aiId].maxTokens,
						};
						model[j] = ai;
						//console.log(model);
					}
					
					this.group[i] = {
						'groupName': this.aiGroup[i].groupName,
						'cnName': this.aiGroup[i].cnName,
						'url': this.aiGroup[i].url,
						'models': model
					}
				});
				if(this.userGroup > 1 && this.ai < -1) this.crt_index = this.ai * (-1) - 1;
				//console.log(this.group);
				this.crt_api = this.custom_api[this.crt_index];
				this.$forceUpdate();
			},
			selectItem(item){
				//console.log(this.crt_index);
				if(!this.custom_api[this.crt_index].api_key.trim() 
					|| !this.custom_api[this.crt_index].domain 
					|| !this.custom_api[this.crt_index].model) 
						this.custom_api[this.crt_index].uncheckable = true;
				this.custom_api[this.crt_index].connected = false;
				this.select_id = item.id;
				this.custom_api[this.crt_index].domain = item.domain;
				this.custom_api[this.crt_index].parsed_url = item.parsedUrl;
				this.custom_api[this.crt_index].model = item.model;

				this.$refs.modelList.closeView();
				if(this.custom_api[this.crt_index].api_key.trim() 
					&& this.custom_api[this.crt_index].domain 
					&& this.custom_api[this.crt_index].model) 
						this.custom_api[this.crt_index].uncheckable = false;
			},
			keyChange(){
				if(!this.custom_api[this.crt_index].api_key.trim() 
					|| !this.custom_api[this.crt_index].domain 
					|| !this.custom_api[this.crt_index].model) 
						this.custom_api[this.crt_index].uncheckable = true;
				this.custom_api[this.crt_index].connected = false;
				let _self = this;
				uni.getClipboardData({
					success: function (res) {
						_self.custom_api[_self.crt_index].api_key = res.data;
						if(res.data.trim() 
							&& _self.custom_api[_self.crt_index].domain 
							&& _self.custom_api[_self.crt_index].model) 
								_self.custom_api[_self.crt_index].uncheckable = false;
						_self.$forceUpdate()
					}
				})
			},
			customChange(){
				this.$refs.modelList.openView();
			},
			changeView(index){
				this.crt_index = index;
				if(index > 0 && this.userGroup != 2){
					uni.showToast({
						'title': '开通月卡后可用',
						'icon': 'none'
					})
					setTimeout(() => {
						this.crt_index = 0;
					}, 1)
				}
				this.crt_api = this.custom_api[this.crt_index];
			},
			checkConnect(){
				let data = {
					'domain': this.custom_api[this.crt_index].domain,
					'parsed_url': this.custom_api[this.crt_index].parsed_url,
					'api_key': this.custom_api[this.crt_index].api_key,
					'model': this.custom_api[this.crt_index].model
				}
				let _self = this;
				uni.showLoading();
				request.post("customController/testConnect", 'aiSetting', {
					data: Base64.encode(JSON.stringify(data)),
				}).then(res => {
					if (res.code == 200) {
						_self.custom_api[_self.crt_index].connected = true;
						if(res.result.error){
							if(res.result.error.message) _self.custom_api[_self.crt_index].connect_text = res.result.error.message;
							else _self.custom_api[_self.crt_index].connect_text = '通讯失败，请检查重试';
						}else{
							_self.custom_api[_self.crt_index].connect_text = '通讯成功';
							_self.customApi[_self.crt_index] = data;
							_self.setSettingData({
								customApi: _self.customApi,
							})
						}
						_self.$forceUpdate()
					}else{
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						//console.log(res.msg);
						_self.custom_api[_self.crt_index].connected = true;
						_self.custom_api[_self.crt_index].connect_text = '通讯失败，请检查重试';
					}
				}).catch(e => {
					console.log(e);
				}).finally(() => {
					uni.hideLoading();
				});
			},
			setAI(){
				let _self = this;
				this.setUserData({
					'modalData': {
						content: "要切换到选中的大模型吗？",
						cancelText: "放弃",
						confirmText: "切换",
						success: (res) => {
							if (res.confirm) {
								_self.select_id = -1 - _self.crt_index;
								//console.log(_self.select_id);
								_self.changeAiFun();
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'aiSetting'
				});
			},
			changeAiFun(){
				//console.log(this.select_id, this.custom_api[this.crt_index].model);
				if(this.select_id > -1){
					this.setSettingData({
						'maxToken': this.aiRange[this.select_id].maxTokens,
						'tokenSetting': this.tokenSetting > this.aiRange[this.select_id].maxTokens
							? this.aiRange[this.select_id].maxTokens : this.tokenSetting
					});
				}else if(this.custom_api[this.crt_index].model){//通过model名获取
					for(let i in this.aiRange){
						if(this.custom_api[this.crt_index].model == this.aiRange[i].model){
							this.setSettingData({
								'maxToken': this.aiRange[i].maxTokens,
								'tokenSetting': this.tokenSetting > this.aiRange[i].maxTokens
									? this.aiRange[i].maxTokens : this.tokenSetting
							});
							break;
						}
					}
					//console.log(this.aiRange);
					let self_range = this.aiRange;
					self_range[this.select_id] = {
						'name': this.custom_api[this.crt_index].model,
						'model': this.custom_api[this.crt_index].model,
						'domain': this.custom_api[this.crt_index].domain,
						'parsedUrl': this.custom_api[this.crt_index].parsed_url,
						'maxTokens': this.maxToken,
						'nickName': '自设模型',
						'price': '自行支付',
						'description': '',
						'level': 1,
						'enabled': true
					};
					//console.log(this.aiShowInMenu);
					let ai_show_in_menu = this.aiShowInMenu;
					if(ai_show_in_menu[this.select_id] == undefined) ai_show_in_menu[-1][this.crt_index] = true;
					this.setDiaData({
						'aiRange': self_range,
					});
					this.setSettingData({
						'aiShowInMenu': ai_show_in_menu
					});
				}
				//console.log(this.aiRange);
				aiFun.changeAi(this.select_id, 'aiSetting');
			}
		}
	}
</script>

<style lang="scss">
	.custom-card{
		box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-color-main;
		border: $uni-border-base solid $uni-color-main;
	}
	.custom-select {
		border-radius: $uni-width-none;
		border: $uni-width-none;
		border-bottom: $uni-border-base solid $uni-color-main;
		color: $uni-color-main;
		padding: $uni-width-none $uni-spacing-lg;
		font-size: $uni-font-size-base;
		min-height: calc(8 * $uni-spacing-sm);
		line-height: calc(8 * $uni-spacing-sm);
		word-break: break-all;
		margin-bottom: $uni-spacing-lg;
	}
	.display-line .text-center{
		line-height: calc(1.5 * $uni-font-size-huge);
		align-self: flex-end;
	}
	.model-list{
		z-index: 3;
	}
	.custom-api-part{
		border-top: $uni-border-base solid $uni-border-color;
		padding-bottom: $uni-spacing-lg;
	}
	.custom-api-part:first-of-type{
		border-top: $uni-width-none;
	}
	@media (prefers-color-scheme: dark) {
		.custom-card{
			box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-color-dark-main;
			border: $uni-border-base solid $uni-color-dark-main;
		}
		.custom-select {
			border-bottom-color: $uni-color-dark-main;
			color: $uni-color-dark-main;
		}
		.custom-api-part{
			border-color: $uni-text-color;
		}
	}
</style>