import store from "@/store";
import request from "@/func/common/request";
import userFun from "@/func/user/userFun";
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
			await userFun.userInit();
		}
	},
	afterResponseFun(rel) {
		responseFun.responseToOptions(rel);
	}
}