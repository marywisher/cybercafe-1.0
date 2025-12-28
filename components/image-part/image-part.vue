<template>
	<cybercafe-view class="img-box" ref="imgBox" isAbsolute closeAble :closeType="2"
		popViewStyle="position: fixed; top: 0; left: 0; width: 100vw; margin: 0; padding: 0; background-color: transparent; border: none; color: #c0c0c0;">
		
		<swiper class="swiper-box" @change="swiperChange" :current="swiper_current">
			<swiper-item v-if="origin_image && origin_image != default_image">
				<image class="ipimg" mode="aspectFit" :src="origin_image" @tap="closeBox"></image>
			</swiper-item>
			<swiper-item v-if="images.length > 0" v-for="(item, index) in images" :key="index">
				<view class="upload-btn" v-if="item.image_status == 4">
					<uni-icons type="upload" style="color: white;" @tap="uploadimg(item)"></uni-icons>
				</view>
				<image class="ipimg" mode="aspectFit" :src="item" @tap="selectImg"></image>
			</swiper-item>
			<swiper-item v-if="showCreate">
				<image class="ipimg" mode="aspectFit" :src="default_image" @tap="openCrop"></image>
			</swiper-item>
		</swiper>
		<cybercafeSwiperDot :list="(showCreate && origin_image && origin_image != default_image ? images.concat(['1', '2']) : images.concat(['1']))"
			@tapDot="clickItem" :swiperCurrent="swiper_current"></cybercafeSwiperDot>
		
		<cybercafe-view ref="popup" @maskClick="closeCrop" isAbsolute closeAble :closeType="0"
			popViewStyle="position: fixed; bottom: 0; left: 0; width: 100vw; margin: 0; padding: 0; background-color: transparent; border: none;">
			<okingtz-cropper :beEmpty="beEmpty && origin_image" :fixedNumber="fixedNumber"
				:maxCropper="true" @uploadSuccess="saveImage"></okingtz-cropper>
		</cybercafe-view>
	</cybercafe-view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import sqlite from '@/func/common/sqlite';
	import common from '@/func/common/common';
	import baseQuery from '@/func/dbManager/baseQuery';
	import request from '@/func/common/request';
	import cybercafeSwiperDot from '../cybercafe-swiper-dot/cybercafe-swiper-dot';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';

	export default {
		name: "image-part",
		props: {
			originImg: {
				type: String,
				default: configData.voiceOver
			},
			showCreate: {//允许新建
				type: Boolean,
				default: false
			},
			showLocal: {//显示本地图片
				type: Boolean,
				default: false
			},
			showOnline: {//显示线上图片
				type: Boolean,
				default: false
			},
			ckey: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				id: '0',
				images: [],
				origin_image: '',
				default_image: configData.defaultImg,
				swiper_current: 0,
				fixedNumber: [1, 1], //裁切等比锁，头像全1:1，背景按获取的手机尺寸设置fixedNumber
				swiper_dot_styles: {
					backgroundColor: 'rgba(255, 255, 255, .3)',
					border: '1px rgba(255, 255, 255, .3) solid',
					color: '#000',
					selectedBackgroundColor: 'rgba(255, 255, 255, .9)',
					selectedBorder: '1px rgba(255, 255, 255, .9) solid'
				},
			}
		},
		watch: {
			id(newValue){
				console.log(newValue);
			},
			originImg(newValue){
				this.origin_image = newValue;
			}
		},
		components: {
			cybercafeSwiperDot
		},
		computed: {
			...mapState('user', ['deviceInfo']),
			beEmpty(){
				return this.id == 'entity' && this.origin_image != this.default_image ? true : false;
			},
			dynamicViewWidth(){
				return 'width:' + (( 2 * (this.showCreate ? this.images.length + 2 : this.images.length + 1) + 1 ) * 20) + 'rpx';//（2倍数量+1）*10
			}
		},
		methods:{
			...mapMutations('user', ['getUserData']),
			openBox(id, img = this.origin_image){
				//console.log(img);
				this.origin_image = img;
				this.$refs.imgBox.openView();
				this.id = id;
				this.swiper_current = 0;
				this.images = [];
				this.$nextTick(() =>{
					this.$refs.popup.closeView();
				})				
				this.init();
			},
			init(){
				//console.log(this.id)
				//console.log(this.origin_image);
				let _self = this;
				if(this.showOnline){
					if(this.id != 'entity' && (parseInt(this.id) > 0 || this.ckey)){//character线上数据
						request.post('characterController/getCharacterImages', 'character', {
							'character_id': this.id,
							'key': this.ckey
						}).then(res => {
							if (res.code == 200) {
								console.log(res.result.img);
								for(let j = 0; j < res.result.img.length; j ++){
									if(_self.images.indexOf(res.result.img[j].img_url) == -1 
									 && res.result.img[j].img_url != _self.origin_image){
										_self.images.push(res.result.img[j].img_url);
									}
								}
							}else {
								uni.showToast({
									title: res.msg,
									icon: "none"
								});
							}
						});
					}
				}
				
				if(this.showLocal){
					let sqlStr = "select * from cybercafe_images where image_type = '" + this.id 
						+ "' and (image_status = 1 or image_status = 4) and image_src <> '" + this.origin_image 
						+ "' order by image_selected_count DESC, image_created_at DESC";
					//console.log(sqlStr);
					sqlite.selectSQL(sqlStr).then(data => {
						if(data.length > 0){
							for(let i = 0; i < data.length; i ++){
								if(_self.images.indexOf(data[i].image_src) == -1 
								 && data[i].image_src != _self.origin_image){
									_self.images.push(data[i].image_src);
								}
							}
						}
					}).catch(e => {
						console.error(e);
					});
				}
				
				setTimeout(() => {
					if(this.origin_image == this.default_image && this.images.length == 0){//若无可选则弹出选图
						this.openCrop();
					}
				}, 2000);
			},
			swiperChange(e){
				//console.log(e)
				this.swiper_current = e.detail.current;
			},
			selectImg(){
				let img_index = this.swiper_current;
				if(this.origin_image != this.default_image) img_index = this.swiper_current - 1;
				let _self = this;
				if(this.showCreate){
					let sqlStr = "update cybercafe_images set image_selected_count = image_selected_count + 1 ";
					let whereStr = " where image_type = '" + this.id + "' and image_src = '" + this.images[img_index] + "'";
					if(this.images[img_index].substr(0, 6) == 'file:/'){//原本地相册图片转存成base64
						//以下代码为异步操作，可能有后端报错，暂不修改，如遇则联系玩家重新选择相册图片生成						
						uni.compressImage({
						    src: this.images[img_index], // 图片路径
						    quality: 75, // 压缩质量，范围为0 - 100，100为不压缩
						    success: function (res) {
						        // 压缩成功，返回压缩后的图片路径 tempFilePath
								common.pathToBase64(res.tempFilePath).then(base64_image => {
									_self.images[img_index] = base64_image;
									sqlStr += ", image_src = '" + base64_image + "' " + whereStr;
									sqlite.executeSQL(sqlStr).then(() => {
										console.log('updated:', sqlStr);
									}).catch(e => {
										console.error(e);
									});
									_self.closeBox();
									_self.$emit('afterClick', _self.images[img_index]);
								}).catch(err => {
									console.log('转换64报错',err);
									_self.closeBox();
									return;
								});
						        // 接下来可以将tempFilePath作为上传图片的路径
						        //console.log('压缩后的图片路径：' + tempFilePath)
							},
						    fail: function (err) {
						        // 压缩失败的处理
						        console.log('压缩失败：' + err)
								_self.closeBox();
								return;
						    }
						});
					}else{
						sqlStr += whereStr;
						sqlite.executeSQL(sqlStr).then(() => {
							console.log('updated:', sqlStr);
						}).catch(e => {
							console.error(e);
						});
						this.closeBox();
						this.$emit('afterClick', this.images[img_index]);
					}
				}else{
					this.closeBox();
				}
			},
			openCrop(){
				//console.log(from);
				if(this.id == 'entity'){
					//console.log(this.entity_image);
					let device_info = JSON.parse(this.deviceInfo);
					this.fixedNumber[0] = device_info.screenWidth;
					this.fixedNumber[1] = device_info.screenHeight;
				}else{
					this.fixedNumber = [1, 1];
				}
				//console.log(this.fixedNumber);
				this.$refs.popup.openView();
			},
			closeCrop(){
				this.$refs.popup.closeView();
			},
			saveImage(tempFilePath) {
				let _self = this;
				_self.operateImg(tempFilePath);
				_self.$refs.popup.closeView();
			},
			operateImg(imgFile){
				if(imgFile == ''){
					imgFile = this.default_image;
				} else{
					let insertArr = {
						'image_type': this.id,
						'image_src': imgFile,
						'image_created_at': common.getCurrentTimeStampStr(),
						'image_selected_count': 1,
						'image_status': 4
					};
					baseQuery.insertDataByKey('cybercafe_images', insertArr);	
				}
				this.closeBox();
				this.$emit('afterClick', imgFile);
			},
			closeBox(){
				this.$refs.imgBox.closeView();
				//console.log('close');
			},
			uploadimg(item){
				console.log(item);
				uni.showToast({
					title: '该功能暂未开放'
				})
			},
			clickItem(e){//swiper点
				//console.log(e);
				this.swiper_current = e;
			},
		}
	}
</script>

<style lang="scss">
	.img-box{
		width: 100vw;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		text-align: center;
		z-index: 4;
	}
	.swiper-box{
		height: 80vh;
	}
	.swiper-dot{
		width: 100vw;
		position: fixed;
		bottom: 20vh;
	}
	.ipimg{
		width: 100vw;
		min-height: 100vw;
		margin-top: $page-header-height;
	}
	.upload-btn{
		position: absolute;
		top: 13vh;
		left: 3vh;
		z-index: 5000;
	}
</style>