import store from "@/store";
import request from "@/func/common/request";
import baseQuery from "@/func/dbManager/baseQuery";

export default {
	feedback
}

function feedback(){
	//incubator
	request.post("characterController/getIncubator", 'chat',
		{creater: store.state.user.userId}).then(res => {
		if (res.code == 200) {
			//console.log(res.result);
			for(let i = 0; i < res.result.length; i ++){
				let updateArr = {
					character_description: res.result[i].character_description,
					character_prologue: res.result[i].character_prologue,
					character_tag: res.result[i].character_tag,
					character_status: res.result[i].character_status
				};
				let whereArr = {
					character_name: res.result[i].character_name,
					character_status: 6
				};
				baseQuery.updateDataByKey('cybercafe_incubator', updateArr, whereArr);
			}
		} else {
			uni.showToast({
				title: res.msg,
				icon: "none"
			});
		}
	});
}