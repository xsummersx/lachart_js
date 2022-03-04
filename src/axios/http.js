/*
 * @Author: your name
 * @Date: 2022-02-23 19:00:12
 * @LastEditTime: 2022-03-03 09:12:55
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\axios\http.js
 */

import axios from 'axios'
//全局设置头部信息
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
//设置超时时间
axios.defaults.timeout = 1000 * 60 * 5;
//设置开发者模式
const bUrl = import.meta.env.VITE_APP_BASE_API
axios.defaults.baseURL = bUrl + '/api/';
//请求拦截
axios.interceptors.request.use((config) => {
    //请求拦截器
    console.log("请求拦截")
    return config
})
axios.interceptors.response.use((response) => {
    console.log("响应拦截")
    return response
}, error => {
    return Promise.reject(error);
})

//响应拦截
export default axios;