<template>
	<view>
		<cybercafe-card cardTitle="全局样式设置" :showDetail="show_detail" @toggleDetail="toggleDetail">
			<view class="display-flex display-line">
				<view class="global-setting-label">羁绊背景图：</view>
				<switch :checked="bgOpacity" style="transform:scale(0.6)" color="#E94E46"
					@change="turnOpacity"></switch>
				<label>{{opacity_label}}</label>
			</view>
			<view class="display-flex">
				<view class="hint required">清晰的背景图会使滚动截屏失效</view>
			</view>
			<view class="display-flex display-line">
				<view class="global-setting-label">页面模式</view>
				<switch :checked="entityMode == 'novel'" style="transform:scale(0.6)" color="#E94E46"
					@change="changeMode"/>
					{{ entity_mode_arr[entityMode] }}
			</view>
			<view class="display-flex">
				<label class="hint required">以下设置仅支持聊天模式，且需要气泡样式支持</label>
			</view>
			<view class="display-flex display-line">
				<view class="global-setting-label">气泡透明度</view>
				<view class="global-setting-right">
					<slider v-show="show_slide" min="0" max="1" step="0.1" :value="bubble_opacity" :show-value="true" 
						:disabled="entityMode == 'novel'" :block-size="20" @change="bubbleChange"
						:activeColor="(entityMode == 'novel' ? '#999' : '#E94E46')"/>
				</view>
			</view>
		</cybercafe-card>
	</view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: 'globalDecorateSetting',
		data() {
			return {
				show_detail: true,
				opacity_label: '',
				
				entity_mode_arr: {'novel': '小说模式',
				        'chat': '聊天模式'},
				bubble_opacity: 1,//气泡透明度
				show_slide: true,
			}
		},
		computed: {
			...mapState('user', ['settingOpen']),
			...mapState('dialogue', ['entityMode']),
			...mapState('setting', ['bgOpacity', 'bubbleOpacity']),
		},
		methods: {
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			toggleDetail(param){
				this.show_detail = param;
				
				let tmp = this.settingOpen;
				tmp.global = this.show_detail;
				this.setUserData({'settingOpen': tmp});
			},
			init(){
				this.getUserData();
				this.getDiaData();
				this.getSettingData();
				if(this.settingOpen.global) this.show_detail = true;
				else this.show_detail = false;
				if(this.bgOpacity) this.opacity_label = '清晰';
				else this.opacity_label = '模糊';
				this.bubble_opacity = this.bubbleOpacity;
				//console.log(this.bubble_opacity);
				uni.$on('globalDSSlider', (param) => {
					this.show_slide = param;
				})
			},
			turnOpacity(e){
				this.setSettingData({
					'bgOpacity': e.detail.value
				});
				if(e.detail.value == true){
					this.opacity_label = '清晰';
				}else{
					this.opacity_label = '模糊';
				}
			},
			changeMode(e){
				//console.log(e);
				let tmp_mode = 'chat';
				if(e.detail.value == true) tmp_mode = 'novel';
				this.setDiaData({'entityMode': tmp_mode});
				//console.log(this.entityMode);
				
				this.updateSetting();
			},
			bubbleChange(e){
				this.bubble_opacity = e.detail.value;
				this.setSettingData({'bubbleOpacity': this.bubble_opacity});
			},
			updateSetting(){
				request.post('entityController/setEntitySetting', 'decorateSetting', {
					mode: this.entityMode
				}).then(res => {
					//console.log(res.result);
					if (res.code == 200) {
					}else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				}).catch(e => {
					console.log(e);
				});
				
				baseQuery.updateDataByKey('cybercafe_entity', {
					'entityMode': this.entityMode,
				}, {})
			},
		},
	}
</script>

<style>
	.global-setting-label{
		width: 30vw;
	}
	.global-setting-right{
		width: 50vw;
	}
</style>