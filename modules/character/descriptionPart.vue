<template>
	<cybercafe-view class="character-container" popViewStyle="box-shadow:none;">
		<view class="hint required character-line">* 为必填项</view>
		<view class="character-flag-tag base-tag">基础信息</view>
		<view class="after-tag display-flex sp-between character-line display-line">
			<view><label class="required">*</label>昵称 {{character_name.length}} / 16字</view>
			<input v-model="character_name" maxlength="16" :styles="dynamicStyle" 
			@blur="autoSave('character_name', character_name, '昵称')"></input>
			<view>性别</view>
			<picker class="genderPick" @change="genderChange" :value="character_gender" :range="gender">
				<view>{{gender[character_gender]}}</view>
			</picker>
		</view>
		<view class="character-line">
			<view><label class="required">*</label>简介  / 100字</view>
			<view class="hint">用于角色列表展示</view>
			<textarea autoHeight v-model="short_description" maxlength="100" :cursor-spacing="150"
			 :styles="dynamicStyle" placeholder="请输入角色简介" adjust-position  
			 @blur="autoSave('basic', short_description, '简介')"></textarea>
		</view>
		<view class="hint character-line" v-html="hint"></view>
		<cybercafe-card cardTitle="补充说明">
			<cybercafe-view v-for="(item, index) in basic_description" :key="index">
				<view class="display-flex sp-between display-line">
					<view>{{index}}</view>
					<view class="iconfont icon-jianhao" @tap="reduceDes('basic', index)"></view>
				</view>
				<view>
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="basic_description[index]"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + index" adjust-position  
					 @blur="autoSave('basic', basic_description[index], index)"></textarea>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line">
					<view><input v-model="basic_key" placeholder="请输入角色补充项" /></view>
					<view v-if="basic_ta_show == false" class="iconfont icon-jiahao" @tap="toggleTaFun('basic', 'show')"></view>
					<view v-else class="iconfont icon-jianhao" @tap="toggleTaFun('basic', 'hide')"></view>
				</view>
				<view v-if="basic_ta_show">
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="basic_value"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + basic_key" adjust-position  @input="addDes('basic')"></textarea>
				</view>
			</cybercafe-view>
		</cybercafe-card>
		<view class="character-flag-tag world-tag">世界观</view>
		<view class="character-line after-tag">
			<view>故事背景  / 2000字</view>
			<textarea autoHeight v-model="full_description" maxlength="2000" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="请输入故事介绍" adjust-position 
				 @blur="autoSave('extend', full_description, '故事背景')"></textarea>
		</view>
		<cybercafe-card cardTitle="其它设定">
			<cybercafe-view v-for="(item, index) in extend_description" :key="index">
				<view>角色限制  / 2000字</view>
				<view class="display-flex sp-between display-line">
					<view>{{index}}</view>
					<view class="iconfont icon-jianhao" @tap="reduceDes('extend', index)"></view>
				</view>
				<view>
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="extend_description[index]"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + index" adjust-position  
					 @blur="autoSave('extend', extend_description[index], index)"></textarea>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line">
					<view><input v-model="extend_key" placeholder="请输入角色限制项" /></view>
					<view v-if="extend_ta_show == false" class="iconfont icon-jiahao" @tap="toggleTaFun('extend', 'show')"></view>
					<view v-else class="iconfont icon-jianhao" @tap="toggleTaFun('extend', 'hide')"></view>
				</view>
				<view v-if="extend_ta_show">
					<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="extend_value"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + extend_key" adjust-position  @input="addDes('extend')"></textarea>
				</view>
			</cybercafe-view>
		</cybercafe-card>
		<view class="character-flag-tag branch-story-tag">副本剧情</view>
		<view class="character-line after-tag"></view>
		<view class="character-line">
			<view>开场白  / 500字</view>
			<textarea autoHeight v-model="character_prologue" maxlength="500" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="开场白" adjust-position 
				 @blur="autoSave('character_prologue', character_prologue, '开场白')"></textarea>
		</view>
	</cybercafe-view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import common from '@/func/common/common';
	import baseQuery from '@/func/dbManager/baseQuery';
	
	import request from '@/func/common/request';
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
				character_image: configData.avatarImg,
				character_id: 0,
				character_key: '',//由character转过来不改，仅于线上提交后更新
				
				character_name: '',
				default_image: configData.defaultImg,
				character_gender: 0,
				gender_cn: '未知',
				gender: ['未知', '男', '女'],
				discription_data: '', //字段数据
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
			...mapState('user', ['darkMode', 'lastTimestampSubmit', 'modalData', 'modalShow',
				'powerLevel', 'userKey']),
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
				console.log(character_data);
				//if(!character_data) return;
				this.character_name = character_data[0].character_name;
				this.discription_data = character_data[0].character_description;
				if(!common.isJsonString(this.discription_data)){
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
					this.short_description = common.textOperation(this.discription_data.基础信息.简介, '你').text;
					this.full_description = common.textOperation(this.discription_data.扩展信息.故事背景, '你').text;
					const {简介, ...basicObj} = this.discription_data.基础信息;
					const {故事背景, ...extendObj} = this.discription_data.扩展信息;
					this.basic_description = basicObj;
					this.extend_description = extendObj;
					this.character_prologue = this.discription_data.开场白;
				}
				
				this.character_image = character_data[0].character_img ? character_data[0].character_img : this.default_image;
				
				this.$emit('afterLoad', 
					{'image': this.character_image,
					'key': this.character_key});
			},
			async autoSave(kind, value, cn){
				//检测
				console.log(kind, value, cn);
				if(this.character_id){
					let whereArr = {'character_id': this.character_id};
					if(typeof this.discription_data === 'object'){//处理后才能保存
						if(['昵称', '性别', '开场白'].includes(cn)) this.discription_data[cn] = value;
						else if(kind == 'basic') this.discription_data.基础信息[cn] = value;
						else this.discription_data.扩展信息[cn] = value;
					}else{
						this.discription_data = {
							'昵称': this.character_name,
							'性别': this.gender_cn,
							'基础信息': {
								'简介': this.short_description,
							},
							'扩展信息': {
								'故事背景': this.full_description,
							},
							'开场白': this.character_prologue
						};
						for(let key in this.basic_description){
							this.discription_data.基础信息[key] = this.basic_description[key];
						}
						for(let key in this.extend_description){
							this.discription_data.扩展信息[key] = this.extend_description[key];
						}
					}
					let updateArr = {
						'character_description': JSON.stringify(this.discription_data)
					};
					if('character_name' == kind) updateArr[kind] = value;
					let feedback = await baseQuery.updateDataByKey('cybercafe_character', updateArr, whereArr);
					if(feedback == 'inserted' || feedback == 'updated'){
						//保存
						uni.showToast({
							title: cn + '已保存',
							icon: 'none'
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
				console.log(this.gender_cn);
				this.autoSave('character_gender', this.gender_cn, '性别');
			},
			addDes(key){
				console.log(this[key + '_key'], this[key + '_value']);
				if(this[key + '_key'].trim().length > 0 && this[key + '_value'].trim().length > 0){
					this[key + '_description'][this[key + '_key'].trim()] = this[key + '_value'].trim();
					this[key + '_ta_show'] = false;
					this[key + '_key'] = '';
					this[key + '_value'] = '';
				}
			},
			reduceDes(key, index){
				console.log(key, index);
				//提示删除项，删除后一并从数据库中删除
			},
			toggleTaFun(key, flag){
				console.log(key, flag)
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
	.character-flag-tag{
		position: absolute;
		background-color: $uni-color-main;
		color: $uni-bg-color-grey;
		font-size: $uni-font-size-sm;
		left: $uni-spacing-lg;
		padding: $uni-spacing-base $uni-spacing-base $uni-spacing-base $uni-spacing-lg;
		line-height: $uni-font-size-sm;
	}
	/* .world-tag{
		top: 0;
		right: 30vw;
		padding: $uni-spacing-lg calc(1.2 * $uni-spacing-base) $uni-spacing-base;
		writing-mode: vertical-rl;
		width: calc(3.2 * $uni-spacing-base);
	} */
	.character-flag-tag:after{
		position: absolute;
		content: "";
		width: 0;
		height: 0;
		top: 0;
		right: calc(-1 * $uni-spacing-lg);
		border-top: calc(1.1 * $uni-spacing-lg) solid $uni-color-main;
		border-bottom: calc(1.1 * $uni-spacing-lg) solid $uni-color-main;
		border-right: $uni-spacing-lg solid transparent;
	}
	/* .world-tag:after{
		left: 0;
		bottom: calc(-1 * $uni-spacing-lg);
		border-left: calc(1.4 * $uni-spacing-lg) solid $uni-color-main;
		border-right: calc(1.4 * $uni-spacing-lg) solid $uni-color-main;
		border-bottom: $uni-spacing-lg solid transparent;
	}
	.branch-story-tag{
		left: $uni-spacing-lg;
		padding: calc(1.2 * $uni-spacing-base) $uni-spacing-base calc(1.2 * $uni-spacing-base) $uni-spacing-lg;
	}
	.branch-story-tag:after{
		top: 0;
		right: calc(-1 * $uni-spacing-lg);
		border-top: calc(1.4 * $uni-spacing-lg) solid $uni-color-main;
		border-bottom: calc(1.4 * $uni-spacing-lg) solid $uni-color-main;
		border-right: $uni-spacing-lg solid transparent;
	} */
	.after-tag{
		margin-top: calc(5 * $uni-spacing-lg);
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
		clear: both;
		margin-bottom: $uni-spacing-base;
	}
	@media (prefers-color-scheme: dark) {
		.icon-jiahao{
			color: $uni-color-dark-main;
		}
	}
</style>