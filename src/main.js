/*
 * @Author: your name
 * @Date: 2022-02-23 18:37:02
 * @LastEditTime: 2022-02-24 17:09:05
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\main.js
 */
import { createApp } from 'vue'
import App from './App.vue'
//重置样式
import "@/assets/css/reset.css"
//引入elementUI的样式
import "element-plus/theme-chalk/index.css";
//路由
import router from "./router"
//状态管理vuex5
import { createPinia } from 'pinia';
//创建实例
const pinia = createPinia();
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
