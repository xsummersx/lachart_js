/*
 * @Author: your name
 * @Date: 2022-02-23 19:25:20
 * @LastEditTime: 2022-02-23 19:27:58
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\api\getUser.js
 */
import axios from "@/axios/http.js";
export function getInfo(){
    return axios({
        url:"userInfo",
        method:"get",
        data:{},
        params:{
        }
    })
}