/*
 * @Author: your name
 * @Date: 2022-02-23 19:57:06
 * @LastEditTime: 2022-02-24 09:00:51
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\store\index.js
 */

import { defineStore} from 'pinia'
export const useStore = defineStore("main",{
    state:()=>{
        return {
            UserID:'back',
            cont:1
        }
    },
    getters:{
        doubleCont(state){
            return state.cont * 2
        }
    },
    actions:{
        changState(value){
            this.name = value
        }
    }
})
//数据持久化
//1.保存数据
const instance = useStore();
instance.$subscribe((_,state)=>{
    localStorage.setItem('UserID',instance.$state.UserInfo.UserID);
})
//2.获取保存的数据，先判断有误，无则用先前的
const old = localStorage.getItem('UserID');
if(old){
    instance.$state.UserInfo.UserID = old;
}
export const clearToken = ()=>{
    localStorage.removeItem("UserID")
}