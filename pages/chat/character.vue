<template>
	<view>
		<view class="character-bg" :style="dynamicImg"></view>
		<view class="character-header display-flex">
			<!-- 顶部 -->
			<view class="header-left">
				<view class="iconfont icon-xiayibu" @tap="back"></view>
			</view>
		</view>
		<view class="view-for-tap" @tap="showMoreImg"></view>
		
		<descriptionPart class="character-des" ref="cDP" @afterLoad="afterLoad"></descriptionPart>
		<image-part ref="cImgPart" :originImg="character_image" :dark="darkMode" :ckey="character_key"
			showCreate showLocal showOnline @afterClick="afterSelectImg"></image-part>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import descriptionPart from '@/modules/character/descriptionPart';
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
				character_key: '',//由character转过来不改，仅于线上提交后更新
			}
		},
		components:{
			descriptionPart
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
			...mapState('user', ['darkMode']),
			dynamicImg() {
				return this.darkMode == 'light' ?
				`background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.5) 90%, rgba(255, 255, 255, 1)), url('${this.character_image}');` : 
				`background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(31, 31, 31, 0.1) 80%, rgba(31, 31, 31, 0.5) 90%, rgba(31, 31, 31, 1)), url('${this.character_image}');`;
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			showMoreImg(){
				//console.log('show gallery');
				this.$refs.cImgPart.openBox(this.character_id.toString());
			},
			afterSelectImg(e){
				this.character_image = e;
			},
			afterLoad(param){
				this.character_image = param.image;
				this.character_key = param.key;
			},
			back(){
				uni.navigateBack();
			}
		},
		onLoad(option) {
			this.character_id = option.id;
			this.$nextTick(() => {
				this.$refs.cDP.init(this.character_id);
			})
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
	.character-header{
		position: fixed;
		top: 5vh;
		left: 0;
		width: calc(100vw - 2 * $uni-spacing-base);
		z-index: 2;
	}
	.icon-xiayibu{
		transform: rotate(180deg);
		color: $uni-color-main;
		font-size: $uni-font-size-huge;
		margin-left: $uni-spacing-base;
	}
	.character-des{
		z-index: 3;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	@media (prefers-color-scheme: dark) {
		.icon-xiayibu{
			color: $uni-color-dark-main;
		}
	}
</style>