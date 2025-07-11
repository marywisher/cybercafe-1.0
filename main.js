import store from '@/store'
import App from '@/App'

// #ifndef VUE3
import Vue from 'vue'
import '@/uni.promisify.adaptor'
import Vuex from 'vuex';

Vue.use(Vuex);
Vue.config.productionTip = false
Vue.prototype.$store = store

App.mpType = 'app'
const app = new Vue({
  store,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  return {
    app
  }
}
// #endif