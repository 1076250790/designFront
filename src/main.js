import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入 EChart 图表组件
import * as echarts from 'echarts';

import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css';
import 'element-ui/lib/theme-chalk/index.css'

// 导入 NProgress 包对应的 JS 和 CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 引入 axios
import axios from 'axios'

// 引入 vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

// 全局配置 axios的默认请求根路径
axios.defaults.baseURL = 'http://10.207.123.225:8081/'

// 今后，在每个 .vue组件中要发起请求，直接调用 this.$http.xxx
Vue.prototype.$http = axios

// 要使用图表直接调用 this.$echarts.xxx
Vue.prototype.$echarts = echarts

// 在 request 拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  console.log(config)
  NProgress.start()
  // config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})

// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  // 在最后必须 return config
  return config
})

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
