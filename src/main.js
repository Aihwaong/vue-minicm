import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
//  ------ ElementUI --------
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
//  ------ 富文本 --------
import  VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { postRequest } from "./utils/api";
import { postKeyValueRequest } from "./utils/api";
import { putRequest } from "./utils/api";
import { deleteRequest } from "./utils/api";
import { getRequest } from "./utils/api";

import {initMenu} from './utils/menu'

// ------------------- 定义全局方法 -------------------
Vue.prototype.postRequest = postRequest;
Vue.prototype.postKeyValueRequest = postKeyValueRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.getRequest = getRequest;

// ------------------- 路由配置 -------------------
router.beforeEach((to, from, next) => {
    if (to.path == '/') {
        next();
    } else {
        // 判断用户登录
        if (window.sessionStorage.getItem("user")) {
            initMenu(router, store);
            next();
        } else {
            next('/?redirect=' + to.path);
        }
    }
})

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use( VueQuillEditor)

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
