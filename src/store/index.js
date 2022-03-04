/*
 * @Author: your name
 * @Date: 2022-02-23 19:57:06
 * @LastEditTime: 2022-03-03 11:46:03
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\store\index.js
 */

import { defineStore } from 'pinia'
export const useStore = defineStore("main", {
    state: () => {
        return {
            ColorObj: {
                PrimaryBlue: '#409eff',
                MainBlue: "#6BC7DE",
                MainRed: "#DD7663",
                MainYellow: "#F0D989",
                MainOrange: "#ff9900"
            },
            UserInfo: {
                UserID: '',
                UserName: '',
                Token: ''
            }
        }
    },
    getters: {
        // doubleCont(state) {
        //     return state.cont * 2
        // }
    },
    actions: {
        // changState(value) {
        //     this.name = value
        // },
        setUserInfo(infoObj) {
            this.UserInfo.UserID = infoObj.UserID;
            this.UserInfo.UserName = infoObj.UserName;
            this.UserInfo.Token = infoObj.Token
        }
    }
})
//数据持久化
//1.保存数据
const instance = useStore();
instance.$subscribe((_, state) => {
    localStorage.setItem('UserID', instance.$state.UserInfo.UserID);
    localStorage.setItem('UserName', instance.$state.UserInfo.UserName);
    localStorage.setItem('Token', instance.$state.UserInfo.Token);
})
//2.获取保存的数据，先判断有无，无则用先前的

let _UserID = '';
let _UserName = '';
let _Token = '';
_UserID = localStorage.getItem('UserID');
_UserName = localStorage.getItem('UserName');
_Token = localStorage.getItem('Token');
if (_UserID && _UserName && _Token) {
    instance.$state.UserInfo.UserID = _UserID;
    instance.$state.UserInfo.UserName = _UserName;
    instance.$state.UserInfo.Token = _Token;
}
export const clearToken = () => {
    localStorage.removeItem("UserID")
}