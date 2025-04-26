import store from "@/store";
import request from "@/func/common/request";
import userBaseInfo from "@/func/user/userBaseInfo";
import incubatorBaseFun from "@/func/incubator/incubatorBaseFun";

export default {
	async beforeInit() {
		plus.navigator.setFullscreen(true);
		store.commit('user/getUserData');
		plus.nativeUI.setUIStyle(store.state.user.darkMode);
		
		request.getIp();
		
		if(store.state.user.isLogin == false){
			uni.reLaunch({
				url: '../login/login'
			})
		}else{
			userBaseInfo.userInit();
			//数据同步回填
			incubatorBaseFun.feedback();
		}
	},
}