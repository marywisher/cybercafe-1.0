<template>
	<view class="content text-center">
		<image class="logo" src="/static/logo.png"></image>
		<view >
			<text class="gradient-text">{{slogan}}</text>
		</view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import sqlite from '@/func/common/sqlite';
	import handleFun from '@/func/common/handleFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		data() {
			return {
				slogan: 'CyberCafe',
				loading_flag: false
			}
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'index'){
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
		computed:{
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
		},
		onLoad() {
			sqlite.initTable();
			//每日随机一个tip options.msg
			//console.log(options)
			setTimeout(() =>{
				handleFun.beforeInit();
			}, 500);
		},
	}
</script>

<style lang="scss">
	.logo{
		margin-top: 30vh;
		width: 108px;
		height: 108px;
	}
	.gradient-text {
	    display: inline-block; /* 或者其他使文字成为块级元素的方式 */
	    background-image: linear-gradient(to right, $uni-color-main, $uni-color-secondary); /* 渐变方向和颜色 */
	    -webkit-background-clip: text; /* 只显示背景的文本部分 */
	    color: transparent; /* 文字颜色设为透明，使背景色显示 */
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
</style>
