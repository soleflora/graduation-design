import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:3000'
Vue.config.productionTip = false
Vue.use(VueAxios,axios)
Vue.use(mavonEditor)

router.beforeEach((to, from, next) => {
    const token = sessionStorage.getItem("token");
    const params = {
        Authorization: token
    };
    if(to.meta.requireAuth) {
      Vue.axios.post('/checkUser',params).then(res => {
          if (res.data.status === 'loginIn') {
              next()
          } else {
              next({
                  path: '/login',
                  query: {
                      redirect: to.path  // 将跳转的路由path作为参数，登录成功后再跳转到该路由
                  }
              })
          }
      })
    } else {
      next()
    }
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
