<template>
	<view>
		<view class="character-bg" :style="dynamicImg"></view>
		<previewHeader :bgOpacity="bg_opacity" :img="character_image" 
			:imgOpacity="avatar_opacity" @tapDownload="downloadFun"></previewHeader>
		
		<previewDescriptionPart class="character-des" ref="ppdp" @afterLoad="afterLoad"></previewDescriptionPart>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
		
		<previewEntityPart class="ppep-view" ref="ppep" :characterId="character_id" 
			@cancel="cancelFun"></previewEntityPart>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import previewDescriptionPart from '@/modules/character/previewDescriptionPart';
	import previewHeader from '@/modules/character/previewHeader';
	import previewEntityPart from '@/modules/character/previewEntityPart';
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
			previewDescriptionPart,
			previewHeader,
			previewEntityPart
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'characterPreview'){
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
			...mapState('dialogue', ['selectedEntityId']),
			dynamicImg() {
				return this.darkMode == 'light' ?
				`background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.5) 90%, rgba(255, 255, 255, 1)), url('${this.character_image}');` : 
				`background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(31, 31, 31, 0.1) 80%, rgba(31, 31, 31, 0.5) 90%, rgba(31, 31, 31, 1)), url('${this.character_image}');`;
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			afterLoad(param){
				this.character_image = param.image;
				//this.character_key = param.key;
				this.$forceUpdate();
			},
			downloadFun(){
				if(this.selectedEntityId == 0) this.$refs.ppep.init();
				else{
					uni.navigateTo({
						url: '/pages/character/index?online_id=' + this.character_id
					})
				}
			},
			cancelFun(){
				this.$nextTick(() => {
					this.$refs.ppdp.init(this.character_id);
				})
			}
		},
		onLoad(option) {//线上崽预览
			this.character_id = parseInt(option.id);
			this.$nextTick(() => {
				this.$refs.ppdp.init(this.character_id);
			})
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
	.ppep-view{
		z-index: 3;
	}
	@media (prefers-color-scheme: dark) {
		
	}
</style>