<template>
	<view class="swiper-dot">
		<view class="display-flex" :style="dynamicViewWidth">
			<view v-for="(item, index) in list"
				:key="index" class="swiper-dot-item" :id="index"
				:class="{'swiper-dot-active': index == swiper_current}" @tap="clickItem"></view>
		</view>
	</view>
</template>

<script>
	export default{
		name: 'cybercafe-swiper-dot',//需要配合swiper组件服用
		props: {
			list: {
				type: Array
			},
			swiperCurrent: {
				type: Number | String,
				default: 0
			},
			position: {
				type: String,
				default: 'absolute', //relative
			}
		},
		data(){
			return{
				swiper_current: 0,
			}
		},
		watch:{
			swiperCurrent: {
                handler(newValue, oldValue) {
                    //console.log('New swiperCurrent:', newValue, 'Old:', oldValue);
                    this.swiper_current = newValue;
                },
                immediate: true, // 立即执行一次
                deep: true // 深度监听（可选）
            }
		},
		computed: {
			dynamicViewWidth(){
				return 'width:' + (( 2 * this.list.length + 1 ) * 20) + 'rpx;';//（2倍数量+1）*10
			},
		},
		methods: {
			clickItem(e){
				//console.log(e);
				if(e.currentTarget.id == this.swiper_current) return;
				this.swiper_current = e.currentTarget.id;
				this.$emit('tapDot', this.swiper_current);
			}
		}
	}
</script>

<style lang="scss">
	.swiper-dot > view{
		margin: 0 auto;
	}	
	.swiper-dot-item{
		width: calc(4 * $uni-spacing-sm);
		height: calc(4 * $uni-spacing-sm);
		border-radius: calc(2 * $uni-spacing-sm);
		background-color: $uni-color-secondary;
		margin-right: calc(3 * $uni-spacing-sm);
	}
	.swiper-dot-active{
		width: calc(12 * $uni-spacing-sm);
		background-color: $uni-color-main;
	}
	@media (prefers-color-scheme: dark) {
		.swiper-dot-active{
			background-color: $uni-color-dark-main;
		}
	}
</style>