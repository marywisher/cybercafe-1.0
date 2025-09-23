<template>
	<view>
		<view class="hint required text-center" v-html="hint_str"></view>
		<cybercafe-view>
			<cybercafe-segmented-control :list="prompt_list" :currentIndex="crt_index" @selected="changeView">
				<view class="custom-prompt-part">
					<cybercafe-card cardTitle="系统提示词">
						<view class="hint text-right">{{crt_prompt && crt_prompt.系统提示词.value ? crt_prompt.系统提示词.value.length : 0}} 字</view>
						<textarea class="inner-ta" autoHeight v-model="crt_prompt.系统提示词.value" :cursor-spacing="150"
							:styles="dynamicStyle" placeholder="请输系统提示词" adjust-position  
							confirm-type="done" @confirm="autoSave('系统提示词', crt_prompt.系统提示词.value)"></textarea>
					</cybercafe-card>
					<cybercafe-card cardTitle="时间感知">
						<checkbox-group @change="timeChange">
							<view class="display-flex display-line sp-between">
								<view>
									<checkbox value="year" :backgroundColor="dynamicCkBgColor" :color="dynamicCkColor"
									:activeBackgroundColor="dynamicCkBgColor" :activeBorderColor="dynamicCkColor"
									:checked="checked[0]" />年
								</view>
								<view>
									<checkbox value="month" :backgroundColor="dynamicCkBgColor" :color="dynamicCkColor"
									:activeBackgroundColor="dynamicCkBgColor" :activeBorderColor="dynamicCkColor" 
									:checked="checked[1]" />月
								</view>
								<view>
									<checkbox value="day" :backgroundColor="dynamicCkBgColor" :color="dynamicCkColor"
									:activeBackgroundColor="dynamicCkBgColor" :activeBorderColor="dynamicCkColor" 
									:checked="checked[2]" />日
								</view>
							</view>
							<view class="display-flex display-line sp-between">
								<view>
									<checkbox value="time" :backgroundColor="dynamicCkBgColor" :color="dynamicCkColor"
									:activeBackgroundColor="dynamicCkBgColor" :activeBorderColor="dynamicCkColor" 
									:checked="checked[3]" />时间
								</view>
								<view>
									<checkbox value="week" :backgroundColor="dynamicCkBgColor" :color="dynamicCkColor"
									:activeBackgroundColor="dynamicCkBgColor" :activeBorderColor="dynamicCkColor" 
									:checked="checked[4]" />星期
								</view>
							</view>
						</checkbox-group>
					</cybercafe-card>
					<cybercafe-card v-for="(item, id) in crt_prompt" :key="id"
						v-if="id != '系统提示词' && id != '时间感知'" :cardTitle="id" icon="jianhao" 
						@iconFun="reduceDes" :iconParam="{'id': id}">
						<view class="hint text-right">{{item ? item.value.length : 0}} 字</view>
						<textarea class="inner-ta" autoHeight v-model="item.value" :cursor-spacing="150"
							:styles="dynamicStyle" placeholder="请输系统提示词" adjust-position  
							confirm-type="done" @confirm="autoSave(id, item.value)"></textarea>
					</cybercafe-card>
					<cybercafe-view>
						<view class="display-flex sp-between display-line">
							<view><input v-model="prompt_key" placeholder="请输入提示词项名" 
								confirm-type="done"  @confirm="toggleTaFun('show')"/></view>
							<view v-if="ta_show == false" class="iconfont icon-jiahao" @tap="toggleTaFun('show')"></view>
							<view v-else class="iconfont icon-jianhao" @tap="toggleTaFun('hide')"></view>
						</view>
						<view v-if="ta_show">
							<textarea class="inner-ta" autoHeight :cursor-spacing="150" v-model="prompt_value"
							 :styles="dynamicStyle" :placeholder="'请输入' + prompt_key + '内容'" adjust-position  
							 confirm-type="done" @confirm="addPrompt"></textarea>
						</view>
					</cybercafe-view>
				</view>
			</cybercafe-segmented-control>
		</cybercafe-view>
		
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data(){
			return{
				prompt_list: [
					{'title': '预设1', 'level': 1},
					{'title': '预设2', 'level': 2},
					{'title': '预设3', 'level': 2}
				],
				crt_index: 0,
				custom_prompt: [],
				crt_prompt: {},
				prompt_key: '',
				prompt_value: '',
				ta_show: false,
				checked: [false, false, false, false, false],
				hint_str: "所输内容<br/><br/> · <b>不得</b>违反国家法律法规<br/> · <b>不得</b>违背社会公序良俗<br/> · <b>不得</b>诱导生成危害公共安全的内容<br/><br/>违者<b>冻结账号</b><br/><br/>统一使用<b>{{user}}</b>或<b>你</b>指代主控，<b>{{char}}</b>或<b>他/她</b>指代角色"
			}
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'promptSetting'){
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
		onLoad() {
			this.init();
		},
		computed:{
			...mapState('setting', ['customPrompt', 'promptSelect']),
			...mapState('user', ['darkMode', 'modalData', 'userGroup']),
			dynamicStyle(){
				return this.darkMode == 'light' ? {backgroundColor: '#fff', color: '#333'} : 
					{backgroundColor: '#1f1f1f', color: '#999'};
			},
			dynamicCkBgColor(){
				return this.darkMode == 'light' ? '#fff' : '#1f1f1f';
			},
			dynamicCkColor(){
				return this.darkMode == 'light' ? '#E94E46' : '#C43830';
			}
		},
		methods:{
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(){
				//console.log(this.customPrompt);
				if(this.customPrompt.length > 0){
					for(let i in this.customPrompt){
						this.custom_prompt[i] = {};
						for(let j in this.customPrompt[i]){
							this.custom_prompt[i][j] = {
								'value': this.customPrompt[i][j]
							} 
						}
					}
				}else{
					this.custom_prompt = [];
				}
				this.loadPrompt();
			},
			loadPrompt(){
				this.crt_prompt = this.custom_prompt[this.crt_index];
				if(this.userGroup > 1 && this.promptSelect) this.crt_index = this.promptSelect;
				if(!this.crt_prompt){
					this.crt_prompt = {
						'系统提示词': {
							'value': ''
						},
						'时间感知': {
							'value': []
						}
					}
					this.checked = [false, false, false, false, false];
				}else if(this.crt_prompt.时间感知){
					//console.log(this.crt_prompt.时间感知)
					this.checked[0] = this.crt_prompt.时间感知.value.includes('year')
					this.checked[1] = this.crt_prompt.时间感知.value.includes('month')
					this.checked[2] = this.crt_prompt.时间感知.value.includes('day')
					this.checked[3] = this.crt_prompt.时间感知.value.includes('time')
					this.checked[4] = this.crt_prompt.时间感知.value.includes('week')
				}
				
				this.$forceUpdate();
				//console.log(this.custom_prompt)
			},
			changeView(index){
				this.crt_index = index;
				if(index > 0 && this.userGroup != 2){
					uni.showToast({
						'title': '开通月卡后可用',
						'icon': 'none'
					})
					setTimeout(() => {
						this.crt_index = 0;
					}, 1)
				}else{
					this.setSettingData({
						'promptSelect': this.crt_index
					})
					this.loadPrompt();
					this.toggleTaFun(false);
					uni.showToast({
						title: '预设已切换',
						icon: 'none'
					})
				}
			},
			addPrompt(){
				//console.log(this.prompt_key, this.prompt_value);
				this.prompt_value = this.prompt_value.trim();
				this.prompt_value = this.prompt_value.trim();
				if(this.prompt_key.length > 0 && this.prompt_value.length > 0){
					//this[key + '_description'][this.prompt_key] = this.prompt_value;
					this.autoSave(this.prompt_key, this.prompt_value);
					this.ta_show = false;
					this.prompt_key = '';
					this.prompt_value = '';
				}
			},
			reduceDes(param){
				//console.log(typeof param);
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "温馨提示",
						content: "本项删除后，不可找回",
						cancelText: "再想想",
						confirmText: "坚持删除",
						success: (res) => {
							if (res.confirm) {
								_self.autoSave(param.id, '');
								_self.$forceUpdate();
							}
						},
					},
				})
				this.$refs.cModal.show(this.modalData);
				//console.log(this.modalShow);
				this.$forceUpdate();
			},
			toggleTaFun(flag){
				//console.log(key, flag)
				this.ta_show = (flag == 'show');
				this.$forceUpdate();
			},
			autoSave(key, value){
				//console.log(key, value);
				let tmp_map = [];
				if(this.customPrompt.length > 0) tmp_map = this.customPrompt;
				if(value == ''){
					delete this.crt_prompt[key];
					delete tmp_map[this.crt_index][key];
				}else{
					if(this.customPrompt.length == 0){
						tmp_map[this.crt_index] = {};
					}
					if(!this.crt_prompt.hasOwnProperty(key)){
						this.crt_prompt[key] = {};
					}
					this.crt_prompt[key].value = value;
					tmp_map[this.crt_index][key] = value;
				}
				this.setSettingData({
					'customPrompt': tmp_map
				})
				uni.showToast({
					title: '数据已保存',
					icon: 'none'
				})
			},
			timeChange(e){
				this.autoSave('时间感知', e.target.value);
			}
		}
	}
</script>

<style lang="scss">
	input{
		max-width: 35vw;
	}
	textarea{
		line-height: calc(2 * $uni-font-size-lg);
	}
	.icon-jiahao{
		color: $uni-color-main;
	}
	.icon-jianhao{
		color: $uni-color-secondary;
	}
	.inner-ta{
		width: 90%;
	}
	.display-line{
		margin-bottom: $uni-spacing-base;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	.text-right{
		text-align: right;
	}
	@media (prefers-color-scheme: dark) {
		.icon-jiahao{
			color: $uni-color-dark-main;
		}
	}
</style>