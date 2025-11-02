<template>
	<view>
		<view class="entity-bg" :style="dynamicImg(entity_image)"></view>
		<view class="view-for-tap" @tap="showMoreImg"></view>
		<entityHeader ref="eEHP" :bg_opacity="bg_opacity"></entityHeader>
		<detailPart class="entity-des" ref="eDP" @afterLoad="afterLoad"></detailPart>
		<image-part ref="eImgPart" :originImg="entity_image"
			showCreate showLocal @afterClick="afterSelectImg"></image-part>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import entityHeader from '@/modules/entity/entityHeader';
	import detailPart from '@/modules/entity/detailPart';
	import common from '@/func/common/common';
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
				entity_character_count: 0 //有角色才能开聊
			}
		},
		components:{
			entityHeader,
			detailPart
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
			...mapState('user', ['darkMode', 'modalData', 'modalPageId', 'modalShow']),
			...mapState('setting', ['entityId']),
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
			showMoreImg(){
				//console.log('show gallery');
				this.$refs.eImgPart.openBox('entity');
			},
			async afterSelectImg(e){
				this.entity_image = e;
				let whereArr = {'entity_id': this.entityId};
				let updateArr = {'entity_img': this.entity_image,
					'entity_updated_at': common.getCurrentTimeStampStr()};
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
				this.entity_image = param.image;
			},
		},
		onLoad() {
			this.$nextTick(() => {
				this.$refs.eEHP.init();
				this.$refs.eDP.init();
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
</style>