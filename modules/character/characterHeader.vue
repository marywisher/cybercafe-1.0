<template>
	<cybercafe-header :bgOpacity="bgOpacity">
		<view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
		<view class="header-right display-flex display-line">
			<view v-if="character_id > 0" class="iconfont icon-chatou" @tap="enterEntity"></view>
			<label v-if="character_id > 0" class="hint" @tap="enterEntity">进入容器</label>
			<view class="iconfont icon-geren"></view>
			<label class="hint">存为本地角色</label><!-- :img="img" :imgOpacity="imgOpacity" -->
		</view>
	</cybercafe-header>
</template>

<script>
	export default{
		name: 'characterHeader',
		data(){
			return{
				character_id: 0
			}
		},
		props: {
			bgOpacity: {
				type: Number,
				default: 0
			},
			img: {
				type: String,
				default: ''
			},
			imgOpacity:{
				type: Number,
				default: 0
			},
		},
		methods: {
			init(character_id){
				this.character_id = character_id;
			},
			back(){
				uni.navigateBack();
			},
			enterEntity(){
				this.$emit('tapEnter');
			}
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
	.header-right .hint{
		margin-right: $uni-spacing-lg;
	}
</style>