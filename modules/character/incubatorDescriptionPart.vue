<template>
	<view>
		<cybercafe-view class="character-container" popViewStyle="box-shadow:none;">
			<view class="hint required character-line">* 为必填项</view>
			<view class="flag-tag base-tag">基础信息</view>
			<view class="after-tag display-flex sp-between character-line display-line">
				<view class="display-flex display-line">
					<view><label class="required">*</label>昵称 </view>
					<view class="hint" style="margin-left: 10rpx;">{{character_name.length}} / 16字</view>
				</view>
				<input v-model="character_name" :maxlength="16" class="bg-color" 
				confirm-type="done" @confirm="autoSave('character_name', character_name)"
				@blur="autoSave('character_name', character_name)"></input>
				<view>性别</view>
				<view @tap="showGenderView">
					<view v-if="character_gender == 1" class="iconfont icon-xingbienan"></view>
					<view v-if="character_gender == 2" class="iconfont icon-xingbienv"></view>
					<view v-if="character_gender == 0" class="iconfont icon-wuxingbie"></view>
				</view>
			</view>
			<view v-show="show_gender">
				<cybercafe-view class="gender-view">
					<view class="display-flex display-line sp-between gender-pick">
						<view class="iconfont icon-xingbienan" @tap="genderChange(1)"></view>
						<view class="gender-border"></view>
						<view class="iconfont icon-xingbienv" @tap="genderChange(2)"></view>
						<view class="gender-border"></view>
						<view class="iconfont icon-wuxingbie" @tap="genderChange(0)"></view>
					</view>
				</cybercafe-view>
			</view>
			<view class="character-line">
				<view class="display-flex display-line sp-between">
					<view><label class="required">*</label>简介</view>
					<view class="hint">{{short_description.length}} / 100字， 用于角色列表展示</view>
				</view>
				<textarea autoHeight v-model="short_description" :maxlength="100" :cursor-spacing="150"
				 class="bg-color" placeholder="请输入角色简介" adjust-position
				 :placeholder-style="placeholderStyle" confirm-hold
				 @blur="autoSave('basic', short_description)"></textarea>
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
						<textarea class="inner-ta bg-color" autoHeight :cursor-spacing="150" 
						 v-model="basic_description[basic_index]" :maxlength="-1"
						 :placeholder="'请输入角色' + basic_index" adjust-position
						 ref="basic1" :placeholder-style="placeholderStyle" confirm-hold
						 @blur="autoSave('basic', basic_description[basic_index])"></textarea>
					</view>
				</cybercafe-view>
				<cybercafe-view>
					<view class="display-flex sp-between display-line">
						<view><input v-model="basic_key" placeholder="请输入角色补充项" class="bg-color item-key" 
							:placeholder-style="placeholderStyle"
							confirm-type="done"  @confirm="toggleTaFun('basic', 'show')"/></view>
						<view v-if="basic_ta_show == false" class="iconfont icon-jiahao" @tap="toggleTaFun('basic', 'show')"></view>
						<view v-else class="iconfont icon-jianhao" @tap="toggleTaFun('basic', 'hide')"></view>
					</view>
					<view v-if="basic_ta_show">
						<textarea class="inner-ta bg-color" autoHeight :cursor-spacing="150" v-model="basic_value"
						 :placeholder="'请输入角色' + basic_key" adjust-position :maxlength="-1" 
						 :placeholder-style="placeholderStyle" confirm-hold
						 @blur="addDes('basic')"></textarea>
					</view>
				</cybercafe-view>
			</cybercafe-card>
			<view class="flag-tag world-tag">世界观</view>
			<view class="character-line after-tag">
				<view class="display-flex display-line sp-between">故事背景
					<view class="hint">{{full_description.length}} 字</view>
				</view>
				<textarea autoHeight v-model="full_description" :cursor-spacing="150" :maxlength="-1"
					 class="bg-color" placeholder="请输入故事介绍" adjust-position 
					 :placeholder-style="placeholderStyle" confirm-hold
					 @blur="autoSave('extend', full_description)"></textarea>
			</view>
			<cybercafe-card cardTitle="其它设定">
				<cybercafe-view v-for="(item2, extend_index) in extend_description" :key="extend_index">
					<view class="display-flex sp-between display-line">
						<view>{{extend_index}}</view>
						<view class="hint">{{extend_description[extend_index].length}} 字</view>
						<view class="iconfont icon-jianhao" @tap="reduceDes('extend', extend_index)"></view>
					</view>
					<view>
						<textarea class="inner-ta bg-color" autoHeight :cursor-spacing="150" 
						 v-model="extend_description[extend_index]" :maxlength="-1"
						 :placeholder="'请输入角色' + extend_index" adjust-position
						 ref="extend1" :placeholder-style="placeholderStyle" confirm-hold
						 @blur="autoSave('extend', extend_description[extend_index])"></textarea>
					</view>
				</cybercafe-view>
				<cybercafe-view>
					<view class="display-flex sp-between display-line">
						<view><input v-model="extend_key" placeholder="请输入角色限定项" class="bg-color item-key"  
							:placeholder-style="placeholderStyle"
							confirm-type="done"  @confirm="toggleTaFun('extend', 'show')" /></view>
						<view v-if="extend_ta_show == false" class="iconfont icon-jiahao" @tap="toggleTaFun('extend', 'show')"></view>
						<view v-else class="iconfont icon-jianhao" @tap="toggleTaFun('extend', 'hide')"></view>
					</view>
					<view v-if="extend_ta_show">
						<textarea class="inner-ta bg-color" autoHeight :cursor-spacing="150" v-model="extend_value"
						 :placeholder="'请输入角色' + extend_key" adjust-position :maxlength="-1"
						 :placeholder-style="placeholderStyle" confirm-hold
						 @blur="addDes('extend')"></textarea>
					</view>
				</cybercafe-view>
			</cybercafe-card>
			<view class="flag-tag branch-story-tag">副本剧情</view>
			<view class="character-line after-tag"></view>
			<view class="character-line">
				<view class="display-flex display-line sp-between">前情提要 
					<view class="hint">{{character_story.length}} 字</view>
				</view>
				<textarea autoHeight v-model="character_story" :cursor-spacing="150" :maxlength="-1"
					 class="bg-color" placeholder="请输入前情提要" adjust-position 
					 :placeholder-style="placeholderStyle"
					 @blur="autoSave('character_story', character_story)"></textarea>
			</view>
			<view class="character-line">
				<view class="display-flex display-line sp-between">开场白 
					<view class="hint">{{character_prologue.length}} 字</view>
				</view>
				<textarea autoHeight v-model="character_prologue" :cursor-spacing="150" :maxlength="-1"
					 class="bg-color" placeholder="请输入开场白" adjust-position 
					 :placeholder-style="placeholderStyle"
					 @blur="autoSave('character_prologue', character_prologue)"></textarea>
			</view>
			<view class="flag-tag branch-memo-tag">其它内容</view>
			<view class="character-line after-tag"></view>
			<view class="character-line">
				<view class="display-flex display-line sp-between">碎碎念（不发送给AI）</view>
				<textarea autoHeight v-model="character_memo" :cursor-spacing="150" :maxlength="-1"
					 class="bg-color" placeholder="请输入题外话" adjust-position 
					 :placeholder-style="placeholderStyle"
					 @blur="autoSave('character_memo', character_memo)"></textarea>
			</view>
		</cybercafe-view>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import baseQuery from '@/func/dbManager/baseQuery';
	import incubatorFun from '@/func/character/incubatorFun';
	import responseFun from '@/func/entity/responseFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'incubatorDescriptionPart',
		data(){
			return{
				incubator_id: 0,
				character_name: '',
				default_image: configData.avatarImg,
				character_gender: 0,
				gender_cn: '未知',
				description_data: '', //字段数据
				character_story: '',
				character_prologue: '',
				character_memo: '',
				
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
				
				hint: "请统一使用<label class=\"required\">{{user}}</label>或<label class=\"required\">你</label>指代主控，<label class=\"required\">{{char}}</label>或<label class=\"required\">他/她</label>指代角色",
				show_gender: false,
				
				character_status: 0,
			}
		},
		computed: {
			...mapState('user', ['lastTimestampSubmit', 'modalData', 'modalPageId', 'modalShow', 
				'powerLevel', 'userKey']),
			...mapState('setting', ['darkMode', 'userId']),
			dynamicStyle(){
				return this.darkMode == 'light' ? {backgroundColor: '#fff', color: '#333'} : 
					{backgroundColor: '#1f1f1f', color: '#999'};
			},
			placeholderStyle(){
				return this.darkMode == 'light' ? 'color: #c0c0c0;' : 'color: #808080;';
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			async init(incubator_id){
				this.incubator_id = incubator_id;
				let character_data = await baseQuery.getDataByKey('cybercafe_incubator', {
					'incubator_id': this.incubator_id
				});
				this.getIncubatorData(character_data);
			},
			getIncubatorData(character_data){
				let return_data = incubatorFun.parseData(character_data[0]);
				this.character_name = return_data.character_name;
				this.description_data = return_data.character_description;
				this.character_gender = return_data.character_gender;
				this.gender_cn = return_data.gender_cn;
				this.short_description = return_data.short_description;
				this.full_description = return_data.full_description;
				this.character_story = return_data.character_story;
				this.character_prologue = return_data.character_prologue;
				this.character_memo = return_data.character_memo;
				if(return_data.hasOwnProperty('basic_description')){
					this.basic_description = return_data.basic_description;
					this.basic_key = '';
				}
				if(return_data.hasOwnProperty('extend_description')) 
					this.extend_description = return_data.extend_description;
				
				let character_image = character_data[0].character_img ? character_data[0].character_img : this.default_image;
				this.$emit('afterLoad', 
					{'image': character_image});//,'key': character_key
				
				if(this.character_tag.length > 0){
					//this.upload_process[1].desc = this.character_tag;
					this.tag = this.character_tag.split('|');
				}
				this.character_status = character_data[0].character_status;
				
				this.requireSet('init');
			},
			async autoSave(kind, value){
				//检测
				//console.log(kind, value);
				let hint_name = '';
				if(this.character_name.trim().length == 0){
					hint_name = "角色名称";
				}
				if(this.short_description.trim().length == 0){
					hint_name = "简介";
				}
				if(hint_name.length > 0){
					this.setUserData({
						'modalData': {
							title: "温馨提醒",
							content: hint_name + "不能为空",
							confirmText: '',
							cancelText: "OK",
							success: (res) => {},
						},
						'modalShow': true,
						'modalPageId': 'incubator'
					})
					return;
				}
				
				if(this.incubator_id){
					let whereArr = {'incubator_id': this.incubator_id};
					this.description_data = {
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
						},
						'其它': this.character_memo,
					};
					for(let key in this.basic_description){
						this.description_data.基础信息[key] = this.basic_description[key];
					}
					for(let key in this.extend_description){
						this.description_data.扩展信息[key] = this.extend_description[key];
					}
					let updateArr = {
						'character_description': JSON.stringify(this.description_data)
					};
					if('character_name' == kind){
						updateArr[kind] = value.trim();
					} 
					let response_feedback = await responseFun.toolRequest('sensitive',
						value, 'incubator');
					if(response_feedback == 200){
						let feedback = await baseQuery.updateDataByKey('cybercafe_incubator', updateArr, whereArr);
						if(feedback == 'inserted' || feedback == 'updated'){
							//保存
							uni.showToast({
								title: '数据已保存',
								icon: 'none'
							})
						}
					}else{
						this.setUserData({
							'modalData': {
								title: "温馨提示",
								content: response_feedback,
								confirmText: '',
								cancelText: "OK",
							},
							'modalShow': true,
							'modalPageId': 'incubator'
						})
					}
				}
			},
			showGenderView(){
				this.show_gender = !this.show_gender; 
			},
			genderChange(gender){
				//console.log(e.detail.value);
				this.character_gender = gender;
				this.gender_cn = characterFun.getGenderCn(gender);
				//console.log(this.gender_cn);
				this.autoSave('character_gender', this.gender_cn);
				this.show_gender = false;
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
					'modalPageId': 'incubator'
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
			},
		},
	}
</script>

<style lang="scss">
	input{
		width: 30vw;
	}
	textarea{
		line-height: $uni-font-size-huge;
		margin: 0 auto;
		width: 93%;
	}
	input.item-key{
		width: 50vw;
	}
	.bg-color{
		background-color: $uni-bg-color;
		color: $uni-text-color;
	}
	.gender-pick .iconfont{
		font-size: $uni-font-size-huge;
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
	.gender-view{
		width: 40vw;
		float: right;
	}
	.gender-border{
		width: $uni-border-base;
		height: calc(2 * $uni-spacing-lg);
		background-color: $uni-border-color;
	}
	@media (prefers-color-scheme: dark) {
		.bg-color{
			background-color: $uni-bg-dark-color-gray;
			color: $uni-text-color-grey;
		}
		.icon-jiahao{
			color: $uni-color-dark-main;
		}
		.gender-pick{
			color: $uni-text-color-grey;
		}
		.gender-border{
			background-color: $uni-text-color;
		}
	}
</style>