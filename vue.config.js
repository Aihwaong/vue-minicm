module.exports = {
    devServer: {
        host:"localhost",
        port:8080,  // 开服务的端口(和跨域的端口无关)
        proxy: {
            "/": {    // search为转发路径
                target: 'http://localhost:8001',  // 目标地址
                ws: false, // 是否代理websockets
                changeOrigin: true,   // 设置同源  默认false，是否需要改变原始主机头为目标URL,               
                pathRewrite:{
                    '^/': ''
                }
            }
        }
    }
};