<template>
	<cybercafe-header :bgOpacity="bgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view v-if="character_id > 0" class="iconfont icon-chatou" @tap="enterEntity"></view>
			<label v-if="character_id > 0" class="hint" @tap="enterEntity">进入容器</label>
			<view v-if="enable_save" class="iconfont icon-geren" @tap="saveAsIncubator"></view>
			<label v-if="enable_save" class="hint" @tap="saveAsIncubator">存为本地角色</label><!-- :img="img" :imgOpacity="imgOpacity" -->
		</view>
	</cybercafe-header>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import common from '@/func/common/common';
	import characterFun from '@/func/character/characterFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'characterHeader',
		data(){
			return{
				character_id: 0,
				enable_save: false,
				incubator_id: 0
			}
		},
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
			img: {
				type: String,
				default: ''
			},
			imgOpacity:{
				type: Number,
				default: 0
			},
			characterName: {
				type: String,
				default: ''
			}
		},
		watch:{
			characterName:{
				handler(newValue, oldValue) {
				    this.checkNameUnique(newValue);
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(character_id){
				this.character_id = character_id;
			},
			back(){
				uni.navigateBack();
			},
			enterEntity(){
				this.$emit('tapEnter');
			},
			async saveAsIncubator(){
				console.log(this.incubator_id);
				if(!this.character_id) return;
				let character_data = await baseQuery.getDataByKey('cybercafe_character', 
					{'character_id': this.character_id});
				if(character_data.length == 0) return;
				let character_description = character_data[0].character_description;
				//拆解性别
				let character_gender = '';
				if(!common.isJsonString(character_description)){//老版
					let pos = character_description.indexOf('\\n');
					if(pos == -1){
						pos = character_description.indexOf('\r\n');
					}
					let gender_pos = character_description.substr(0, pos).indexOf('，');
					if(gender_pos != -1){
						character_gender = characterFun.getGenderNum(character_description.substr(0, gender_pos));
					}
				}else{//新版
					let description_obj = JSON.parse(character_description);
					character_gender = characterFun.getGenderNum(description_obj.性别);
				}
				let incubator_data = {
					'character_gender': character_gender,
					'character_description': character_description,
					'character_prologue': character_data[0].character_prologue,
					'character_img': character_data[0].character_img,
					'character_online_id': character_data[0].character_online_id,
					'character_offline_id': this.character_id,
					'character_status': 4
				};
				this.incubator_id = await baseQuery.updateDataByKey('cybercafe_incubator', 
					incubator_data, {'character_name': this.characterName}, true);
				this.enable_save = false;
				//弹窗跳转
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "温馨提醒",
						content: "即将跳转到本地角色页？",
						confirmText: '前往本地角色页',
						cancelText: '留在当前切片页',
						success: (res) => {
							if(res.confirm == true){
								uni.navigateTo({
									url: '/pages/character/incubator?id=' + _self.incubator_id
								})
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'character'
				})
			},
			async checkNameUnique(character_name){
				//console.log(newValue);
				let incubator_data = await baseQuery.getDataByKey('cybercafe_incubator', {'character_name': character_name});
				if(incubator_data.length > 0){
					if(incubator_data[0].character_status == 0){//已删除
						this.incubator_id = incubator_data[0].incubator_id;
						this.enable_save = true;
					}else{
						this.enable_save = false;
					}
				}else{
					this.enable_save = true;
				}
			}
		}
	}
</script>

<style lang="scss">
	.iconfont{
		font-size: calc(2 * $uni-font-size-sm);
	}
	.iconback{
		transform: rotate(180deg);
	}
	.header-right .hint{
		margin-right: $uni-spacing-lg;
	}
</style>