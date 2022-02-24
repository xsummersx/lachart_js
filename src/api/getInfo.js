/*
 * @Author: your name
 * @Date: 2022-02-23 19:25:20
 * @LastEditTime: 2022-02-24 17:03:31
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\api\getUser.js
 */

import axios from "@/axios/http.js";
//测试接口
export function getInfo() {
    return axios({
        url: "userInfo",
        method: "get",
        data: {},
        params: {
        }
    })
}
//获取用户列表
export function Login() {
    return axios({
        url: "http://localhost:3001/Login",
        method: "get",
        data: {}
    })
}
//获取统计图列表
export function getList() {
    return axios({
        url: "http://localhost:3001/getChartsList",
        method: "get",
        data: {}
    })
}