import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginRouter from "../router/login"   // 登录页路
import IndexRouter from "../router/home"    // 首页页路
import ErrorRouter from '../router/error';  // 错误路由

Vue.use(VueRouter)

const routes = [
    LoginRouter,
    IndexRouter,
    ErrorRouter
]

const router = new VueRouter({
    routes
})

// 防止重复路由
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

export default router
