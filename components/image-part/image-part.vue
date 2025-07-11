<template>
	<view class="img-box" v-show="show_box">
		<view class="img-mask"></view>
		
		<!-- <uni-swiper-dot class="img-swiper" :current="swiper_current" mode="round"  :dots-styles="swiper_dot_styles"
			:info="" @clickItem="clickItem"> -->
			<swiper class="swiper-box" @change="swiperChange" :current="swiper_current">
				<swiper-item>
					<image class="ipimg" mode="aspectFit" :src="originImg" @tap="closeBox"></image>
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
		<!-- </uni-swiper-dot> -->
		
		<view class="swiper-dot display-flex sp-between">
			<view v-for="(item, index) in (showCreate ? images.concat(['1', '2']) : images.concat(['1']))" :key="index" class="swiper-dot-item" 
				:class="{'swiper-dot-active': index == swiper_current}" @tap="clickItem"></view>
		</view>
		
		<cybercafe-view class="more-box" type="bottom" ref="popup" @maskClick="closeCrop">
			<okingtz-cropper :beEmpty="beEmpty" :fixedNumber="fixedNumber" :dark="dark"
				:maxCropper="true" @uploadSuccess="saveImage"></okingtz-cropper>
		</cybercafe-view>
		<view class="close-btn"><uni-icons type="closeempty" style="color: white;" @tap="closeBox"></uni-icons></view>
	</view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	
	import sqlite from '@/func/common/sqlite';
	import common from '@/func/common/common';
	import baseQuery from '@/func/dbManager/baseQuery';
	import request from '@/func/common/request';
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
			dark:{
				type: String,
				default: 'light'
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
				show_box: false,
			}
		},
		watch: {
			id(newValue){
				console.log(newValue);
				
			}
		},
		computed: {
			...mapState('user', ['screen']),
			beEmpty(){
				return this.id == 'entity' && this.originImg != this.default_image ? true : false;
			}
		},
		methods:{
			...mapMutations('user', ['getUserData']),
			openBox(id){
				//console.log(this.id);
				this.id = id;
				this.swiper_current = 0;
				this.show_box = true;
				this.images = [];
				this.init();
			},
			init(){
				console.log(this.id)
				if(this.originImg == this.default_image){
					this.openCrop();
					return;
				}
				//console.log(this.originImg);
				let _self = this;
				if(this.showOnline){
					if(this.id != 'entity' && (parseInt(this.id) > 0 || this.ckey)){//character线上数据
						request.post('characterController/getCharacterImages', {
							'character_id': this.id,
							'key': this.ckey
						}).then(res => {
							if (res.code == 200) {
								//console.log(res.result.img);
								for(let j = 0; j < res.result.img.length; j ++){
									if(_self.images.indexOf(res.result.img[j].img_url) == -1 && res.result.img[j].img_url != _self.originImg){
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
						+ "' and (image_status = 1 or image_status = 4) and image_src <> '" + this.originImg 
						+ "' order by image_selected_count DESC, image_created_at DESC";
					//console.log(sqlStr);
					sqlite.selectSQL(sqlStr).then(data => {
						if(data.length > 0){
							for(let i = 0; i < data.length; i ++){
								if(_self.images.indexOf(data[i].image_src) == -1 && data[i].image_src != _self.originImg){
									_self.images.push(data[i].image_src);
								}
							}
						}
					}).catch(e => {
						console.error(e);
					});
				}
			},
			swiperChange(e){
				//console.log(e)
				this.swiper_current = e.detail.current;
			},
			selectImg(){
				let _self = this;
				if(this.showCreate){
					let sqlStr = "update cybercafe_images set image_selected_count = image_selected_count + 1 ";
					let whereStr = " where image_type = '" + this.id + "' and image_src = '" + this.images[this.swiper_current - 1] + "'";
					if(this.images[this.swiper_current - 1].substr(0, 6) == 'file:/'){//原本地相册图片转存成base64
						//以下代码为异步操作，可能有后端报错，暂不修改，如遇则联系劳斯重新选择相册图片生成						
						uni.compressImage({
						    src: this.images[this.swiper_current - 1], // 图片路径
						    quality: 75, // 压缩质量，范围为0 - 100，100为不压缩
						    success: function (res) {
						        // 压缩成功，返回压缩后的图片路径 tempFilePath
								common.pathToBase64(res.tempFilePath).then(base64_image => {
									_self.images[_self.swiper_current - 1] = base64_image;
									sqlStr += ", image_src = '" + base64_image + "' " + whereStr;
									sqlite.executeSQL(sqlStr).then(() => {
										console.log('updated:', sqlStr);
									}).catch(e => {
										console.error(e);
									});
									_self.closeBox();
									_self.$emit('afterClick', _self.images[_self.swiper_current - 1]);
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
						this.$emit('afterClick', this.images[this.swiper_current - 1]);
					}
				}else{
					this.closeBox();
				}
			},
			openCrop(){
				//console.log(from);
				if(this.id == 'entity'){
					this.getUserData();
					//console.log(this.entity_image);
					this.fixedNumber[0] = uni.getSystemInfoSync().screenWidth;
					this.fixedNumber[1] = uni.getSystemInfoSync().screenHeight;
				}else{
					this.fixedNumber = [1, 1];
				}
				//console.log(this.fixedNumber);
				this.$refs.popup.open();
			},
			closeCrop(){
				this.$refs.popup.close();
			},
			saveImage(tempFilePath) {
				let _self = this;
				_self.operateImg(tempFilePath);
				_self.$refs.popup.close();
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
				this.show_box = false;
				//console.log('close');
			},
			uploadimg(item){
				console.log(item);
				uni.showToast({
					title: '该功能暂未开放'
				})
			},
			clickItem(e){//swiper点
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
		z-index: 2;
	}
	.img-mask{
		width: 100vw;
		height: 100vh;
		position: absolute;
		top: 0;
		left: 0;
		background-color: $uni-bg-color-mask;
		z-index: 2;
	}
	.swiper-box{
		height: 80vh;
	}
	.ipimg{
		width: 100vw;
		min-height: 100vw;
	}
	.img-swiper{
		padding-top: 20vh;
		z-index: 3;
	}
	.close-btn{
		position: absolute;
		top: 13vh;
		right: 3vh;
		z-index: 5000;
	}
	.upload-btn{
		position: absolute;
		top: 13vh;
		left: 3vh;
		z-index: 5000;
	}
	
	.swiper-dot{
		width: 40vw;
		margin: 0 auto;
		position: fixed;
		bottom: 20vh;
	}
	.swiper-dot-item{
		width: $uni-spacing-lg;
		height: $uni-spacing-lg;
		border-radius: $uni-border-radius-circle;
		background-color: $uni-text-color;
	}
	.swiper-dot-active{
		width: calc(3 * $uni-spacing-lg);
		background-color: $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.swiper-dot-active{
			background-color: $uni-color-dark-main;
		}
	}
</style>