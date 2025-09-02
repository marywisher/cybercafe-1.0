<template>
	<view class="display-flex">
		<view>
			<view v-for="(item, index) in list" :key="index" class="text-center left-item" 
				:class="{'left-crt': current_index == index, 'for-group2': item.level}" @tap="scrollTo(index)">
				{{item.title}}<span v-if="item.level == 2" class="hint">（仅供月卡）</span>
			</view>
		</view>
		<view class="right-item">
			<slot/>
		</view>
	</view>
</template>

<script>
	export default{
		name: 'cybercafe-segmented-control',
		data(){
			return{
				current_index: 0
			}
		},
		props:{
			list: {
				type: Array,
				required: true
			},
			currentIndex: {
				type: Number,
				default: 0
			}
		},
		watch:{
			currentIndex(newValue){
				//console.log(newValue);
				this.current_index = newValue
			}
		},
		methods: {
			scrollTo(index){
				/* let _self = this;
				uni.pageScrollTo({
					selector: '.right-item' + index,
					duration: 100,
					success: () => {
						//console.log(_self.maxHeight)
						_self.current_index = index;
					},
				}) */
				this.current_index = index;
				this.$emit('selected', index);
			}
		}
	}
</script>

<style lang="scss">
	.left-item{
		padding: $uni-spacing-lg $uni-spacing-base;
		border: $uni-border-base solid $uni-text-color-grey;
		width: 15vw;
		border-radius: $uni-border-radius-lg $uni-width-none $uni-width-none $uni-border-radius-lg;
		border-right: $uni-width-none;
		line-height: $uni-font-size-base;
		color: $uni-text-color-placeholder;
	}
	.left-item .hint{
		font-size: $uni-font-size-mini;
		line-height: $uni-font-size-mini;
	}
	.left-crt{
		background-color: $uni-color-main;
		color: $uni-bg-color;
		border-color: $uni-color-main;
	}
	.left-crt .hint{
		color: $uni-bg-color;
	}
	.right-item{
		width: 65vw;
		padding: $uni-spacing-lg;
		border: $uni-border-base solid $uni-text-color-grey;
		border-radius: $uni-width-none $uni-border-radius-lg $uni-border-radius-lg;
	}
</style>