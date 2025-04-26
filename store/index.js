import user from './modules/user'
import dialogue from './modules/dialogue'
import { createStore } from 'vuex'

const store = createStore({
	modules: {
		user,
		dialogue
	},
	state: {
	},
	mutations: {
		/*setData(state, {key, data}) {
			state[key] = data;
		}*/
	},
	getters: {},
	actions: {}
})

export default store
