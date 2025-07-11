<template>
	<view>
		<view class="character-bg" :style="dynamicImg"></view>
		<view class="view-for-tap" @tap="showMoreImg"></view>
		
		<cybercafe-view class="character-container" popViewStyle="box-shadow:none;">
			<view class="hint required character-line">* 为必填项</view>
			<view class="character-flag-tag base-tag">基础信息</view>
			<view class="after-tag display-flex sp-between character-line">
				<view><label class="required">*</label>昵称 {{character_name.length}} / 16字</view>
				<input v-model="character_name" maxlength="16" :styles="dynamicStyle" @blur="requireSet"></input>
				<view>性别</view>
				<picker class="genderPick" @change="genderChange" :value="character_gender" :range="gender">
					<view>{{gender[character_gender]}}</view>
				</picker>
			</view>
			<view class="character-line">
				<view><label class="required">*</label>简介 {{short_description.length}} / 100字</view>
				<view class="hint">用于列表显示，会传AI</view>
				<textarea autoHeight v-model="short_description" maxlength="100" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="请输入人物概述" adjust-position  @blur="requireSet"></textarea>
			</view>
			<view class="hint character-line" v-html="hint"></view>
			<view class="character-flag-tag world-tag">世界观</view>
			<view class="character-line after-tag">
				<view>剧情背景 {{full_description.length}} / 2000字</view>
				<view class="hint">不用重复简介，会传AI</view>
				<textarea autoHeight v-model="full_description" maxlength="2000" :cursor-spacing="150"
					 :styles="dynamicStyle" placeholder="请输入故事介绍" adjust-position @blur="requireSet"></textarea>
			</view>
			<view class="character-line">
				<view>角色限制 {{full_description.length}} / 2000字</view>
				<view class="hint">会传AI</view>
				<textarea autoHeight v-model="full_description" maxlength="2000" :cursor-spacing="150"
					 :styles="dynamicStyle" placeholder="请输入角色的行为习惯限制、口头禅" adjust-position @blur="requireSet"></textarea>
			</view>
			<view class="character-flag-tag branch-story-tag">副本剧情</view>
			<view class="character-line after-tag"></view>
			<view class="character-line">
				<view>开场白 {{character_prologue.length}} / 500字</view>
				<textarea autoHeight v-model="character_prologue" maxlength="500" :cursor-spacing="150"
					 :styles="dynamicStyle" placeholder="开场白" adjust-position @blur="requireSet"></textarea>
			</view>
			
			
			<!-- <view class="display-flex sp-between">
				<view>
					<cybercafe-button btnClass="btn-primary"
						v-if="item.character_name != '旁白' && item.submitMode"
						@btnClick="saveIncubator(index)" btnName="存为本地角色"></cybercafe-button>
				</view>
				<view>
					<cybercafe-button btnClass="btn-default"
						v-if="item.character_name != '旁白' && item.submitMode"
						@btnClick="" btnName="保存切片"></cybercafe-button>
				</view>
			</view> -->
		</cybercafe-view>
		<image-part ref="cImgPart" :origin_img="character_image" :dark="darkMode" :ckey="character_key"
			:show_create="true" :show_local="true" :show_online="true" @afterClick="afterSelectImg"></image-part>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
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
	export default {
		data() {
			return {
				character_id: 0,
				character_name: '',
				character_image: configData.avatarImg,
				default_image: configData.defaultImg,
				short_description: '',
				full_description: '',
				character_prologue: '',
				character_gender: 0,
				gender: ['未知', '男', '女'],
				
				character_tag: '',
				character_key: '',//由character转过来不改，仅于线上提交后更新
				character_memo: '',
				character_status: 0,
				
				submit_mode: false,
				online: false,
				
				edit_flag: false,//编辑后退出提醒
				tag: [],
				
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
		watch:{
			modalShow(newValue){
				if(newValue){
					this.$refs.cModal.show(this.modalData);
					this.setUserData({
						'modalShow': false
					})
				}
			}
		},
		computed: {
			...mapState('user', ['darkMode', 'lastTimestampSubmit', 'modalData', 'modalShow',
				'powerLevel', 'userKey']),
			dynamicImg() {
				return this.darkMode == 'light' ?
				`background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.5) 90%, rgba(255, 255, 255, 1)), url('${this.character_image}');` : 
				`background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(31, 31, 31, 0.1) 80%, rgba(31, 31, 31, 0.5) 90%, rgba(31, 31, 31, 1)), url('${this.character_image}');`;
			},
			dynamicStyle(){
				return this.darkMode == 'light' ? {backgroundColor: '#fff', color: '#333'} : 
					{backgroundColor: '#1f1f1f', color: '#999'};
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			showMoreImg(){
				//console.log('show gallery');
				this.$refs.cImgPart.openBox(this.character_id.toString());
			},
			
			
			
			async init(){
				this.getUserData();
				
				let character_data = await baseQuery.getDataByKey('cybercafe_character', {character_id: this.character_id});
				//console.log(character_data);
				//if(!character_data) return;
				let description = character_data[0].character_description;
				let pos = description.indexOf('\\n');
				if(pos == -1){
					pos = description.indexOf('\r\n');
				}
				this.character_name = character_data[0].character_name;
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
				this.short_description = pos > -1 ? common.textOperation(description.substr(gender_pos + 1, pos - 1), this.myName).text : description;
				this.full_description = pos > -1 ? common.textOperation(description.substr(pos + 2), this.myName).text : '';
				this.character_prologue = character_data[0].character_prologue;
				this.character_image = character_data[0].character_img ? character_data[0].character_img : this.default_image;
				
				
				/* if(this.incubator_id && this.incubator_id > 0){
					let character_data = await baseQuery.getDataByKey('cybercafe_incubator', {
						'incubator_id': this.incubator_id
					});
					this.getIncubatorData(character_data);
				}else if(this.incubator_id < 0){//已经发布后的修改
					this.character_id = -1 * this.incubator_id;
					let _self = this;					
					let character_data = await baseQuery.getDataByKey('cybercafe_incubator', {
						'character_online_id': this.character_id
					});
					if(character_data.length > 0){
						this.getIncubatorData(character_data);
					}else if(this.character_id > 0){
						request.post("characterController/getCharacterDetail", {
							'character_id': this.character_id
						}).then(res => {
							if (res.code == 200) {
								_self.character_name = res.result.character_name;
								let description = res.result.character_description;
								let pos = description.indexOf('\\n');
								if(pos == -1){
									pos = description.indexOf('\r\n');
								}
								_self.character_gender = res.result.character_gender;
								_self.short_description = pos > -1 ? common.textOperation(description.substr(0, pos), '你').text 
									: common.textOperation(description, '你').text;
								_self.full_description = pos > -1 ? common.textOperation(description.substr(pos + 2), '你').text : '';
								
								_self.character_prologue = res.result.character_prologue;
								_self.character_memo = res.result.character_memo ? res.result.character_memo : '';
								if(res.result.img[0].img_url) _self.character_image = res.result.img[0].img_url;
								if(res.result.character_tag != '') _self.character_tag = res.result.character_tag ? res.result.character_tag : '';
								if(_self.character_tag.length > 0){
									_self.upload_process[1].desc = _self.character_tag;
									_self.tag = _self.character_tag.split('|');
								}
								console.log(_self.tag);
								_self.character_key = res.result.character_key;
								_self.character_status = res.result.character_status;
								_self.requireSet('init');
							} else {
								uni.showToast({
									title: res.msg,
									icon: "none"
								});
							}
						});
					}
				} */
			},
			getIncubatorData(character_data){
				this.character_name = character_data[0].character_name;
				//console.log(character_data[0]);
				let description = character_data[0].character_description;
				let pos = description.indexOf('\\n');
				if(pos == -1){
					pos = description.indexOf('\r\n');
				}
				this.character_gender = character_data[0].character_gender;
				this.short_description = pos > -1 ? common.textOperation(description.substr(0, pos), '你').text 
					: common.textOperation(description, '你').text;
				this.full_description = pos > -1 ? common.textOperation(description.substr(pos + 2), '你').text : '';
				this.character_prologue = character_data[0].character_prologue;
				this.character_memo = character_data[0].character_memo ? character_data[0].character_memo : '';
				if(character_data[0].character_img != this.default_image){
					this.character_image = character_data[0].character_img;
				}
				this.character_tag = character_data[0].character_tag;
				this.character_id = character_data[0].character_offline_id;
				if(this.character_tag.length > 0){
					this.upload_process[1].desc = this.character_tag;
					this.tag = this.character_tag.split('|');
				}
				this.character_status = character_data[0].character_status;
				
				this.requireSet('init');
			},
			showMore(){
				this.$refs.cImgPart.openBox((this.incubator_id > 0 ? ('-' + this.incubator_id) : this.incubator_id).toString());
			},
			requireSet(from = ''){
				this.submit_mode = true;
				if(this.character_name.trim() == '' || 
					(this.short_description.trim() + this.full_description.trim()) == ''){
						this.submit_mode = false;
				}
				
				if(from != 'init') this.edit_flag = true;
			},
			genderChange(e){
				this.character_gender = e.detail.value;
			},
			operation(event){
				/* let _self = this;
				const now = Date.now();
				let tmstp = 0;
				let flag = false;
				//console.log(this.character_image);
				if(this.lastTimestampSubmit 
				&& this.lastTimestampSubmit[this.incubator_id]) 
					tmstp = this.lastTimestampSubmit[this.incubator_id];
				//console.log(this.powerLevel);
				if(event.target.id == ''){//button没有id
					if(this.powerLevel > 0 && this.online && this.incubator_id && this.incubator_id > 0 
					&& (this.character_status == 4 || this.character_status == 6)
					&& this.short_description.length + this.full_description.length > 200 
					&& (now - tmstp) > (60 * 60 * 1000)
					&& (this.character_image.substr(0, 4) == 'http' || this.character_image.substr(0, 6) == 'file:/' 
						|| this.character_image.substr(0, 10) == 'data:image')){
						this.position.x = event.detail.x - 50;
						this.position.y = event.detail.y + 20;
						this.show_menu = true;
					}else{
						this.edit_flag = false;
						relationHandle.saveIncubator(this, '你', 'incubator', 'save').then(value => {
							flag = value;
							if(flag != false) this.incubator_id = flag;
							console.log(this.incubator_id);
						});
					}
				}else if(event.target.id == 'save'){
					this.show_menu = false;
					relationHandle.saveIncubator(this, '你', 'incubator', 'save').then(value => {
						flag = value;
						if(flag != false) this.incubator_id = flag;
						console.log(this.incubator_id);
					});
				}else{
					this.setUserData({
						'modalData': {
							title: '提交提醒',
							content: '确认消耗本次提交机会，并确认提交的图文均为原创？',
							confirmText: '确认提交',
							cancelText: '再想想',
							success: function (res) {
								if (res.confirm) {
									let tmp = _self.lastTimestampSubmit;
									tmp[_self.incubator_id] = now;
									_self.setUserData({lastTimestampSubmit: tmp});
									_self.updateProgress();
								} else{
									relationHandle.saveIncubator(_self, '你', 'incubator', 'save');
								}
							}
						},
						'modalShow': true,
					});
				} */
			},
			async updateProgress(){
				/* uni.showLoading();
				
				this.active = 0;
				this.$refs.popup.open('center');
					
				this.show_menu = false;
				this.edit_flag = false;
				try{
					await relationHandle.saveIncubator(this, '你', 'incubator', 'upload', 4).then(flag => {
						if(flag == false) throw new Error('录入问题，请修改后再试');
					});
					//语义检测
					await this.toolRequest('verification', 8);
					console.log('finish verification');
					//tag提取
					await this.toolRequest('tag', 13);
					console.log('finish tag');
					//上传数据
					await this.uploadData();
					console.log('finish data upload');
					//上传图片
					await this.uploadImage();
					console.log('finish image upload');
				}catch (error) {
					// 捕获并处理错误
					console.error(error);
				}finally{
					uni.hideLoading();
					await relationHandle.saveIncubator(this, '你', 'incubator', 'upload', this.active < 4 ? 4 : 6);
					console.log('finish save incubator');
					this.show_btn = true;
				} */
			},
			del(){
				let _self = this;
				this.setUserData({
					'modalData': {
						content: '删除后将无法创建本地同名角色',
						cancelText: '取消',
						confirmText: '删除',
						success: function(res) {
							if (res.confirm) {
								baseQuery.updateDataByKey('cybercafe_incubator',{
									character_status: 0
								},{
									incubator_id: _self.incubator_id
								});
								
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
								
								setTimeout(() =>{
									uni.switchTab({
										url: '/pages/index/account'
									})
								}, 500);
							}
						},
					},
					'modalShow': true,
				});
			},
			afterSelectImg(e){
				this.character_image = e;
			},
			back() {
				common.back(this.edit_flag);
			},
			async toolRequest(task, ai_type){
				let _self = this;
				let messages = [
					{'role': 'system'},
					{'role': 'user',
					'content': this.character_name + "\r\n" + this.short_description + "\r\n"
						+ this.full_description + "\r\n" + this.character_prologue
					}
				];
				return new Promise((resolve, reject) => {
					try{
						request.post('aiController/tool', {
							'type': ai_type,
							'key': this.userKey,
							'task': task,
							'time': common.getCurrentTimeStampStr(),
							'messages': messages,
						}).then(res => {
							//console.log(res.result);
							if(res.code == 200){
								switch(task){
								case 'tag':
									_self.character_tag = res.result.choices[0].message.content ? res.result.choices[0].message.content : '';
									_self.tag = _self.character_tag.split('|');
									_self.upload_process[1].desc = _self.character_tag;
									_self.active += 1;
									resolve();
								break;
								default: //'verification'
									let return_json = '';
									if(res.result.choices[0].message.content.substr(0, 3) == '```'){
										return_json = JSON.parse(res.result.choices[0].message.content.replace(/```/g, '').substr(4));
									}else{
										return_json = JSON.parse(res.result.choices[0].message.content);
									}
									
									_self.upload_process[0].desc = '得分：' + return_json.score + '，' + return_json.description;
									if(return_json.score > 1){
										_self.setUserData({
											'modalData': {
												title: '语义检测结果',
												content: return_json.description,
												cancelText: '明白了',
												success: function (res) {
													if (res.cancel) {
														//console.log('用户点击确定');
														reject('语义检测问题，请修改后再试：' + return_json.score);
													} 
												}
											},
											'modalShow': true,
										});
									}
									_self.active += 1;
									resolve();
								break;
								}
								reject('检测工具问题，请修改后再试');
							}else {
								//console.error(res.msg);
								uni.showToast({
									title: res.msg,
									icon: "none"
								})
								reject(res.msg);
							}
						});
					}catch(err){
						console.log(err);
						reject('检测工具问题，请修改后再试' + err);
					}
				});
			},
			async uploadData(){
				let _self = this;
				let data = {
					'inc_id': this.incubator_id,
					'name': this.character_name,
					'gender': this.character_gender,
					'description': this.short_description + "\r\n" + this.full_description,
					'prologue': this.character_prologue,
					'tag': this.character_tag,
					'on_id': this.character_id,
					'verification': this.upload_process[0].desc,
				};
				
				return new Promise((resolve, reject) => {
					request.post('characterController/submitCharacter', data).then(res => {
						//console.log(res.result);
						if(res.code == 200){
							baseQuery.updateDataByKey('cybercafe_incubator',{
								character_status: res.result.status,
								//character_key: res.result.key
							},{
								incubator_id: _self.incubator_id
							});
							_self.character_key = res.result.key;
							_self.upload_process[_self.active].desc = '上传完成';
							_self.active += 1;
							resolve();
						}else {
							//console.error(res.msg);
							uni.showToast({
								title: res.msg,
								icon: "none"
							})
							reject('数据上传问题，请修改后再试' + res.msg);
						}
					}).catch(err => {
						console.log(err);
						reject('数据上传问题，请修改后再试' + err);
					});
				});
			},
			async uploadImage(){
				/* let _self = this;
				let return_value = 'fail';
				
				return new Promise((resolve, reject) => {
					//console.log(this.character_image);
					try{
						if(this.character_image.substr(0, configData.domain) == configData.domain){
							this.upload_process[this.active].desc = '无需上传';
							this.active += 1;
							resolve();
						}else if(this.character_image.substr(0, 6) == 'file:/'){//之前版本存在相册里的图，要做base64处理
							console.log(typeof this.character_image);
							relationHandle.pathToBase64(this.character_image).then(base64_image => {
								_self.character_image = base64_image;
								resolve(_self.uploadImg());
							}).catch(err=>{
								console.log('转换64报错',err)
								reject(err);
							});
						}else{//已经是base64的图，直接上传
							resolve(this.uploadImg());
						}
					}catch(err){
						reject(err);
					}
				}); */
			},
			uploadImg(){
				let _self = this;
				try{
					//console.log(typeof this.character_image);
					request.post('characterController/submitImage', {
						file: this.character_image,
						key: this.character_key
					}).then(res => {
						if(res.code == 200){
							//本地图片路径更新
							baseQuery.updateDataByKey('cybercafe_images',{
								image_src: res.result.src
							},{
								image_src: _self.character_image
							});
							
							_self.character_image = res.result.src;
							baseQuery.updateDataByKey('cybercafe_incubator',{
								character_img: res.result.src
							},{
								incubator_id: _self.incubator_id
							});
							_self.upload_process[_self.active].desc = '上传完成';
							_self.active += 1;
						}else {
							//console.error(res.msg);
							uni.showToast({
								title: res.msg,
								icon: "none"
							})
							throw res.msg;
						}
					});
				}catch(err){
					throw err;
				}
			},
			closePop(){
				this.$refs.popup.close();
			}
		},
		onLoad(option) {
			this.character_id = option.id;
			this.init();
		},
	}
</script>

<style lang="scss">
	.character-bg {
		width: 100vw;
		height: 100vw;
		position: fixed;
		top: 0;//8vh
		z-index: -2;
		background-size: 100%;
		background-repeat: no-repeat;
	}
	.view-for-tap{
		width:100vw;
		height: 50vh;
		position: absolute; 
		top: 0; 
		left: 0; 
		z-index: 1; 
		background: rgba(0, 0, 0, 0);
	}
	.group-item{
		margin-top: 90vw;
	}
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
	@media (prefers-color-scheme: dark) {
		.submit-pop, .upload-pop {
			background-color: #1f1f1f;
		}
	}
</style>