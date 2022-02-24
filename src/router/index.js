/*
 * @Author: your name
 * @Date: 2022-02-17 18:59:50
 * @LastEditTime: 2022-02-24 16:00:40
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\router\index.ts
 */
import { createRouter, createWebHashHistory } from 'vue-router'
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import("@/components/Home.vue")
    },
    {
        path: '/Editor',
        name: 'Editor',
        component: () => import("@/components/Editor.vue")
    },
]
// createWebHashHistory() // 给出的网址为 `https://example.com/folder#`
// createWebHashHistory('/folder/') // 给出的网址为 `https://example.com/folder/#`
const router = createRouter({
    history: createWebHashHistory(),
    routes
});
export default router;