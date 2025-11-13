<template>
	<view>
		<label class="hint">色值支持格式：#ffffff 或 rgb(255,255,255)</label><br>
		<label class="hint">若要气泡支持透明度：</label><br>
		<label class="hint">{{bg_color_hint}}</label><br>
		<label class="hint">以下灰色部分，为css内变量引用的写法</label>
		<view class="display-flex display-line">
			<view class="bubble-setting-label">字色1：<br>
				<label class="hint">{{param_hint_font1}}</label>
			</view>
			<view>
				<input v-model="font_color1" confirm-type="done"  
				@blur="setPattern" @confirm="setPattern"/>
			</view>
		</view>
		<view class="display-flex display-line">
			<view class="bubble-setting-label">气泡色1：<br>
				<label class="hint">{{param_hint_bg1}}</label>
			</view>
			<view>
				<input v-model="bubble_color1" confirm-type="done"  
				@blur="setPattern" @confirm="setPattern"/>
			</view>
		</view>
		<view class="display-flex display-line">
			<view class="bubble-setting-label">字色2：<br>
				<label class="hint">{{param_hint_font2}}</label>
			</view>
			<view>
				<input v-model="font_color2" confirm-type="done"  
				@blur="setPattern" @confirm="setPattern"/>
			</view>
		</view>
		<view class="display-flex display-line">
			<view class="bubble-setting-label">气泡色2：<br>
				<label class="hint">{{param_hint_bg2}}</label>
			</view>
			<view>
				<input v-model="bubble_color2" confirm-type="done"  
				@blur="setPattern" @confirm="setPattern"/>
			</view>
		</view>
		<label class="hint">点击输入框外空白处查看样式生效预览</label>		
	</view>
</template>

<script>
	import bubbleFun from '@/func/setting/bubbleFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "bubbleColorSetting",
		data(){
			return{
				bg_color_hint: 'rgba(255,255,255,{{bubbleOpacity}})',
				param_hint_font1: '{{color1}}',
				param_hint_font2: '{{color2}}',
				param_hint_bg1: '{{bg-color1}}',
				param_hint_bg2: '{{bg-color2}}',
				
				font_color1: '',
				font_color2: '',
				bubble_color1: '',
				bubble_color2: '',
			}
		},
		computed: {
			...mapState('bubble', ['bubbleColor1', 'bubbleColor2',
				'fontColor1', 'fontColor2', 
				'patternIndex']),
		},
		methods: {
			...mapMutations('bubble', ['getBubbleData', 'setBubbleData']),
			init(){
				this.getBubbleData();
				this.font_color1 = this.fontColor1;
				this.font_color2 = this.fontColor2;
							
				this.bubble_color1 = this.bubbleColor1;
				this.bubble_color2 = this.bubbleColor2;
			},
			async setPattern(){
				this.setBubbleData({
					'fontColor1': this.font_color1, 
					'fontColor2': this.font_color2, 
					'bubbleColor1': this.bubble_color1, 
					'bubbleColor2': this.bubble_color2,
				});
				await bubbleFun.loadPattern(this.patternIndex);
				this.$forceUpdate();
			},
		}
	}
</script>

<style lang="scss">
	.display-line{
		margin-bottom: $uni-spacing-base;
	}
	.bubble-setting-label{
		line-height: $uni-font-size-base;
		width: 30vw;
	}
</style>