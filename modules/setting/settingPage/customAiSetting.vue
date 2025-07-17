<template>
	<view>
		<cybercafe-card cardTitle="自设模型" :class="{'custom-card': ai == -1}">
			<view v-if="model == ''" class="display-flex sp-between display-line">
				<view class="ai-setting-label">api 参数</view>
				<view class="ai-setting-right">
					<view class="display-flex ai-setting-btn">
						<cybercafe-button btnClass="btn-primary"
							btnName="点击设置" @btnClick="customChange"></cybercafe-button>
					</view>
				</view>
			</view>
			<view v-else>
				<view class="display-flex sp-between display-line">
					<view class="ai-setting-label">api url</view>
					<view class="ai-setting-right">
						<view class="custom-select" @tap="customChange">{{domain}}</view>
						<view class="custom-select" @tap="customChange">{{parsed_url}}</view>
					</view>
				</view>
				<view class="display-flex sp-between display-line">
					<view class="ai-setting-label">api model</view>
					<view class="ai-setting-right">
						<view class="custom-select" @tap="customChange">{{model}}</view>
					</view>
				</view>
			</view>
			<view class="display-flex sp-between display-line">
				<view class="ai-setting-label">api_key</view>
				<view class="ai-setting-right">
					<view v-show="api_key != ''" class="custom-select" @tap="keyChange">{{api_key}}</view>
					<view v-show="api_key == ''" class="display-flex ai-setting-btn">
						<cybercafe-button btnClass="btn-primary"
							btnName="黏贴密钥" @btnClick="keyChange"></cybercafe-button>
					</view>
				</view>
			</view>
			<view class="display-flex sp-between display-line">
				<view class="display-flex ai-setting-btn">
					<cybercafe-button btnClass="btn-default" :btnDisable="!connected || ai == -1" 
						btnName="设为默认模型"  @btnClick="setAI"></cybercafe-button>
				</view>
				<view v-if="connected" class="hint required text-center">{{connect_text}}</view>
				<view class="display-flex ai-setting-btn">
					<cybercafe-button btnClass="btn-primary" :btnDisable="connected || uncheckable" 
						btnName="测试通讯"  @btnClick="checkConnect"></cybercafe-button>
				</view>
			</view>
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
				api_key: '',
				uncheckable: true,
				domain: '',
				parsed_url: '',
				model: '',
				group: {},
				select_id: -1,
				connected: false,
				connect_text: '通讯失败，请检查重试'
			}
		},
		computed:{
			...mapState('dialogue', ['ai', 'aiGroup', 'aiRange', 'aiShowInMenu']),
			...mapState('setting', ['customApiKey', 'customDomain',	'customModel', 'customParsedUrl',
				'maxToken', 'temperature', 'tokenSetting', 'topP']),
		},
		methods:{
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			init(){
				this.domain = this.customDomain;
				this.parsed_url = this.customParsedUrl;
				this.model = this.customModel;
				this.api_key = this.customApiKey;
				if(this.api_key) this.connected = true;
				
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
				//console.log(this.group);
				this.$forceUpdate();
			},
			selectItem(item){
				if(!this.api_key.trim() || !this.domain.trim() || !this.model.trim()) this.uncheckable = true;
				this.connected = false;
				this.select_id = item.id;
				this.domain = item.domain;
				this.parsed_url = item.parsedUrl;
				this.model = item.model;
				/* this.setSettingData({
					'temperature': item.temperature,
					'topP': item.topP, 
					'maxToken': item.maxTokens,
					'tokenSetting': this.tokenSetting > item.maxTokens ? item.maxTokens : this.tokenSetting
				}) */
				this.$refs.modelList.closeView();
				if(this.api_key.trim() && this.domain.trim() && this.model.trim()) this.uncheckable = false;
			},
			keyChange(){
				if(!this.api_key.trim() || !this.domain.trim() || !this.model.trim()) this.uncheckable = true;
				this.connected = false;
				let _self = this;
				uni.getClipboardData({
					success: function (res) {
						_self.api_key = res.data;
						if(res.data.trim() && _self.domain.trim() && _self.model.trim()) _self.uncheckable = false;
					}
				})
			},
			customChange(){
				this.$refs.modelList.openView();
			},
			checkConnect(){
				let data = {
					'domain': this.domain,
					'parsed_url': this.parsed_url,
					'api_key': this.api_key,
					'model': this.model
				}
				let _self = this;
				uni.showLoading();
				request.post("customController/testConnect", {
					data: Base64.encode(JSON.stringify(data)),
				}).then(res => {
					if (res.code == 200) {
						_self.connected = true;
						if(res.result.error){
							if(res.result.error.message) _self.connect_text = res.result.error.message;
							else _self.connect_text = '通讯失败，请检查重试';
						}else{
							_self.connect_text = '通讯成功';
							_self.setSettingData({
								customApiKey: _self.api_key,
								customDomain: _self.domain,
								customModel: _self.model,
								customParsedUrl: _self.parsed_url,
							})
						}
					}else{
						/* uni.showToast({
							title: res.msg,
							icon: 'none'
						}) */
						console.log(res.msg);
						_self.connected = true;
						_self.connect_text = '通讯失败，请检查重试';
					}
				}).catch(e => {
					console.log(e);
				}).finally(() => {
					uni.hideLoading();
				});
			},
			setAI(){
				if(this.select_id != -1){
					this.setSettingData({
						'maxToken': this.aiRange[this.select_id].maxTokens,
						'tokenSetting': this.tokenSetting > this.aiRange[this.select_id].maxTokens
							? this.aiRange[this.select_id].maxTokens : this.tokenSetting
					});
				}else if(this.model){//通过model名获取
					for(let i in this.aiRange){
						if(this.model == this.aiRange[i].model){
							this.setSettingData({
								'maxToken': this.aiRange[i].maxTokens,
								'tokenSetting': this.tokenSetting > this.aiRange[i].maxTokens
									? this.aiRange[i].maxTokens : this.tokenSetting
							});
							break;
						}
					}
					let self_range = this.aiRange;
					self_range[-1] = {
						'name': this.customModel,
						'model': this.customModel,
						'domain': this.customDomain,
						'parsedUrl': this.customParsedUrl,
						'maxTokens': this.maxToken
					};
					let ai_show_in_menu = this.aiShowInMenu;
					if(ai_show_in_menu[-1] == undefined) ai_show_in_menu[-1] = true;
					this.setSettingData({
						'aiRange': self_range,
						'aiShowInMenu': ai_show_in_menu
					});
				}
				this.setDiaData({
					'ai': -1
				})
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
	@media (prefers-color-scheme: dark) {
		.custom-card{
			box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-color-dark-main;
			border: $uni-border-base solid $uni-color-dark-main;
		}
		.custom-select {
			border-bottom-color: $uni-color-dark-main;
			color: $uni-color-dark-main;
		}
	}
</style>