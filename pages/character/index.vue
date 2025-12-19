<template>
	<view>
		<view class="character-bg" :style="dynamicImg"></view>
		<view class="view-for-tap" @tap="showMoreImg"></view>
		<characterHeader :bgOpacity="bg_opacity" :img="character_image" 
			:imgOpacity="avatar_opacity" ref="cCH"
			@tapEnter="gotoEntity"></characterHeader>
		
		<descriptionPart class="character-des" ref="cDP" @afterLoad="afterLoad"
			@afterCreate="gotoEntity"></descriptionPart>
		<image-part ref="cImgPart" :originImg="character_image"
			showCreate showLocal showOnline @afterClick="afterSelectImg"></image-part>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import descriptionPart from '@/modules/character/descriptionPart';
	import characterHeader from '@/modules/character/characterHeader';
	import entityFun from '@/func/entity/entityFun';
	import baseQuery from '@/func/dbManager/baseQuery';
	import messageFun from '@/func/entity/messageFun';
	import dialogueQuery from '@/func/dbManager/dialogueQuery';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		data() {
			return {
				character_image: configData.avatarImg,
				character_id: 0,
				bg_opacity: 0,
				avatar_opacity: 0,
				//character_key: '',//由character转过来不改，仅于线上提交后更新
			}
		},
		components:{
			descriptionPart,
			characterHeader
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'character'){
				    	this.$nextTick(() => {
				    		this.$refs.cModal.show(this.modalData);
						});
				    	this.setUserData({
				    		'modalShow': false,
				    		'modalPageId': ''
				    	})
				    }
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
			...mapState('setting', ['darkMode', 'entityId']),
			dynamicImg() {
				return this.darkMode == 'light' ?
				`background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.5) 90%, rgba(255, 255, 255, 1)), url('${this.character_image}');` : 
				`background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(31, 31, 31, 0.1) 80%, rgba(31, 31, 31, 0.5) 90%, rgba(31, 31, 31, 1)), url('${this.character_image}');`;
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['setSettingData']),
			showMoreImg(){
				//console.log('show gallery');
				this.$refs.cImgPart.openBox(this.character_id.toString());
			},
			async afterSelectImg(e){
				this.character_image = e;
				let whereArr = {'character_id': this.character_id};
				let updateArr = {'character_img': this.character_image};
				let feedback = await baseQuery.updateDataByKey('cybercafe_character', updateArr, whereArr);
				if(feedback == 'inserted' || feedback == 'updated'){
					//保存
					uni.showToast({
						title: '数据已保存',
						icon: 'none'
					})
				}
			},
			afterLoad(param){
				this.character_image = param.image;
				if(!this.character_id) this.character_id = param.id;
				//this.character_key = param.key;
				this.$forceUpdate();
			},
			async gotoEntity(character_id = 0){
				console.log(character_id);
				if(character_id > 0){
					this.character_id = character_id;
				}
				//开场白注入
				let message_count = await dialogueQuery.getMessageByCharacterId(this.character_id);
				//console.log(message_count);
				if(message_count[0].message_count == 0) messageFun.injectPrologue(this.character_id);
				this.$refs.cCH.init(this.character_id);
				let detail_data = await baseQuery.getDataByKey('cybercafe_entity_detail',
					{'character_id': this.character_id});
				if(detail_data){
					console.log(detail_data[0].entity_id);
					this.setSettingData({'entityId': detail_data[0].entity_id});
					entityFun.enterEntity();
				}else{
					uni.showToast({
						title: '请重新载入数据或联系管理员',
						icon:'none'
					})
				}
			},
		},
		onLoad(option) {
			if(option.hasOwnProperty('id')){
				//console.log(option.id);
				this.character_id = parseInt(option.id);
				this.$nextTick(() => {
					this.$refs.cDP.init(this.character_id);
					this.$refs.cCH.init(this.character_id);
				})
			}else if(option.hasOwnProperty('online_id')){
				this.character_id = 0;
				//console.log(option.online_id);
				this.$nextTick(() => {
					this.$refs.cDP.createCharacter(option.online_id);
				})
			}
		},
		onPageScroll(e) {
			// 根据滚动距离计算透明度，从 0 到 1
			this.bg_opacity = Math.min(e.scrollTop / 300, 1);
			this.avatar_opacity = Math.min(e.scrollTop / 300, 1);
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
	.character-des{
		z-index: 2;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	@media (prefers-color-scheme: dark) {
		
	}
</style>