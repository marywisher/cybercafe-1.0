export default {
	namespaced: true,
	state: {
		//主要放置非应用时使用的setting属性，用于bubble跨组件设置
		bubbleColor1: '',
		bubbleColor2: '',
		bubbleRefresh: false, //用于刷新前端样式
		cssPrev: '<style>',
		cssAfter: '</style>',
		displayCss: '',
		displayHtml: '',
		fontColor1: '',
		fontColor2: '',
		htmlPrev: '<div class="chat-line">',
		htmlAfter: '</div>',
		marketArr: [],
		nextId: 0,
		patternCss: '',
		patternHtml: '',
		patternIndex: 0,
		patternKey: '',
		patternName: '',
		patternRange: [],
		patternStatus: 4,//1下载 4草稿 6上架
		previewCss: '',
		sampleTextLeft: '这里是容器聊天内容效果预览',
		sampleTextRight: '没错，想预览容器聊天内容效果就在这里',
		searchKey: [],
		showCode: false,
	},
	getters: {},
	mutations: {
		setBubbleData: function(state, obj){
			Object.keys(obj).forEach(key => {
			    state[key] = obj[key]
			})
			uni.setStorageSync('bubble', state);
		},
		getBubbleData: function(state){
			//console.log(uni.getStorageSync('userInfo'));
			let data = uni.getStorageSync('bubble');
			Object.keys(data).forEach(key => {
			    state[key] = data[key]
			})
		}
	},
	actions: {}
}