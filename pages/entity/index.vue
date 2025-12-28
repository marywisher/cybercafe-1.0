<template>
	<view>
		<view class="entity-bg" :style="dynamicImg(entity_image)"></view>
		<view class="view-for-tap" @tap="showMoreImg('entity')"></view>
		<entityHeader ref="eEHP" :bgOpacity="bg_opacity" :enterable="character_in_entity.length > 0"></entityHeader>
		<detailPart class="entity-des" ref="eDP" @afterLoad="afterLoad" 
			@selectCharacter="openCharacterList" @changeSubjectImg="showMoreImg('subject')"></detailPart>
		<characterList class="character-list" ref="eCL" :exceptIds="character_in_entity"
			@addCharacter="addCharacterFun"></characterList>
		
		<image-part ref="eImgPart" :originImg="entity_image"
			showCreate showLocal @afterClick="afterSelectImg"></image-part>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import baseQuery from '@/func/dbManager/baseQuery';
	import entityHeader from '@/modules/entity/entityHeader';
	import detailPart from '@/modules/entity/detailPart';
	import common from '@/func/common/common';
	import characterList from '@/modules/entity/characterList';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data(){
			return {
				entity_image: configData.defaultImg,
				bg_opacity: 0,
				character_in_entity: [],
				img_type: 'entity',
				origin_img: '',
				subject_image: configData.avatarImg
			}
		},
		components:{
			entityHeader,
			detailPart,
			characterList
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'entity'){
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
				return function(entity_image) {
					if(entity_image){
						if(this.darkMode == 'light'){
							return `background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.5) 90%, rgba(255, 255, 255, 1)), url('${entity_image}');`;
						}else{
							return `background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(31, 31, 31, 0.1) 80%, rgba(31, 31, 31, 0.5) 90%, rgba(31, 31, 31, 1)), url('${entity_image}');`;
						}
					}else{
						return ``;
					}
				}
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			showMoreImg(image_type){
				//console.log(image_type);
				this.img_type = image_type;
				let tmp_type = '';
				if(this.img_type == 'entity'){
					this.origin_img = this.entity_image;
					tmp_type = image_type;
				}else{
					this.origin_img = this.subject_image;
					tmp_type = '0';
				}
				console.log(this.origin_img);
				this.$refs.eImgPart.openBox(tmp_type, this.origin_img);
			},
			async afterSelectImg(e){
				this.$forceUpdate();
				let whereArr = {'entity_id': this.entityId};
				let updateArr = {'entity_updated_at': common.getCurrentTimeStampStr()};
				//console.log(this.img_type);
				if(this.img_type == 'entity'){
					this.entity_image = e;
					updateArr['entity_img'] = e;
				}else{
					this.subject_image = e;
					updateArr['subject_img'] = e;
					this.$refs.eDP.refreshSubjectImg(e);
				}
				let feedback = await baseQuery.updateDataByKey('cybercafe_entity', updateArr, whereArr);
				if(feedback == 'inserted' || feedback == 'updated'){
					//保存
					uni.showToast({
						title: '数据已保存',
						icon: 'none'
					})
				}
			},
			afterLoad(param){
				//console.log(param);
				if(param.entity_image) this.entity_image = param.entity_image;
				if(param.character_in_entity) this.character_in_entity = param.character_in_entity;
				if(param.subject_image) this.subject_image = param.subject_image;
			},
			openCharacterList(){
				this.$refs.eCL.init();
			},
			addCharacterFun(character_data){
				this.$refs.eDP.addCharacter(character_data);
			}
		},
		onLoad(option) {
			this.$nextTick(() => {
				this.$refs.eEHP.init();
				this.$refs.eDP.init(option);
			})
		},
		onPageScroll(e) {
			// 根据滚动距离计算透明度，从 0 到 1
			this.bg_opacity = Math.min(e.scrollTop / 300, 1);
		},
	}
</script>

<style lang="scss">
	.entity-bg {
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
	.entity-des{
		z-index: 2;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	.character-list{
		z-index: 3;
	}
</style>