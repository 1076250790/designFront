import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入需要的组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'

// Home子组件
import Users from '../components/user/Users.vue'
import Admin from '../components/admin/Admin.vue'
import Table from '../components/table/Table.vue'
import FoodList from '../components/food/FoodList.vue'
import Categorize from '../components/food/Categorize.vue'
import UpdatePic from '../components/food/UpdatePic.vue'
import Order from '../components/order/Order.vue'
import Evaluation from '../components/user/Evaluation.vue'
import Reply from '../components/admin/Reply.vue'
import Chart from '../components/data/Chart.vue'
import Error from '../components/error/Error.vue'

// 调用 Vue.use()函数，把 VueRouter安装为 Vue的插件
Vue.use(VueRouter)

const routes = [
  // 重定向的路由规则
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/user', component: Users },
      { path: '/admin', component: Admin },
      { path: '/tables', component: Table },
      { path: '/food_list', component: FoodList },
      { path: '/categorize', component: Categorize },
      { path: '/update_pic', component: UpdatePic },
      { path: '/order', component: Order },
      { path: '/comment', component: Evaluation },
      { path: '/reply', component: Reply },
      { path: '/data', component: Chart },
      { path: '/error', component: Error }
    ]
  },
]

// 创建路由的实例对象
const router = new VueRouter({
  routes,
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行    next('/login')  强制跳转

  // 登录跳转
  if (to.path === '/login') return next();
  // 获取 token
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next('/login')
  next();
  setTimeout('console.clear()', 300)

  // 权限验证
  const power = window.sessionStorage.getItem("power");
  console.log(power);
  if (to.path === '/order' || to.path === 'comment') {
    if (power === '1' || power === '2') {
      next()
      setTimeout('console.clear()', 300)
    } else {
      next('/error')
      setTimeout('console.clear()', 300)
      return
    }
  }
  if (to.path === '/data') {
    if (power === '2') {
      next()
      setTimeout('console.clear()', 300)
    } else {
      next('/error')
      setTimeout('console.clear()', 300)
      return
    }
  }
})

export default router
