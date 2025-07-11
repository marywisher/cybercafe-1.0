import user from './modules/user'
import dialogue from './modules/dialogue'
import setting from './modules/setting'
import bubble from './modules/bubble'
// #ifndef VUE3
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
// #endif
// #ifdef VUE3
import {
	createStore
} from 'vuex'
const store = createStore({
// #endif
	modules: {
		user,
		dialogue,
		setting,
		bubble
	},
	state: {},
	mutations: {
		/*setData(state, {key, data}) {
			state[key] = data;
		}*/
	},
	getters: {},
	actions: {}
})

export default store