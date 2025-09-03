export default {
	namespaced: true,
	state: {
		me: '你',
		crtCharacterId: 0,//仅用于交互，不用来显示
		introduction: '',
		title: '',
		ai: 0,//模型的后台序号
		
		chatlist: [], //用于API传输的数据，只在character-part处更新， 删除时也要删
		characterlist: {}, //角色
		historylist: [], //对话
		options: [], //备选项
		
		messageTime: '', //时间戳
		prevMessageTime: '0', //上一个时间戳
		optionFlag: false, //用于optionFirst的刷新，及“消息提示”显示
		optionFirst: '', //最后一条记录
		editMode: false, //弹出编辑模块后，是否显示编辑框，只在3处更改状态
		openEdit: false, //是否弹出编辑模块
		blankMode: false, //是否纯手写模式
		resetFlag: false, //是否编辑框初始化
		refreshList: false, //刷新chat列表
		breakpointMessageId: 0, //用于记录下拉加载的断点
		
		entityImage: '',
		cDisplayId: 0,//crtCharaterId 仅用户list展示时
		aiSelect: '',//模型名，用于显示
		
		aiRange:{},//包括线上的名字和本地的名字
		entityMode: 'chat',//novel chat
		aiGroup:{},
	},
	getters: {},
	mutations: {
		setDiaData: function(state, obj){
			//console.log(JSON.stringify(data));
			Object.keys(obj).forEach(key => {
			    state[key] = obj[key]
			})
			uni.setStorageSync('chatData', state);
		},
		getDiaData: function(state){
			//console.log(uni.getStorageSync('chatData'));
			let data = uni.getStorageSync('chatData');
			Object.keys(data).forEach(key => {
			    state[key] = data[key]
			})
		},
	},
	actions: {}
}