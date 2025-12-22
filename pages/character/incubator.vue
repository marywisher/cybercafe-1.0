<template>
	<view>
		<view class="character-bg" :style="dynamicImg"></view>
		<view v-if="show_more_img" class="view-for-tap" @tap="showMoreImg"></view>
		<incubatorHeader ref="iHeader" :bgOpacity="bg_opacity" @tapDownload="downloadFun"></incubatorHeader>
		
		<incubatorDescriptionPart ref="iDescripP" @afterLoad="afterLoad"></incubatorDescriptionPart>
		<previewEntityPart class="ppep-view" ref="iPep" :characterId="-1 * incubator_id"
			@cancel="cancelFun"></previewEntityPart>
		
		<image-part ref="cImgPart" :originImg="character_image"
			showCreate showLocal @afterClick="afterSelectImg"></image-part>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import incubatorHeader from '@/modules/character/incubatorHeader';
	import incubatorDescriptionPart from '@/modules/character/incubatorDescriptionPart';
	import previewEntityPart from '@/modules/character/previewEntityPart';
	
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	
	import baseQuery from '@/func/dbManager/baseQuery';
	
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	
	export default {
		data() {
			return {
				bg_opacity: 0,
				show_more_img: true,
				
				incubator_id: 0,
				character_image: configData.avatarImg
			}
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'incubator'){
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
		components: {
			incubatorHeader,
			incubatorDescriptionPart,
			previewEntityPart
		},
		computed: {
			...mapState('setting', ['darkMode']),
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
			dynamicImg() {
				return this.darkMode == 'light' ?
					`background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.5) 90%, rgba(255, 255, 255, 1)), url('${this.character_image}');` : 
					`background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(31, 31, 31, 0.1) 80%, rgba(31, 31, 31, 0.5) 90%, rgba(31, 31, 31, 1)), url('${this.character_image}');`;
			}
		},
		methods: {
			...mapMutations('setting', ['setSettingData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(){
				this.$nextTick(() => {
					this.$refs.iHeader.init(this.incubator_id);
					this.$refs.iDescripP.init(this.incubator_id);
				});
			},
			showMoreImg(){
				//console.log('show gallery');
				this.$refs.cImgPart.openBox('-' + this.incubator_id.toString());
			},
			async afterSelectImg(e){
				this.character_image = e;
				let whereArr = {'incubator_id': this.incubator_id};
				let updateArr = {'character_img': this.character_image};
				let feedback = await baseQuery.updateDataByKey('cybercafe_incubator', updateArr, whereArr);
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
				this.character_image = param.image;
				this.$forceUpdate();
			},
			downloadFun(){
				this.show_more_img = false;
				this.$refs.iPep.init();
			},
			cancelFun(){
				this.$nextTick(() => {
					this.show_more_img = true;
					this.$refs.iDescripP.init(this.incubator_id);
				})
			}
		},
		onLoad(option) {
			this.incubator_id = option.id < 0 ? -1 * parseInt(option.id) : option.id;
			console.log(this.incubator_id);
			this.init();
		},
		onPageScroll(e) {
			// 根据滚动距离计算透明度，从 0 到 1
			this.bg_opacity = Math.min(e.scrollTop / 300, 1);
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