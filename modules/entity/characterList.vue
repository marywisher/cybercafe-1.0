<template>
	<cybercafe-view ref="eCL" isAbsolute closeAble isScrollable 
		viewTitle="其他可选角色">
		<cybercafe-view v-for="(item, index) in character_list" :key="item.character_id">
			<view class="display-flex sp-between" @tap="selectCharacter(item.character_id)">
				<view>
					<image v-if="item.character_img && item.character_img != default_img"
						class="character-img" mode="aspectFill" :src="item.character_img"></image>
				</view>
				<view class="item-content">
					<view class="display-flex sp-between display-line">
						<view class="display-flex display-line">
							<view>{{item.character_name}}</view>
							<view v-if="item.character_gender == 1" class="iconfont icon-xingbienan"></view>
							<view v-if="item.character_gender == 2" class="iconfont icon-xingbienv"></view>
							<view v-if="item.character_gender == 0" class="iconfont icon-WuXingBie2"></view>
						</view>
					</view>
					<view class="display-flex item-character-line display-line hint item-description">
						{{item.short_description}}
					</view>
				</view>	
			</view>
		</cybercafe-view>
		<view v-show="!no_more" class="text-center hint" @tap="loadCharacter">—— 点击加载 ——</view>
		<view v-show="no_more" class="text-center hint">—— 没有更多了 ——</view>
	</cybercafe-view>
</template>

<script>
	import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import request from '@/func/common/request';
	import characterFun from '@/func/entity/characterFun';
	import dialogueQuery from '@/func/dbManager/dialogueQuery';
	import entityFun from '@/func/entity/entityFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'characterList',
		data(){
			return{
				character_list: [],
				next_page: 0,
				default_img: configData.defaultImg,
				no_more: false
			}
		},
		props: {
			exceptIds:{
				default: []
			}
		},
		computed: {
			...mapState('setting', ['userId']),
			...mapState('dialogue', ['selectedEntityId']),
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData']),
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(){
				this.loadCharacter();
				//后续再加上本机创建角色
				this.$refs.eCL.openView();
			},
			async loadCharacter(){
				console.log(this.next_page);
				let request_data = {
					aim_id: this.userId,
					type: 'new',
					limit: 10,
					except: this.exceptIds,//此处加上当前容器内的角色
					page: this.next_page
				};
				let result_data = await characterFun.loadList(request_data, 'entity');
				if(result_data.character_list.length == 0) this.no_more = true;
				//console.log(result_data);
				this.next_page = result_data.next_page;
				for (let i in result_data.character_list) {
					this.character_list.push(result_data.character_list[i]);
				}
				//console.log(this.character_list);
				this.$forceUpdate();
			},
			selectCharacter(character_online_id){
				let _self = this;
				this.setUserData({
					'modalData': {
						title: "温馨提醒",
						content: "将本角色载入容器吗？",
						confirmText: '确认载入',
						cancelText: "手滑了",
						success: (res) => {
							_self.fastAddCharacter(character_online_id);
						}
					},
					'modalShow': true,
					'modalPageId': 'entity'
				})
				//载入切片
				//返回切片id
				this.setDiaData({'selectedEntityId': 0});
				this.$refs.eCL.closeView();
			},
			async fastAddCharacter(character_online_id){
				let character_data = await characterFun.createCharacter(character_online_id, 'entity');
				entityFun.updateEntityDetail(character_data.character_id, this.selectedEntityId);
				this.$emit('addCharacter', character_data);
			}
		}
	}
</script>

<style lang="scss">
	.character-img{
		width: $uni-img-size-lg;
		height: $uni-img-size-lg;
		border-radius: $uni-border-radius-lg;
		margin-right: $uni-spacing-lg;
	}
	.item-content{
		width: 80%;
		line-height: $uni-font-size-lg;
	}
	.item-character-line{
		padding: $uni-spacing-base $uni-width-none;
	}
	.item-description{
		white-space:nowrap; 
		overflow:hidden; 
		text-overflow: ellipsis;
		width: 100%;
	}
</style>