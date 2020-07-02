import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        // 路由列表
        routes: []
    },
    mutations: {
        initSetRoutes(state, data) {
            state.routes = data;
            console.log("initSetRoutes" + data)
        }
    },
    actions: {

    }
});