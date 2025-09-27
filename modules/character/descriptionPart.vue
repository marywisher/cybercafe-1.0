<template>
	<cybercafe-view class="character-container" popViewStyle="box-shadow:none;">
		<view class="hint required character-line">* 为必填项</view>
		<view class="flag-tag base-tag">基础信息</view>
		<view class="after-tag display-flex sp-between character-line display-line">
			<view class="display-flex display-line">
				<view><label class="required">*</label>昵称 </view>
				<view class="hint" style="margin-left: 10rpx;">{{character_name.length}} / 16字</view>
			</view>
			<input v-model="character_name" maxlength="16" :styles="dynamicStyle" 
			confirm-type="done" @confirm="autoSave('character_name', character_name)"></input>
			<view>性别</view>
			<picker class="genderPick" @change="genderChange" :value="character_gender" :range="gender">
				<view>{{gender[character_gender]}}</view>
			</picker>
		</view>
		<view class="character-line">
			<view class="display-flex display-line sp-between">
				<view><label class="required">*</label>简介</view>
				<view class="hint">{{short_description.length}} / 100字， 用于角色列表展示</view>
			</view>
			<textarea autoHeight v-model="short_description" maxlength="100" :cursor-spacing="150"
			 :styles="dynamicStyle" placeholder="请输入角色简介" adjust-position  
			 confirm-type="done" @confirm="autoSave('basic', short_description)"></textarea>
		</view>
		<view class="hint character-line" v-html="hint"></view>
		<cybercafe-card cardTitle="补充说明">
			<cybercafe-view v-for="(item, basic_index) in basic_description" :key="basic_index">
				<view class="display-flex sp-between display-line">
					<view>{{basic_index}}</view>
					<view class="hint">{{basic_description[basic_index].length}} 字</view>
					<view class="iconfont icon-jianhao" @tap="reduceDes('basic', basic_index)"></view>
				</view>
				<view>
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="basic_description[basic_index]"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + basic_index" adjust-position
					 ref="basic1" confirm-type="done"
					 @confirm="autoSave('basic', basic_description[basic_index])"></textarea>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line">
					<view><input v-model="basic_key" placeholder="请输入角色补充项" 
						confirm-type="done"  @confirm="toggleTaFun('basic', 'show')"/></view>
					<view v-if="basic_ta_show == false" class="iconfont icon-jiahao" @tap="toggleTaFun('basic', 'show')"></view>
					<view v-else class="iconfont icon-jianhao" @tap="toggleTaFun('basic', 'hide')"></view>
				</view>
				<view v-if="basic_ta_show">
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="basic_value"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + basic_key" adjust-position  
					 confirm-type="done" @confirm="addDes('basic')"></textarea>
				</view>
			</cybercafe-view>
		</cybercafe-card>
		<view class="flag-tag world-tag">世界观</view>
		<view class="character-line after-tag">
			<view class="display-flex display-line sp-between">故事背景
				<view class="hint">{{full_description.length}} 字</view>
			</view>
			<textarea autoHeight v-model="full_description" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="请输入故事介绍" adjust-position 
				 confirm-type="done" @confirm="autoSave('extend', full_description)"></textarea>
		</view>
		<cybercafe-card cardTitle="其它设定">
			<cybercafe-view v-for="(item2, extend_index) in extend_description" :key="extend_index">
				<view class="display-flex sp-between display-line">
					<view>{{extend_index}}</view>
					<view class="hint">{{extend_description[extend_index].length}} 字</view>
					<view class="iconfont icon-jianhao" @tap="reduceDes('extend', extend_index)"></view>
				</view>
				<view>
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="extend_description[extend_index]"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + extend_index" adjust-position
					 ref="extend1" confirm-type="done"
					 @confirm="autoSave('extend', extend_description[extend_index])"></textarea>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line">
					<view><input v-model="extend_key" placeholder="请输入角色限定项" 
						confirm-type="done"  @confirm="toggleTaFun('extend', 'show')" /></view>
					<view v-if="extend_ta_show == false" class="iconfont icon-jiahao" @tap="toggleTaFun('extend', 'show')"></view>
					<view v-else class="iconfont icon-jianhao" @tap="toggleTaFun('extend', 'hide')"></view>
				</view>
				<view v-if="extend_ta_show">
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="extend_value"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + extend_key" adjust-position  
					 confirm-type="done" @confirm="addDes('extend')"></textarea>
				</view>
			</cybercafe-view>
		</cybercafe-card>
		<view class="flag-tag branch-story-tag">副本剧情</view>
		<view class="character-line after-tag"></view>
		<view class="character-line">
			<view class="display-flex display-line sp-between">前情提要 
				<view class="hint">{{character_story.length}} 字</view>
			</view>
			<textarea autoHeight v-model="character_story" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="请输入前情提要" adjust-position 
				 @blur="autoSave('character_story', character_story)"></textarea>
		</view>
		<view class="character-line">
			<view class="display-flex display-line sp-between">开场白 
				<view class="hint">{{character_prologue.length}} 字</view>
			</view>
			<textarea autoHeight v-model="character_prologue" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="请输入开场白" adjust-position 
				 @blur="autoSave('character_prologue', character_prologue)"></textarea>
		</view>
	</cybercafe-view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import common from '@/func/common/common';
	import baseQuery from '@/func/dbManager/baseQuery';
	import request from '@/func/common/request';
	import responseFun from '@/func/entity/responseFun';
	//import relationHandle from '@/func/relation/relationHandle';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'descriptionPart',
		data(){
			return{
				character_id: 0,
				
				character_name: '',
				default_image: configData.defaultImg,
				character_gender: 0,
				gender_cn: '未知',
				gender: ['未知', '男', '女'],
				discription_data: '', //字段数据
				character_story: '',
				character_prologue: '',
				tag: [],
				character_tag: '',
				character_memo: '',
				character_status: 0,
				
				short_description: '',
				full_description: '',
				basic_description: {},
				extend_description: {},
				
				basic_key: '外貌描述',
				extend_key: '',
				basic_value: '',
				extend_value: '',
				basic_ta_show: false,
				extend_ta_show: false,
				
				hint: "请统一使用<label class=\"required\">{{user}}</label>或<label class=\"required\">你</label>指代主控，<label class=\"required\">{{char}}</label>或<label class=\"required\">他/她</label>指代角色"
			}
		},
		computed: {
			...mapState('user', ['darkMode', 'lastTimestampSubmit', 'modalData', 'modalPageId',
				'modalShow', 'powerLevel', 'userKey']),
			dynamicStyle(){
				return this.darkMode == 'light' ? {backgroundColor: '#fff', color: '#333'} : 
					{backgroundColor: '#1f1f1f', color: '#999'};
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			async init(character_id){
				this.character_id = character_id;
				this.getUserData();
				
				let character_data = await baseQuery.getDataByKey('cybercafe_character', {character_id: this.character_id});
				//console.log(character_data);
				//if(!character_data) return;
				this.character_name = character_data[0].character_name;
				this.discription_data = character_data[0].character_description;
				if(!common.isJsonString(this.discription_data)){
					//console.log('旧结构');
					let pos = this.discription_data.indexOf('\\n');
					if(pos == -1){
						pos = this.discription_data.indexOf('\r\n');
					}
					let gender_pos = this.discription_data.substr(0, pos).indexOf('，');
					this.gender_cn = this.discription_data.substr(0, gender_pos);
					switch(this.gender_cn){
						default: 
						this.character_gender = 0;
						break;
						case '男':
						this.character_gender = 1;
						break;
						case '女':
						this.character_gender = 2;
						break;
					}
					
					this.short_description = pos > -1 ? common.textOperation(this.discription_data.substr(gender_pos + 1, pos - 1), '你').text 
						: common.textOperation(this.discription_data, '你').text;
					this.full_description = pos > -1 ? common.textOperation(this.discription_data.substr(pos + 2), '你').text : '';
					this.character_memo = character_data[0].character_memo ? character_data[0].character_memo : '';
					this.character_prologue = character_data[0].character_prologue;
				}else{
					//console.log('新结构');
					this.discription_data = JSON.parse(this.discription_data);
					this.gender_cn = this.discription_data.性别;
					switch(this.gender_cn){
						default: 
						this.character_gender = 0;
						break;
						case '男':
						this.character_gender = 1;
						break;
						case '女':
						this.character_gender = 2;
						break;
					}
					if(this.discription_data.基础信息.hasOwnProperty('简介')) 
						this.short_description = common.textOperation(this.discription_data.基础信息.简介, '你').text;
					if(this.discription_data.扩展信息.hasOwnProperty('故事背景')) 
						this.full_description = common.textOperation(this.discription_data.扩展信息.故事背景, '你').text;
					const {简介, ...basicObj} = this.discription_data.基础信息;
					const {故事背景, ...extendObj} = this.discription_data.扩展信息;
					this.basic_description = basicObj;
					this.extend_description = extendObj;
					if(this.discription_data.hasOwnProperty('副本')){
						if(this.discription_data.副本.hasOwnProperty('前情提要')) this.character_story = this.discription_data.副本.前情提要;
						if(this.discription_data.副本.hasOwnProperty('开场白')) this.character_prologue = this.discription_data.副本.开场白;
					}
					
					//if(basicObj.hasOwnProperty(this.basic_key)) this.basic_key = '';
				}
				let character_image = character_data[0].character_img ? character_data[0].character_img : this.default_image;
				this.$emit('afterLoad', 
					{'image': character_image});//,'key': character_key
			},
			async autoSave(kind, value){
				//检测
				//console.log(kind, value);
				let hint_name = '';
				if(this.character_name.length == 0){
					hint_name = "角色名称";
				}
				if(this.short_description.length == 0){
					hint_name = "简介";
				}
				if(hint_name.length > 0){
					this.setUserData({
						'modalData': {
							title: "温馨提醒",
							content: hint_name + "不能为空",
							cancelText: "OK",
							success: (res) => {},
						},
						'modalShow': true,
						'modalPageId': 'character'
					})
					return;
				}
				
				if(this.character_id){
					let whereArr = {'character_id': this.character_id};
					this.discription_data = {
						'昵称': this.character_name,
						'性别': this.gender_cn,
						'基础信息': {
							'简介': this.short_description,
						},
						'扩展信息': {
							'故事背景': this.full_description,
						},
						'副本': {
							'前情提要': this.character_story,
							'开场白': this.character_prologue
						}
					};
					for(let key in this.basic_description){
						this.discription_data.基础信息[key] = this.basic_description[key];
					}
					for(let key in this.extend_description){
						this.discription_data.扩展信息[key] = this.extend_description[key];
					}
					let updateArr = {
						'character_description': JSON.stringify(this.discription_data)
					};
					if('character_name' == kind){
						updateArr[kind] = value;
					} 
					let response_feedback = await responseFun.toolRequest('sensitive',
						value, 'character');
					if(response_feedback == 200){
						let feedback = await baseQuery.updateDataByKey('cybercafe_character', updateArr, whereArr);
						if(feedback == 'inserted' || feedback == 'updated'){
							//保存
							uni.showToast({
								title: '数据已保存',
								icon: 'none'
							})
						}
					}else if(response_feedback == 302){
						this.setUserData({
							'modalData': {
								title: "温馨提示",
								content: "请修改填写内容再试",
								cancelText: "OK",
							},
							'modalShow': true,
							'modalPageId': 'character'
						})
					}else{
						this.setUserData({
							'modalData': {
								title: "温馨提示",
								content: "请联系管理员修复问题",
								cancelText: "OK",
							},
							'modalShow': true,
							'modalPageId': 'character'
						})
					}
				}
			},
			genderChange(e){
				//console.log(e.detail.value);
				this.character_gender = e.detail.value;
				this.gender_cn = '未知';
				switch(this.character_gender){
					default: 
					this.gender_cn = '未知';
					break;
					case 1:
					this.gender_cn = '男';
					break;
					case 2:
					this.gender_cn = '女';
					break;
				}
				//console.log(this.gender_cn);
				this.autoSave('character_gender', this.gender_cn);
			},
			async addDes(key){
				//console.log(this[key + '_key'], this[key + '_value']);
				this[key + '_key'] = this[key + '_key'].trim();
				this[key + '_value'] = this[key + '_value'].trim();
				if(this[key + '_key'].length > 0 && this[key + '_value'].length > 0){
					this[key + '_description'][this[key + '_key']] = this[key + '_value'];
					this.autoSave(this[key + '_key'], this[key + '_value']);
					this[key + '_ta_show'] = false;
					this[key + '_key'] = '';
					this[key + '_value'] = '';
				}
			},
			reduceDes(key, index){
				//console.log(key, index);
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "温馨提示",
						content: "本项删除后，不可找回",
						cancelText: "再想想",
						confirmText: "坚持删除",
						success: (res) => {
							if (res.confirm) {
								delete _self[key + '_description'][index];
								_self.autoSave(this[index], '');
								_self.$forceUpdate();
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'character'
				})
			},
			toggleTaFun(key, flag){
				//console.log(key, flag)
				if(key == 'basic'){
					this.basic_ta_show = (flag == 'show');
				}else{
					this.extend_ta_show = (flag == 'show');
				}
				this.$forceUpdate();
			}
		}
	}
</script>

<style lang="scss">
	input{
		max-width: 35vw;
	}
	textarea{
		line-height: calc(2 * $uni-font-size-lg);
	}
	.genderPick{
		padding: $uni-spacing-base $uni-spacing-lg;
		border: $uni-border-base solid $uni-border-color;
		border-radius: $uni-border-radius-base;
		color: $uni-text-color;
	}
	.character-container{
		position: relative;
		margin-top: 90vw;
	}
	.character-line{
		margin-bottom: $uni-spacing-lg;
	}
	.flag-tag{
		left: $uni-spacing-lg;
	}
	.icon-jiahao{
		color: $uni-color-main;
	}
	.icon-jianhao{
		color: $uni-color-secondary;
	}
	.inner-ta{
		width: 90%;
	}
	.display-line{
		margin-bottom: $uni-spacing-base;
	}
	@media (prefers-color-scheme: dark) {
		.icon-jiahao{
			color: $uni-color-dark-main;
		}
	}
</style>