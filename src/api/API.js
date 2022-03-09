/*
 * @Author: your name
 * @Date: 2022-02-23 19:25:20
 * @LastEditTime: 2022-03-08 19:00:39
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
//获取统计图详情
export function getChartDetail() {
    return axios({
        url: "http://localhost:3001/getChartDetail",
        method: "get",
        data: {}
    })
}
//返回新建的一段例子option
export function NewChart() {
    let getChartDetail = {
        ID: "pie001",
        type: "pie",
        chartName: "环形饼图",
        option: "{\"title\":{\"text\":\"ECharts 入门示例\"},\"tooltip\":{},\"legend\":{\"data\":[\"销量\"]},\"xAxis\":{\"data\":[\"衬衫\",\"羊毛衫\",\"雪纺衫\",\"裤子\",\"高跟鞋\",\"袜子\"]},\"yAxis\":{},\"series\":[{\"name\":\"销量\",\"type\":\"bar\",\"data\":[5,20,36,10,10,20]}]}"
    }
    return getChartDetail;
}

//***正式接口***//
//注册
export function SaveUserInfo(params) {
    return axios({
        url: "Learning/SaveUserInfo",
        method: "get",
        data: {},
        params: { ...params },
    })
}

//登录
export function LoginUserInfo(params) {
    return axios({
        url: "Learning/LoginUserID",
        method: "get",
        data: {},
        params: { ...params }
    })
}
//列表接口
export function GetAllImageList() {
    return axios({
        url: "Learning/GetAllImageList",
        method: "get",
        data: {},
        params: {}
    })
}
//上传图片
export function UploadImage(imgFor, objName) {
    return axios({
        url: "Learning/UploadImage",
        method: "post",
        data: imgFor,
        params: { ...objName }
    })
}
//保存统计图接口
export function SaveImageType(data) {
    return axios({
        url: "Learning/SaveImageType",
        method: "post",
        data: { ...data },
    })
}
//获取详情
export function GetOnlyImageInfo(params) {
    return axios({
        url: "Learning/GetOnlyImageInfo",
        method: "get",
        params: { ...params },
    })
}