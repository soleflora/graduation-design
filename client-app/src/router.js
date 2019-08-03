import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './components/account/account-login.vue'
import Register from './components/account/account-register.vue'
import videoPlay from './components/play/video-play.vue'
import Manager from './components/managers/manage-page.vue'
import ownVideo from './components/managers/own-video.vue'
import uploadVideo from './components/managers/upload-video.vue'

Vue.use(Router)
export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/videoPlay',
            name: 'videoPlay',
            component: videoPlay
        },
        {
            path: '/manager',
            name: 'manager',
            component: Manager,
            meta: {
                requireAuth: true
            },
            children: [
                {
                    path: '/ownvideo',
                    name: 'ownvideo',
                    component: ownVideo,
                    meta: {
                        requireAuth: true
                    }
                },
                {
                    path: '/uploadvideo',
                    name: 'uploadvideo',
                    component: uploadVideo,
                    meta: {
                        requireAuth: true
                    }
                }
            ]
        },
        {
          path: '/more',
          name: 'more',
          component: () => import('./components/more/more-video.vue')
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
        }
    ]
})