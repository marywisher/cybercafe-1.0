<template>
	<cybercafe-view>
		<view v-html="md_data" :showline="false"></view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</cybercafe-view>
</template>

<script>
	import MarkdownIt from 'markdown-it';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data(){
			return {
				md_data: ''
			}
		},
		watch:{
			modalShow(newValue){
				if(newValue && this.modalPageId == 'info'){
					this.$refs.cModal.show(this.modalData);
					this.setUserData({
						'modalShow': false,
						'modalPageId': ''
					})
				}
			}
		},
		computed:{
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
		},
		methods:{
			...mapMutations('user', ['getUserData', 'setUserData']),
		},
		onLoad(options) {
			let param = options.p;
			const md = new MarkdownIt({
				html: true, // 启用HTML标签支持
			});
			let _self = this;
			request.post("userController/getVersionInfo", 'info', {}).then(res => {
				if (res.code == 200) {
					if(param == 'version'){
						_self.md_data = md.render(res.result.version_info);
					}else{
						_self.md_data = md.render(res.result.hello_info);
					}
				}else{
					uni.showToast({
						title: res.msg,
						icon: "none"
					});
				}
			});
		}
	}
</script>

<style>
</style>