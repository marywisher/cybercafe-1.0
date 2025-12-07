import baseQuery from "@/func/dbManager/baseQuery";

export default {
	namespaced: true,
	state: {
		aiShowInMenu: {}, //内置大模型要否显示在快捷菜单
		bgOpacity: false, //false 适用于滚动截屏
		bubbleAlign: true,
		bubbleColor: ['rgba(204,204,204, {{bubbleOpacity}})', 'rgba(204,204,204,{{bubbleOpacity}})'],
		bubbleOpacity: 1,//气泡透明度
		chatCss: '<style>.chat-line .chat-bubble{background-color: {{bg-color1}};	padding: 10px 15px;	line-height: 1.5;	border-radius: 5px;}</style>',
		chatFgCss: '',
		chatHtml: '<div class="chat-bubble {{side}}">{{text}}</div>',
		chatPattern: 1,
		customApi: [],
		customPrompt: [{"系统提示词": "你是一个高智商人类，善于深度揣测人心。按照故事背景、人物性格等设定续写故事，主动创造戏剧冲突推进剧情。你的角色叫{{char}}。", "输出限制": "不要替{{char}}以外的角色思考或说话", "输出格式": "（{{char}}的细腻动作描写、神态描写，{{char}}的心理描写，周遭的景物描写）{{char}}的对话内容（推动剧情发展的其它描写）"}],
		darkMode: 'light',
		editContent: {}, //编辑的内容,{entityId: txt,}
		entityId: 1,
		fontColor: ['rgb(52,52,52)', 'rgb(52,52,52)'],
		fontSize: 14,
		globalTreeOrder: '[{"id":1,"title":"故事背景","enable":true},{"id":2,"title":"简介","enable":true},{"id":3,"title":"补充说明","enable":true},{"id":4,"title":"聊天记录","enable":false}]',
		groupExpiration: '',
		imgRadius: 20,
		imgWidth: 40,
		ip: '',
		ippos: '未知',
		isLogin: false,
		maxToken: 4096,
		promptLength: 0,//基础提示词长度
		promptSelect: 0, //预设
		replyMode: 'click', // 自动auto 手动点击click 回复方式
		temperature: 0.95,
		tips: ['升级食堂不用先卸载', '如果需要卸载食堂要记得先上传数据', '角色载入本地后数据都是在本地的'],
		token: '',
		tokenSetting: 4096, //用户设置的token，显示时不得大于该大模型的max_token
		topP: 0.5,
		userId: 0,
	},
	getters: {},
	mutations: {
		setSettingData: function(state, obj){
			Object.keys(obj).forEach(key => {
			    state[key] = obj[key]
				baseQuery.updateDataByKey('cybercafe_setting',
					{setting_value: JSON.stringify(obj[key])},
					{setting_key: key});
			})
			uni.setStorageSync('setting', state);
			//console.log('setSettingData', key, data)
			//console.log('ready to update')
			//console.log('updated')
		},
		setSettingStore: function(state, obj){
			Object.keys(obj).forEach(key => {
			    state[key] = obj[key]
			})
			uni.setStorageSync('setting', state);
		},
		getSettingData: function(state){
			let data = uni.getStorageSync('setting');
			Object.keys(data).forEach(key => {
			    state[key] = data[key]
			})
		},
	},
	actions: {}
}