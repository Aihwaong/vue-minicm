import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        // 路由列表
        routes: [],
        // 用户令牌
        token: '',
    },
    mutations: {
        // 路由
        initSetRoutes(state, data) {
            state.routes = data;
        },
        // Token
        updateToken(state, token) {
            state.token = token;
        },
        clearToken(state) {
            state.token = '';
        },
    },
    actions: {

    }
});