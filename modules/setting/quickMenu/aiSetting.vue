<template>
	<view>
		<cybercafe-view class="pop-view" ref="popView" isAbsolute isScrollable closeAble viewTitle="备选大模型">
			<cybercafe-view v-for="(item, index) in range" :key="item.id"
				:id="item.id" :crtView="item.id == ai" :selectView="select_id != ai && select_id == item.id"
				:disabledView="!item.enabled" popViewStyle="position:relative;">
				<view @tap="selectItem(item.id)">
					<view class="display-flex sp-between">
						<view>{{item.nickName}}</view>
						<view>{{item.price}}</view>
					</view>
					<view v-if="item.id != 200" class="hint">模型官方名称：{{item.name}}</view>
					<view class="hint">{{item.description}}</view>
					<cybercafe-button btnClass="btn-primary" @btnClick="showModal" btnName="切换"
						btnStyle="position: absolute; bottom: 3px; right: 3px; z-index: 2;" 
						v-if="select_id != ai && select_id == item.id"></cybercafe-button>
					<view v-if="item.level == 2" class="vip-hint">仅供月卡</view>
				</view>
			</cybercafe-view>
		</cybercafe-view>
	</view>
</template>

<script>
	import aiFun from '@/func/setting/aiFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'aiSetting',
		data(){
			return{
				range: {},
				select_id: -1,
			}
		},
		watch:{
			aiRange(newValue){
				//console.log(newValue);
				if(newValue != {}){
					for(let it in newValue){
						//console.log(it, this.aiShowInMenu[it]);
						if(!this.aiShowInMenu[it]) continue;
						this.range[it] = {
							'id': newValue[it].id,
							'name': newValue[it].name,
							'nickName': newValue[it].nickName,
							'price': newValue[it].price,
							'description': newValue[it].description,
							'crt': it == this.ai,
							'level': it == 200 ? 2 : newValue[it].level,
							'enabled': newValue[it].enabled
						};
					}
					this.$forceUpdate();
				}
			},
		},
		computed:{
			...mapState('user', ['modalData', 'modalShow']),
			...mapState('dialogue', ['ai', 'aiRange']),
			...mapState('setting', ['aiShowInMenu']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('dialogue', ['getDiaData']),
			...mapMutations('setting', ['getSettingData']),
			selectItem(id){
				if(this.aiRange[id].enabled == false) return;
				this.select_id = id;
				this.$forceUpdate();
			},
			closeView(){
				this.$refs.popView.closeView();
			},
			openView(){
				uni.$emit('closeRightMenu');
				this.$refs.popView.openView();
			},
			showModal(){
				let _self = this;
				this.setUserData({
					'modalData': {
						content: "要切换到选中的大模型吗？",
						cancelText: "放弃",
						confirmText: "切换",
						success: (res) => {
							if (res.confirm) {
								aiFun.changeAi(_self.select_id);
								_self.closeView();
							}
						},
					},
					'modalShow': true,
				});
			},
		},
	}
</script>

<style lang="scss">
	.pop-view{
		position: fixed;
		top: 0;
		left: 0;
		z-index: 2;
	}
	.vip-hint{
		position: absolute;
		bottom: $uni-spacing-sm;
		right: $uni-spacing-sm;
		color: $uni-text-color-disable;
		font-size: $uni-font-size-mini;
	}
	@media (prefers-color-scheme: dark) {
		
	}
</style>