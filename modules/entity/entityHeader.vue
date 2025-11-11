<template>
	<cybercafe-header :bgOpacity="bgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view class="iconfont icon-shanchu required" v-if="entityId > 0" @tap="delEntity"></view>
			<label class="hint" v-if="entityId > 0" @tap="delEntity">解散容器</label>
			<view class="iconfont icon-chatou" v-if="enterable" @tap="enterEntity"></view>
			<label class="hint" v-if="enterable" @tap="enterEntity">进入容器</label>
		</view>
	</cybercafe-header>
</template>

<script>
	import entityFun from '@/func/entity/entityFun';
	import baseQuery from '@/func/dbManager/baseQuery';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'entityHeader',
		data(){
			return{
				show_enter: false
			}
		},
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
			enterable: {
				type: Boolean,
				default: false
			}
		},
		watch:{
			entityId(newValue){
				this.getDetailCount();
			}
		},
		computed: {
			...mapState('setting', ['entityId']),
		},
		methods: {
			...mapMutations('setting', ['getSettingData']),
			init(){
				//this.getDetailCount();
			},
			back(){
				uni.navigateBack();
			},
			delEntity(){
				entityFun.delEntity('entity');
			},
			enterEntity(){
				entityFun.enterEntity();
			},
			/* async getDetailCount(){
				let detail_data = await baseQuery.getDataByKey('cybercafe_entity_detail',
					{'entity_id': this.entityId, 'detail_status': 1});
				//console.log(detail_data);
				if(detail_data.length > 0) this.show_enter = true;
			} */
		}
	}
</script>

<style lang="scss">
	.iconfont{
		font-size: calc(2 * $uni-font-size-sm);
	}
	.iconback{
		transform: rotate(180deg);
	}
	.icon-shanchu{
		font-size: calc(2 * $uni-font-size-mini);
	}
</style>