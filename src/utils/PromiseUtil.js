import Axios from "axios"

let host ="";

export default {
    get: function (url, params) {
        return this.request("get", url, params);
    },
    post: function (url, params) {
        return this.request("post", url, params);
    },
    request : function(method, url, params) {
        return new Promise((resolve, reject) => {
            Axios({
                method : method,
                url : `${host}${url}`,
                data : params,
                headers : {
                    //'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (response) {
                resolve(response);
            })
            .catch(function (error) {
                reject(error);
            });
        })
    }
}

