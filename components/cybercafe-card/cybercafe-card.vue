<template>
	<view class="group-item">
		<view class="display-flex sp-between display-line">
			<view class="display-flex display-line">
				<label class="group-title" @tap="openDetail">{{cardTitle}}</label>
				<view v-if="icon.length > 0" class="iconfont" :class="'icon-' + icon" 
					@tap="iconFun"></view>
			</view>
			<view v-if="show_detail" class="iconfont icon-xiayibu iconshouqi" @tap="openDetail"></view>
			<view v-else class="iconfont icon-xiayibu iconxiala" @tap="openDetail"></view>
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
			},
			icon: {
				type: String,
				default: ''
			},
			iconParam: {
				type: Object,
				default: function(){
					return {}
				}
			}
		},
		data(){
			return{
				show_detail: true
			}
		},
		watch:{
			showDetail(newValue){
				//console.log('34:', newValue)
				this.show_detail = newValue;
			}
		},
		methods: {
			openDetail(){
				if(this.show_detail) this.show_detail = false;
				else this.show_detail = true;
				this.$emit('toggleDetail', this.show_detail);
			},
			iconFun(){
				this.$emit('iconFun', this.iconParam);
			}
		}
	}
</script>

<style lang="scss">
	.group-title {
		font-weight: bold;
		font-size: $uni-font-size-huge;
		margin-right: $uni-spacing-base;
	}
	.iconshouqi{
		transform: rotate(-90deg);
	}
	.iconxiala{
		transform: rotate(-90deg);
	}
</style>