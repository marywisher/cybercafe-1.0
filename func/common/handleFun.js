import store from "@/store";
import request from "@/func/common/request";
import userFun from "@/func/user/userFun";
import responseFun from "../entity/responseFun";

export default {
	async beforeInit() {
		//store.commit('user/setUserData', { 'modalShow': false });
		plus.navigator.setFullscreen(true);
		store.commit('user/getUserData');
		store.commit('setting/getSettingData');
		console.log(store.state.setting.userId, store.state.setting.token, store.state.setting.isLogin);
		plus.nativeUI.setUIStyle(store.state.user.darkMode);
		//store.commit('setting/setSettingData', { 'isLogin': false });
		if(store.state.setting.userId == 0){
			uni.navigateTo({
				url: '../login/login'
			})
		}else{
			request.getIp();
			await userFun.userInit();
		}
	},
	afterResponseFun(rel) {
		responseFun.responseToOptions(rel);
	}
}