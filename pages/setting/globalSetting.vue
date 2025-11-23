<template>
	<view>
		<globalSettingHeader></globalSettingHeader>
		<userinfo class="user-info-part" ref="gsUserinfo"></userinfo>
		<cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoCharacterList">
					<view class="global-setting-label">发现线上角色</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoEntityList">
					<view class="global-setting-label">查看容器</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
		</cybercafe-view>
		<cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line">
					<view class="global-setting-label">夜间模式</view>
					<view class="display-flex display-line">
						<switch :checked="darkMode == 'light'" color="#E94E46" style="transform:scale(0.6)"
							@change="turnLight"></switch>
						<label>{{light_label}}</label>
					</view>
				</view>			
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoBubble">
					<view class="global-setting-label">外观设置</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoAi">
					<view class="global-setting-label">大模型设置</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoPrompt">
					<view class="global-setting-label">提示词设置</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
		</cybercafe-view>
		<cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="uploadData">
					<view class="global-setting-label">上传数据</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>			
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="downloadData">
					<view class="global-setting-label">下载数据</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
			<cybercafe-view v-if="userId == 1">
				<view class="display-flex sp-between display-line" @tap="gotoData">
					<view class="global-setting-label">查看数据</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
		</cybercafe-view>
		<cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoInfo('using')">
					<view class="global-setting-label">使用说明</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>			
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoInfo('version')">
					<view class="global-setting-label">版本更新说明</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
			<cybercafe-view>
				<view class="display-flex sp-between display-line" @tap="gotoLogin">
					<view class="global-setting-label">退出账号</view>
					<span class="iconfont icon-xiayibu"></span>
				</view>
			</cybercafe-view>
			
			<view class="gs-info">最新版本：{{latestVersion}}</view>
			<view class="gs-info">当前版本：{{my_version}}</view>
			<cybercafe-button v-show="latestVersion > my_version" btnClass="btn-primary" 
				btnName="更新版本" @tapBtn="beforeUpdateVersion"></cybercafe-button>
		</cybercafe-view>
		<cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
	</view>
</template>

<script>
	import baseQuery from '@/func/dbManager/baseQuery';
	import userinfo from '@/modules/account/userinfo';
	import globalSettingHeader from '@/modules/account/globalSettingHeader';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		data(){
			return{
				light_label: '',
				my_version: ''
			}
		},
		components:{
			userinfo,
			globalSettingHeader
		},
		watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'globalSetting'){
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
		computed: {
			...mapState('user', ['aimId', 'latestVersion', 'modalData', 'modalPageId', 
			'modalShow']),
			...mapState('setting', ['darkMode', 'userId']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			uploadData(){
				baseQuery.syncDBUpload();
			},
			downloadData(){
				baseQuery.syncDBDownload();
			},
			turnLight(e){
				if(e.detail.value == true){
					this.setSettingData({
						darkMode: 'light'
					});
					plus.nativeUI.setUIStyle('light');
					this.light_label = '开灯中';
				}else{
					this.setSettingData({
						darkMode: 'dark'
					});
					plus.nativeUI.setUIStyle('dark');
					this.light_label = '关灯中';
				}
			},
			gotoData(){
				uni.navigateTo({
					url: '/pages/index/dataList'
				})
			},
			beforeUpdateVersion(){
				let _self = this;
				this.setUserData({
					'modalData': {
						content: "点击确定更新到最新版本",
						cancelText: "确定",
						confirmText: "取消",
						success: (res) => {
							if (res.confirm) {
								_self.updateVersion();
							}
						},
					},
					'modalShow': true,
					'modalPageId': 'globalSetting'
				})
			},
			updateVersion(){//升级安装包
				//如果要加进度条代码，参考 https://blog.csdn.net/m0_49714202/article/details/135017484
				uni.downloadFile({
					url: '',
					success: (res) => {
						if(res.statusCode == 200){
							uni.openDocument({
								filePath: res.tempFilePath,
								success() {
									
								}
							})
						}
					}
				})
			},
			gotoBubble(){
				uni.navigateTo({
					url: './decorateSetting'
				})
			},
			gotoAi(){
				uni.navigateTo({
					url: './aiSetting'
				})
			},
			gotoPrompt(){
				uni.navigateTo({
					url: './promptSetting'
				})
			},
			gotoInfo(param){
				uni.navigateTo({
					url: '../index/info?p=' + param
				})
			},
			gotoLogin(){
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},
			gotoCharacterList(){
				uni.navigateTo({
					url: '/pages/character/characterList'
				})
			},
			gotoEntityList(){
				uni.navigateTo({
					url: '/pages/entity/entityList'
				})
			}
		},
		onLoad() {
			/* if(this.darkMode != uni.getSystemInfoSync().hostTheme){//跟随系统
				this.setUserData({darkMode: uni.getSystemInfoSync().hostTheme})
			} */
			this.setUserData({
				'aimId': this.userId
			})
			if(this.darkMode == 'light'){
				this.light_label = '开灯中';
			}else{
				this.light_label = '关灯中';
			}
			//console.log(uni.getSystemInfoSync());
			this.my_version = uni.getSystemInfoSync().appWgtVersion;
			this.$nextTick(() => {
				this.$refs.gsUserinfo.initPage();
			});
		}
	}
</script>

<style lang="scss">
	.user-info-part{
		margin-top: calc($page-header-height + $uni-spacing-lg);
	}
	.global-setting-label{
		width: 30vw;
	}
	.modal-view{
		z-index: 999;
		top: 20vh;
	}
	.gs-info{
		padding: $uni-spacing-lg;
	}
</style>