<template>
	<view>
		<view class="edit-link text-center"
			v-if="(patternStatus == 4 || patternStatus == 6) && !showCode" 
			@tap="chageMode">代码编辑</view>
		<view v-show="showCode">
			<cybercafe-view>
				<view>{{htmlPrev}}</view>
				<textarea autoHeight v-model="pattern_html" :maxlength="-1"
					placeholder="气泡单元HTML" :cursor-spacing="150"
					@blur="setPattern" confirm-hold></textarea>
				<view>{{htmlAfter}}</view>
				<label class="hint">{{html_hint}}</label>
			</cybercafe-view>
			<cybercafe-view>
				<view class="hint tips-hint required">请不要使用font-family或使用第三方的字体</view>
				<view class="hint tips-hint required">css代码里的引号用"而非'</view>
				<view>{{cssPrev}}</view>
				<textarea autoHeight v-model="pattern_css" :maxlength="-1"
					placeholder="气泡单元css" :cursor-spacing="150"
					@blur="setPattern" confirm-hold></textarea>
				<view>{{cssAfter}}</view>
			</cybercafe-view>
		</view>
	</view>
</template>

<script>
	import bubbleFun from '@/func/setting/bubbleFun';
	import common from '@/func/common/common';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: "patternCode",
		data() {
			return{
				html_hint: '{{text}}为内容文本，{{side}}为左右侧class值为left/right',
				pattern_html: '',
				pattern_css: '',
			}
		},
		computed: {
			...mapState('bubble', ['cssAfter', 'cssPrev', 'htmlAfter', 'htmlPrev',
				'patternCss', 'patternHtml', 'patternIndex', 'patternStatus', 'showCode']),
		},
		methods: {
			...mapMutations('bubble', ['getBubbleData', 'setBubbleData']),
			init(){
				this.pattern_html = this.patternHtml;
				this.pattern_css = this.patternCss;
			},
			chageMode(){
				this.setBubbleData({'showCode': true});
			},
			async setPattern(){
				this.setBubbleData({
					'patternHtml': this.pattern_html, 
					'patternCss': this.pattern_css,
				});
				await bubbleFun.loadPattern(this.patternIndex);
			},
		}
	}

</script>

<style lang="scss">
	textarea{
		width: 63vw;
		line-height: calc(2 * $uni-font-size-lg);
	}
	.edit-link{
		color: $uni-color-main;
		text-decoration: underline;
	}
	.tips-hint{
		line-height: calc(2 * $uni-font-size-base);
	}
	@media (prefers-color-scheme: dark) {
		.edit-link{
			color: $uni-color-dark-main;
		}
	}
</style>