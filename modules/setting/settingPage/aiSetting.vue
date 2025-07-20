<template>
	<cybercafe-card cardTitle="内置模型">
		<cybercafe-card v-for="(gitem, gindex) in group" :key="gindex" :cardTitle="gitem.groupName + gitem.cnName">
			<!-- <a v-if="gitem.url" :href="gitem.url" target="_blank">官网链接</a> -->
			<cybercafe-view v-for="(item, index) in gitem.models" :key="index"
				:crtView="item.id == ai" :selectView="select_id != ai && select_id == item.id"
				:disabledView="!item.enabled" popViewStyle="position:relative;">
				<view @tap="selectItem(item)">
					<view class="display-flex sp-between">
						<view>{{item.nickName}}</view>
						<view>{{item.price}}</view>
					</view>
					<view v-if="item.enabled" class="display-flex sp-between">
						<view class="hint">
							<switch :checked="item.showInMenu" style="transform:scale(0.4)" color="#E94E46" 
								@change="changeShowInMenu(gindex, index, item.id)" />
							{{ item.switchText }}
						</view>
						<!-- <view v-if="item.showInMenu" class="hint">序</view> -->
					</view>
					<view v-if="item.id != 200" class="hint">模型官方名称：{{item.name}}</view>
					<view class="hint">{{item.description}}</view>
					<cybercafe-button btnClass="btn-primary" @btnClick="showModal" btnName="切换"
						btnStyle="position: absolute; bottom: 3px; right: 3px; z-index: 2;" 
						v-if="select_id != ai && select_id == item.id"></cybercafe-button>
					<view v-if="item.level == 2" class="vip-hint">仅供月卡</view>
					<view v-else-if="!item.enabled" class="vip-hint">请联系管理员开通</view>
				</view>
			</cybercafe-view>
		</cybercafe-card>
	</cybercafe-card>
</template>

<script>
	import aiFun from '@/func/setting/aiFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		name: 'aiSetting',
		data(){
			return {
				group: {},
				select_id: -1
			}
		},
		watch:{
			ai(newValue){
				this.select_id = -1;
			}
		},
		computed:{
			...mapState('user', ['modalData', 'modalShow']),
			...mapState('dialogue', ['ai', 'aiGroup', 'aiRange']),
			...mapState('setting', ['aiShowInMenu']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			init(){
				//console.log(this.aiGroup);
				//console.log(this.aiRange);
				const sortedKeys = Object.keys(this.aiGroup).sort((a, b) => {
					return a.localeCompare(b, undefined, {numeric: true});
				});					
				// 然后按照排序后的键访问对象
				sortedKeys.forEach(i => {
					//console.log(i);
					let model = {};
					for(let j in this.aiGroup[i].models){
						let aiId = this.aiGroup[i].models[j].id;
						if(!this.aiRange.hasOwnProperty(aiId) || this.aiRange[aiId].builtIn == 'no-built') continue;
						let ai = {
							'id': this.aiRange[aiId].id,
							'name': this.aiRange[aiId].name,
							'nickName': this.aiRange[aiId].nickName,
							'price': this.aiRange[aiId].price,
							'description': this.aiRange[aiId].description,
							'crt': aiId == this.ai,
							'level': aiId == 200 ? 2 : this.aiRange[aiId].level,
							'enabled': this.aiRange[aiId].enabled,
							'showInMenu': this.aiRange[aiId].enabled ? this.aiShowInMenu[aiId] : false,
							'switchText': this.aiShowInMenu[aiId] ? '显示于快捷菜单' : '不显示'
						};
						model[j] = ai;
						//console.log(model);
					}
					//console.log(model);
					if(Object.keys(model).length > 0){
						this.group[i] = {
							'groupName': this.aiGroup[i].groupName,
							'cnName': this.aiGroup[i].cnName,
							'url': this.aiGroup[i].url,
							'models': model
						}
					}
				});
				//console.log(this.group);
				
				this.$forceUpdate();
			},
			selectItem(item){
				if(!item.enabled) return;
				this.select_id = item.id;
				uni.$emit('toggleTTT', false);
			},
			changeShowInMenu(gid, iid, id){
				//console.log(gid, id);
				let arr = this.aiShowInMenu;
				if(arr[id]) arr[id] = false;
				else arr[id] = true;
				this.setSettingData({
					'aiShowInMenu': arr
				});
				this.group[gid].models[iid].switchText = arr[id] ? '显示于快捷菜单' : '不显示';
				this.group[gid].models[iid].showInMenu = arr[id];
				//console.log(this.aiShowInMenu);
				uni.showToast({
					title: '此设置重启后生效',
					icon: 'none'
				})
			},
			showModal(){
				//console.log(this.select_id)
				let _self = this;
				this.setUserData({
					'modalData': {
						content: "要切换到选中的大模型吗？",
						cancelText: "放弃",
						confirmText: "切换",
						success: (res) => {
							if (res.confirm) {
								aiFun.changeAi(_self.select_id);
								uni.$emit('toggleTTT', true);
							}
						},
					},
					'modalShow': true,
				});
				uni.$emit('openModal');
				//console.log(this.modalShow)
			},
		}
	}
</script>

<style>
</style>