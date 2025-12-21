<template>
	<view>
		<!-- <view class="content">
			<uni-row class="demo-uni-row">
				<uni-col v-if="!incubator_id || !(incubator_id > 0)" :span="5" :offset="14">
					<cybercafe-button btnClass="btn-primary" :btnDisable="submit_mode === false"
						@tapBtn="operation" btnName="创建"></cybercafe-button>
				</uni-col>
				<uni-col v-else :span="5">
					<cybercafe-button btnClass="btn-primary" :btnDisable="submit_mode === false"
						@tapBtn="operation" btnName="保存"></cybercafe-button>
				</uni-col>
			</uni-row>
		</view>
		<view v-if="on_line && incubator_id && incubator_id > 0 && show_menu" 
			class="submit-pop" :style="{ top: `${position.y}px`, right: `20px` }">
			<view class="submit-btn" id="save" style="border-bottom: 1px solid #999;" @tap="operation">仅保存</view>
			<view class="submit-btn" id="submit" @tap="operation">提交线上发布</view>
		</view>
		
		<view class="content" v-if="powerLevel > 0"><label class="required">注意：简介+详细介绍字数+开场白 > 200 方可提交发布</label></view>
		<view class="content" v-if="powerLevel > 0" style="margin-left: 76rpx;margin-bottom: 20rpx;">
			<label class="required">每1小时可提交1次，请确保提交内容为原创</label>
		</view>
		<view class="content" v-else style="margin-bottom: 20rpx;">
			<label class="required">当前等级无法提交线上发布本地角色，请多多使用</label><br>
			<label class="required">仅保存在本地的，请无视以上内容</label>
		</view>
		<view class="content"><label class="required">* 为必填项</label></view>
		<view class="group-item">
			<view><label>头像</label></view>
			<image class="rimg" mode="aspectFit" :src="character_image" @tap="showMore('subject')"></image>
			<uni-row class="demo-uni-row">
				<uni-col :span="16">
					<view><label class="required">*</label><label>昵称</label> {{character_name.length}} / 16</view>
					<uni-easyinput v-model="character_name" maxlength="16" :styles="dynamicStyle" @blur="requireSet"></uni-easyinput>
				</uni-col>
				<uni-col :span="7" :offset="1">
					<view><label>性别</label></view>
					<picker class="genderPick" @change="genderChange" :value="character_gender" :range="gender">
						<view>{{gender[character_gender]}}</view>
					</picker>
				</uni-col>
			</uni-row>			
			<view><label class="required">*</label><label>简介（用于列表显示，会传AI）</label> {{short_description.length}} / 100</view>
			<uni-easyinput type="textarea" autoHeight v-model="short_description" maxlength="100" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="请输入简短介绍" adjust-position  @blur="requireSet"></uni-easyinput>
			<view class="content" v-html="hint"></view>
			<view><label>详细（简介的部分不用重复，会传AI）</label> {{full_description.length}} / 2000</view>
			<uni-easyinput type="textarea" autoHeight v-model="full_description" maxlength="2000" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="详细介绍" adjust-position @blur="requireSet"></uni-easyinput>
			<view><label>开场白</label> {{character_prologue.length}} / 500</view>
			<uni-easyinput type="textarea" autoHeight v-model="character_prologue" maxlength="500" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="开场白" adjust-position @blur="requireSet"></uni-easyinput>
			<view class="display-flex tags">
				<view style="margin-right: 20rpx;">角色tag</view>
				<view class="tag-item" v-for="(item, index) in tag" :key="index">{{item}}</view>
			</view>
			<view><label>给玩家的话（不发送给AI）</label> {{character_memo.length}} / 200</view>
			<uni-easyinput type="textarea" autoHeight v-model="character_memo" maxlength="200" :cursor-spacing="150"
				 :styles="dynamicStyle" placeholder="题外话" adjust-position @blur="requireSet"></uni-easyinput>
		</view>
		
		<uni-popup ref="popup" :is-mask-click="false" mask-background-color="rgba(0,0,0,0.8)">
			<view class="group-item upload-pop">
				<view v-if="!show_btn" class="text-center" style="color:red">--提交过程中，请勿关闭或退出--</view>
				<uni-steps :options="upload_process" active-icon="circle" :active="active" direction="column"/>
				<cybercafe-button btnClass="btn-primary" btnName="提交未通过，请修改后再提交"
					@tapBtn="closePop" v-if="show_btn && active < 4" 
					btnStyle="position: absolute;right: 20px;bottom: 20px;"></cybercafe-button>
				<cybercafe-button btnClass="btn-primary" btnName="提交通过，请静候审核结果"
					@tapBtn="closePop" v-if="show_btn && active == 4"
					btnStyle="position: absolute;right: 20px;bottom: 20px;"></cybercafe-button>
			</view>
		</uni-popup>-->
		
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
					<view v-if="character_gender == 0" class="iconfont icon-WuXingBie2"></view>
				</view>
			</view>
			<view v-show="show_gender">
				<cybercafe-view class="gender-view">
					<view class="display-flex display-line sp-between gender-pick">
						<view class="iconfont icon-xingbienan" @tap="genderChange(1)"></view>
						<view class="gender-border"></view>
						<view class="iconfont icon-xingbienv" @tap="genderChange(2)"></view>
						<view class="gender-border"></view>
						<view class="iconfont icon-WuXingBie2" @tap="genderChange(0)"></view>
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
				default_image: configData.defaultImg,
				character_gender: 0,
				gender_cn: '未知',
				description_data: '', //字段数据
				character_story: '',
				character_prologue: '',
				
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
				
				submit_mode: false,
				on_line: false,
				
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
				if(character_data.hasOwnProperty('basic_description'))
					this.basic_description = character_data.basic_description;
				if(character_data.hasOwnProperty('extend_description')) 
					this.extend_description = character_data.extend_description;
				
				let character_image = character_data[0].character_img ? character_data[0].character_img : this.default_image;
				this.$emit('afterLoad', 
					{'image': character_image});//,'key': character_key
				
				if(this.character_tag.length > 0){
					this.upload_process[1].desc = this.character_tag;
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
						}
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
			
			
			
			
			/* showMore(){
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
			operation(event){
				let _self = this;
				const now = Date.now();
				let tmstp = 0;
				let flag = false;
				//console.log(this.character_image);
				if(this.lastTimestampSubmit 
				&& this.lastTimestampSubmit[this.incubator_id]) 
					tmstp = this.lastTimestampSubmit[this.incubator_id];
				//console.log(this.powerLevel);
				if(event.target.id == ''){//button没有id
					if(this.powerLevel > 0 && this.on_line && this.incubator_id && this.incubator_id > 0 
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
									_self.setUserData({'lastTimestampSubmit': tmp});
									_self.updateProgress();
								} else{
									relationHandle.saveIncubator(_self, '你', 'incubator', 'save');
								}
							}
						},
						'modalShow': true,
					});
				}
			},
			async updateProgress(){
				uni.showLoading();
				
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
				}
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
						request.post('aiController/tool', 'incubator', {
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
												confirmText: '',
												cancelText: 'OK',
												success: function (res) {
													if (res.confirm) {
														//console.log('用户点击确定');
														reject('语义检测问题，请修改后再试：' + return_json.score);
													} 
												}
											},
											'modalShow': true,
											'modalPageId': 'incubator'
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
					'on_id': this.incubator_id,
					'verification': this.upload_process[0].desc,
				};
				
				return new Promise((resolve, reject) => {
					request.post('characterController/submitCharacter', 'incubator', data).then(res => {
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
				let _self = this;
				let return_value = 'fail';
				
				return new Promise((resolve, reject) => {
					//console.log(this.character_image);
					try{
						if(this.character_image.substr(0, configData.domain.length) == configData.domain){
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
				});
			},
			uploadImg(){
				let _self = this;
				try{
					//console.log(typeof this.character_image);
					request.post('characterController/submitImage', 'incubator', {
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
			} */
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