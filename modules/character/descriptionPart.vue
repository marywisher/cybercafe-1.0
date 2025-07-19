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
			<view><label class="required">*</label>简介 {{short_description.length}} / 100字</view>
			<view class="hint">用于列表显示，会传AI</view>
			<textarea autoHeight v-model="short_description" maxlength="100" :cursor-spacing="150"
			 :styles="dynamicStyle" placeholder="请输入角色概述" adjust-position  
			 @blur="autoSave('short_description', short_description, '角色概述')"></textarea>
		</view>
		<view class="hint character-line" v-html="hint"></view>
		<cybercafe-card cardTitle="补充说明">
			<cybercafe-view v-for="(item, index) in basic_description" :key="index">
				<view class="display-flex sp-between display-line">
					<view>{{index}}</view>
					<view class="iconfont icon-jianhao" @tap="reduceDes('basic', index)"></view>
				</view>
				<view>
					<textarea class="inner-ta" autoHeight :cursor-spacing="150"
					 :styles="dynamicStyle" :placeholder="'请输入角色' + index" adjust-position  
					 @blur="autoSave('basic_description' + index, basic_description[index], '角色' + index)"></textarea>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line">
					<view><input v-model="basic_key" @input="addDes('basic')" /></view>
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
			<view>剧情背景 {{full_description.length}} / 2000字</view>
			<view class="hint">不用重复简介，会传AI</view>
			<textarea autoHeight v-model="full_description" maxlength="2000" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="请输入故事介绍" adjust-position 
				 @blur="autoSave('full_description', full_description, '剧情背景')"></textarea>
		</view>
		<cybercafe-card cardTitle="其它设定">
			<view class="character-line">
				<view>角色限制 {{full_description.length}} / 2000字</view>
				<view class="hint">会传AI</view>
				<textarea class="inner-ta" autoHeight maxlength="2000" :cursor-spacing="150"
					 :styles="dynamicStyle" placeholder="请输入角色的行为习惯限制、口头禅" adjust-position 
					 @blur="autoSave('full_description', full_description, '角色限制')"></textarea>
			</view>
		</cybercafe-card>
		<view class="character-flag-tag branch-story-tag">副本剧情</view>
		<view class="character-line after-tag"></view>
		<view class="character-line">
			<view>开场白 {{character_prologue.length}} / 500字</view>
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
				gender: ['未知', '男', '女'],
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
				
				submit_mode: false,
				online: false,
				
				edit_flag: false,//编辑后退出提醒
				
				position: {
					x: 0,
					y: 0
				},
				show_menu: false,
				upload_process: [{title:'语义检测',desc:'未完成'}, {title:'标签提取',desc:'未完成'},
					{title:'内容上传',desc:'未完成'},{title:'图片上传',desc:'未完成'},{title:'完成提交',desc:''}],
				active: 0,
				show_btn: false,
				
				
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
				//console.log(character_data);
				//if(!character_data) return;
				this.character_name = character_data[0].character_name;
				let description = character_data[0].character_description;
				if(!common.isJsonString(description)){
					let pos = description.indexOf('\\n');
					if(pos == -1){
						pos = description.indexOf('\r\n');
					}
					let gender_pos = description.substr(0, pos).indexOf('，');
					let gender_str = description.substr(0, gender_pos);
					switch(gender_str){
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
					
					this.short_description = pos > -1 ? common.textOperation(description.substr(gender_pos + 1, pos - 1), '你').text 
						: common.textOperation(description, '你').text;
					this.full_description = pos > -1 ? common.textOperation(description.substr(pos + 2), '你').text : '';
					this.character_memo = character_data[0].character_memo ? character_data[0].character_memo : '';
				}else{
					this.short_description = common.textOperation(description.basic['简介'], '你').text;
					this.full_description = common.textOperation(description.extend['故事背景'], '你').text;
					const {简介, ...newObj} = description.basic;
					const {故事背景, ...newObj1} = description.extend;
					this.basic_description = newObj;
					this.extend_description = newObj1;
				}
				this.character_prologue = character_data[0].character_prologue;
				this.character_image = character_data[0].character_img ? character_data[0].character_img : this.default_image;
				
				this.$emit('afterLoad', 
					{'image': this.character_image,
					'key': this.character_key});
			},
			autoSave(key, value, cn){
				//检测
				//保存
				uni.showToast({
					title: cn + '已保存',
					icon: 'none'
				})
			},
			genderChange(e){
				this.character_gender = e.detail.value;
			},
			addDes(key){
				
			},
			reduceDes(key, index){
				console.log(key, index);
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
		max-width: 30vw;
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
	.character-line{
		margin-bottom: $uni-spacing-lg;
	}
	.character-container{
		position: relative;
		margin-top: 90vw;
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
	
	
	.submit-pop {
		position: absolute;
		background-color: white;
		border: 1px solid #ccc;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		font-size: 14px;
		border-radius: 10rpx;
		padding: 10rpx
	}
	.submit-btn{
		padding: 10rpx;
	}
	.upload-pop{
		/*background-color: white;*/
		box-shadow: none;
	}
	.uni-steps__column-title {
		font-size: 16px !important;
		line-height: 30px !important;
	}
	.uni-steps__column-desc{
		font-size: 14px !important;
		line-height: 30px !important;
	}
	.uni-steps__column-line-item{
		height: 76px;
	}
	.tags{
		margin: 20rpx 0;
		flex-wrap: wrap;
	}
	.pop-btn{
		position: absolute;
		right: 20px;
		bottom: 20px;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
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
		.submit-pop, .upload-pop {
			background-color: #1f1f1f;
		}
		.icon-jiahao{
			color: $uni-color-dark-main;
		}
	}
</style>