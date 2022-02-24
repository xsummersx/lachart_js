/*
 * @Author: your name
 * @Date: 2022-02-17 18:59:50
 * @LastEditTime: 2022-02-24 17:12:22
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\router\index.ts
 */
import { createRouter, createWebHashHistory } from 'vue-router'
const routes = [
    {
        path: '/',
        name: 'Index',
        component: () => import("../views/Index.vue")
    },
    {
        path: '/Login',
        name: 'Login',
        component: () => import("@/views/Login.vue")
    },
    {
        path: '/Main',
        name: 'Main',
        component: () => import("@/views/Main.vue")
    },
    {
        path: '/Editor',
        name: 'Editor',
        component: () => import("@/components/Main/Editor.vue")
    },
    {
        path: '/:catchAll(.*)',
        name: '/404',
        component: () => import("@/views/404.vue")
    },
]
// createWebHashHistory() // 给出的网址为 `https://example.com/folder#`
// createWebHashHistory('/folder/') // 给出的网址为 `https://example.com/folder/#`
const router = createRouter({
    history: createWebHashHistory(),
    routes
});
export default router;