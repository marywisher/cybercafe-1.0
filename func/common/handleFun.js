import store from "@/store";
import request from "@/func/common/request";
import userFun from "@/func/user/userFun";
import incubatorFun from "@/func/incubator/incubatorFun";
import aiFun from "../setting/aiFun";
import responseFun from "../entity/responseFun";

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
			incubatorFun.feedback();
			//console.log('init');
			aiFun.getAiRange();
		}
	},
	afterResponseFun(rel) {
		responseFun.responseToOptions(rel);
	}
}