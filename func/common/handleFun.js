import store from "@/store";
import request from "@/func/common/request";
import userBaseInfo from "@/func/user/userBaseInfo";
import incubatorBaseFun from "@/func/incubator/incubatorBaseFun";
import aiFun from "../setting/aiFun";

export default {
	async beforeInit() {
		//store.commit('user/setUserData', { 'modalShow': false });
		plus.navigator.setFullscreen(true);
		store.commit('user/getUserData');
		plus.nativeUI.setUIStyle(store.state.user.darkMode);
		//store.commit('user/setUserData', { 'isLogin': false });
		request.getIp();
		if(store.state.user.isLogin == false){
			uni.navigateTo({
				url: '../login/login'
			})
		}else{
			userBaseInfo.userInit();
			//数据同步回填
			incubatorBaseFun.feedback();
			//console.log('init');
			aiFun.getAiRange();
		}
	},
}