import axios from "axios"
import { Message } from 'element-ui';
import router from "../router/index";
import store from "../store/index";

// http request 拦截器
axios.interceptors.request.use(config => {
    if (store.state.token) {
        config.headers.Authorization = store.state.token;
    }
    return config;
}, err => {
    return Promise.reject(err);
});

// http response 拦截器
axios.interceptors.response.use(respData => {
    if (respData.status && respData.status == 200 && respData.data.status == 500) {
        Message.error({ message: respData.data.message });
        return
    }
    if (respData.data.message) {
        Message.success({ message: respData.data.message })
    }

    return respData.data;
}, error => {
    if (error.response.status == 504 || error.response.status == 404) {
        Message.error({ message: '服务器异常' })
    } else if (error.response.status == 403) {
        Message.error({ message: '权限不足' })
    } else if (error.response.status == 401) {
        Message.error({ message: error.response.data.message })
        store.commit('clearToken');
        store.commit('clearRoles');
        sessionStorage.clear();
        router.replace('/');
    } else {
        if (error.response.data.message) {
            Message.error({ message: error.response.data.message })
        } else {
            Message.error({ message: '未知错误!' })
        }
    }
    return;
})

let base = '';

export const postKeyValueRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params,
        transformRequest: [function (data) {
            let ret = '';
            for (let i in data) {
                ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
            }
            return ret;
        }],
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

export const postRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params,
    })
}

export const putRequest = (url, params) => {
    return axios({
        method: 'put',
        url: `${base}${url}`,
        data: params
    })
}

export const getRequest = (url, params) => {
    return axios({
        method: 'get',
        url: `${base}${url}`,
        params: params
    })
}

export const deleteRequest = (url, params) => {
    return axios({
        method: 'delete',
        url: `${base}${url}`,
        params: params
    })
}