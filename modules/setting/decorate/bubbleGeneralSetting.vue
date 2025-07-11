<template>
	<cybercafe-view>
		<view class="display-flex display-line">
			<view class="bubble-setting-label">字号：</view>
			<view class="bubble-setting-right">
				<slider v-show="show_slider" :value="fontSize" @change="fontSizeChange" activeColor="#E94E46"
					:block-size="20" min="10" max="40" step="2" show-value />
			</view>
		</view>
		<view class="display-flex display-line">
			<view class="bubble-setting-label"><label>气泡对齐：</label></view>
			<view class="bubble-setting-right">
				<switch :checked="bubbleAlign" style="transform:scale(0.6)" color="#E94E46" 
						@change="bubbleSetAlign" />
				<label>{{bubble_align_text}}</label>
			</view>
		</view>
		<view class="display-flex display-line">
			<view class="bubble-setting-label">头像宽度：</view>
			<view class="bubble-setting-right">
				<slider v-show="show_slider" :value="imgWidth" @change="imgWidthChange" activeColor="#E94E46"
					:block-size="20" min="10" max="80" step="2" show-value />
			</view>
		</view>
		<view class="display-flex display-line">
			<view class="bubble-setting-label">头像圆角：</view>
			<view class="bubble-setting-right">
				<slider v-show="show_slider" :value="imgRadius" @change="imgRadiusChange" activeColor="#E94E46"
					:block-size="20" min="0" :max="(imgWidth / 2)" step="1" show-value />
			</view>
		</view>
	</cybercafe-view>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "bubbleGeneralSetting",
		data(){
			return {
				bubble_align_text: '平铺',
				show_slider: true,
			}
		},
		computed: {
			...mapState('setting', ['bubbleAlign', 'fontSize', 'imgWidth', 'imgRadius']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			init(){
				this.getSettingData();
				if (this.bubbleAlign) {
					this.bubble_align_text = "平铺";
				} else {
					this.bubble_align_text = "居中";
				}
				uni.$on('patternGSSlider', (param) => {
					this.show_slider = param;
				})
			},
			fontSizeChange(e) {
				this.setSettingData({
					'fontSize': e.detail.value
				});
			},
			bubbleSetAlign(e) {
				this.setSettingData({
					'bubbleAlign': e.detail.value
				});
				if (this.bubbleAlign) {
					this.bubble_align_text = "平铺";
				} else {
					this.bubble_align_text = "居中";
				}
			},
			imgWidthChange(e) {
				this.setSettingData({
					'imgWidth': e.detail.value
				});
				if (this.imgRadius > this.imgWidth / 2)
					this.setSettingData({
						'imgRadius': this.imgWidth / 2
					});
			},
			imgRadiusChange(e) {
				this.setSettingData({
					'imgRadius': (e.detail.value > this.imgWidth / 2) ? this.imgWidth / 2 : e.detail.value
				});
			},
		}
	}
</script>

<style>
	.bubble-setting-label{
		width: 30vw;
	}
	.bubble-setting-right{
		width: 50vw;
	}
</style>