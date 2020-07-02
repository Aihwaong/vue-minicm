import { getRequest } from './api'
import store from '../store'

export const initMenu = (router, state) => {
    if (store.state.routes.length > 0) {
        return;
    }
    // 获取所拥有权限菜单
    getRequest('/menu/get').then(data => {
        if (data) {
            let formatRouters = formatRouter(data);
            router.addRoutes(formatRouters); // 载入到路由
            store.commit('initSetRoutes', formatRouters);
        }
    })
}

// 初始化，动态导入组件
export const formatRouter = (routers) => {
    let formatRouters = [];
    routers.forEach(router => {
        if (router != null || router != "") {
            let {
                path,
                component,
                name,
                iconCls,
                children
            } = router;

            if (children && children instanceof Array) {
                children = formatRouter(children);
            }
            let fmRouter = {
                path: path,
                name: name,
                iconCls,
                children: children,
                component: resolve => {
                    if (component.startsWith("index")) {
                        require(['../modules/' + component + '.vue'], resolve);
                    } else if (component.startsWith("building")) {
                        require(['../modules/house/' + component + '.vue'], resolve);
                    } else if (component.startsWith("household")) {
                        require(['../modules/household/' + component + '.vue'], resolve);
                    } else if (component.startsWith("house")) {
                        require(['../modules/house/' + component + '.vue'], resolve);
                    }  else if (component.startsWith("notice")) {
                        require(['../modules/notice/' + component + '.vue'], resolve);
                    } else if (component.startsWith("perssonel")) {
                        require(['../modules/perssonel/' + component + '.vue'], resolve);
                    } else if (component.startsWith("repair")) {
                        require(['../modules/repair/' + component + '.vue'], resolve);
                    } else if (component.startsWith("statistics")) {
                        require(['../modules/statistics/' + component + '.vue'], resolve);
                    } else if (component.startsWith("system")) {
                        require(['../modules/system/' + component + '.vue'], resolve);
                    } else if (component.startsWith("car")) {
                        require(['../modules/car/' + component + '.vue'], resolve);
                    } else if (component.startsWith("visitor")) {
                        require(['../modules/visitor/' + component + '.vue'], resolve);
                    }
                }
            }
            formatRouters.push(fmRouter);
        }
    });
    return formatRouters;
}