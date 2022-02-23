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
  resolve:{
    alias:{
      "@":"/src/"
    }
  },
  base:'./',//如果不配置base打包后找不到根目录的IP端口
  define:{
    "process.env":{}
  }
})
