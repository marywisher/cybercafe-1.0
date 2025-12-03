<template>
	<view class="content text-center">
		<image class="logo" src="/static/logo.png"></image>
		<view >
			<text class="gradient-text">{{slogan}}</text>
		</view>
		<cybercafe-button v-if="network_type == 'none'" class="retry-btn"
			btnName="点击重试" btnFun="init"></cybercafe-button>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import sqlite from '@/func/common/sqlite';
	import handleFun from '@/func/common/handleFun';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default {
		data() {
			return {
				slogan: 'CyberCafe',
				loading_flag: false,
				network_type: 'none'
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
			async init(){
				//获取APP网络信息，不含H5
				this.network_type = await request.checkNetwork('index');
				if(this.network_type == 'none') return;
				
				sqlite.initTable();
				await handleFun.initSetting();
				
				//每日随机一个tip options.msg
				//console.log(options)
				setTimeout(() =>{
					handleFun.beforeInit('index');
				}, 500);
			}
		},
		onLoad() {
			this.init();
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
	.retry-btn{
		width: 50vw;
		margin: 30vh auto;
	}
</style>
