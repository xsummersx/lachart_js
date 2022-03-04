/*
 * @Author: your name
 * @Date: 2022-02-23 18:37:02
 * @LastEditTime: 2022-03-03 09:22:16
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\vite.config.js
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//elementUI配置
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
  AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  })],
  resolve: {
    alias: {
      "@": "/src/"
    }
  },
  base: './',//如果不配置base打包后找不到根目录的IP端口
  define: {
    "process.env": {}
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://172.16.41.236:12080/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
