<template>
	<view class="group-item">
		<view class="display-flex sp-between" @tap="openDetail">
			<label class="group-title">{{cardTitle}}</label>
			<view v-if="show_detail" class="iconfont icon-shouqi"></view>
			<view v-else class="iconfont icon-xiala"></view>
		</view>
		<view v-if="show_detail">
			<slot></slot>
		</view>		
	</view>
</template>

<script>
	export default{
		name: 'cybercafe-card',
		props:{
			showDetail: {
				type: Boolean,
				default: false
			},
			cardTitle: {
				type: String,
				default: ''
			}
		},
		data(){
			return{
				show_detail: true
			}
		},
		watch:{
			showDetail(newValue){
				console.log('34:', newValue)
				this.show_detail = newValue;
			}
		},
		methods: {
			openDetail(){
				if(this.show_detail) this.show_detail = false;
				else this.show_detail = true;
				this.$emit('toggleDetail', this.show_detail);
			}
		}
	}
</script>

<style lang="scss">
	.group-title {
		font-weight: bold;
		font-size: $uni-font-size-huge;
	}
</style>