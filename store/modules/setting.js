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
		customApiKey: '',
		customDomain: '',
		customModel: '',
		customParsedUrl: '',
		editContent: {}, //编辑的内容,{entityId: txt,}
		entityId: 1,
		fontColor: ['rgb(52,52,52)', 'rgb(52,52,52)'],
		fontSize: 14,
		globalTreeOrder: '[{"id":1,"title":"故事背景","enable":true},{"id":2,"title":"简介","enable":true},{"id":3,"title":"补充说明","enable":true},{"id":4,"title":"聊天记录","enable":false}]',
		imgRadius: 20,
		imgWidth: 40,
		maxToken: 4096,
		temperature: 0.95,
		topP: 0.5,
		tokenSetting: 4096, //用户设置的token，显示时不得大于该大模型的max_token
		replyMode: 'click', // 自动auto 手动点击click 回复方式
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