<template>
	<cybercafe-card cardTitle="参数设置">
		<view class="display-flex sp-between display-line">
			<view class="ai-setting-label">temperature</view>
			<view class="ai-setting-right">
				<slider :value="temperature_value" @change="temperatureChange" min="0" max="1"
					 :activeColor="(disable_flag ? '#999' : '#E94E46')" :disabled="disable_flag" step="0.05" show-value />
			</view>
		</view>
		<view class="hint">全局调温器：数值越大生成文本越多样性，越富有创意</view>
		<br>
		<view class="display-flex sp-between display-line">
			<view class="ai-setting-label">top_p</view>
			<view class="ai-setting-right">
				<slider :value="topp_value" @change="toppChange" min="0" max="1"
					 :activeColor="(disable_flag ? '#999' : '#E94E46')" :disabled="disable_flag" step="0.05" show-value />
			</view>
		</view>
		<view class="hint">智能过滤器：数值越小词合集长尾裁剪越多，越靠谱</view>
		<br>
		<view class="display-flex sp-between display-line">
			<view class="ai-setting-label">最大token数</view>
			<view class="ai-setting-right">
				<slider :value="token_value" @change="tokenChange" min="0" :max="maxtoken"
					 :activeColor="(disable_flag ? '#999' : '#E94E46')" :disabled="disable_flag" step="100" show-value />
			</view>
		</view>
		<view class="hint">当前大模型支持最大token数为{{maxtoken}}</view>
	</cybercafe-card>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: 'tttSetting',
		props:{
			enable:{
				type: Boolean,
				default: true
			}
		},
		data(){
			return {
				temperature_value: 0.95,
				topp_value: 0.5,
				token_value: 4096,
				maxtoken: 4096,
				disable_flag: false,
			}
		},
		watch:{
			ai(newValue){
				console.log(newValue);
				this.maxtoken = this.aiRange[this.ai].maxTokens
				console.log(this.maxtoken);
				if(this.token_value > this.maxtoken) this.token_value = this.maxtoken
				this.setSettingData({
					'maxToken': this.maxtoken,
					'tokenSetting': this.token_value
				})
			},
			enable(newValue){
				console.log(newValue);
				this.disable_flag = !newValue;
			}
		},
		computed:{
			...mapState('setting', ['maxToken', 'temperature', 'tokenSetting', 'topP']),
			...mapState('dialogue', ['ai', 'aiRange']),
		},
		methods:{
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			...mapMutations('dialogue', ['getDiaData']),
			init(){
				this.temperature_value = this.temperature;
				this.topp_value = this.top_p;
				this.maxtoken = this.maxToken ? this.maxToken : this.aiRange[this.ai].maxTokens;
				if(this.token_value > this.maxtoken) this.token_value = this.maxtoken;
				this.setSettingData({
					'tokenSetting': this.token_value
				})
			},
			temperatureChange(e){
				this.temperature_value = e.detail.value;
				this.setSettingData({
					'temperature': e.detail.value
				})
			},
			toppChange(e){
				this.topp_value = e.detail.value;
				this.setSettingData({
					'topP': e.detail.value
				})
			},
			tokenChange(e){
				this.token_value = e.detail.value;
				this.setSettingData({
					'tokenSetting': e.detail.value
				})
			}
		}
	}
</script>

<style>
</style>