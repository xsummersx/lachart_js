# 笔记

## 创建步骤

1. yarn create vite my-vue-app --template vue-ts
2. yarn install 初始化的 vite
3. yarn run dev 开始写代码

## 关于 viteconfigjs 配置，根目录为@

```
  resolve:{
    alias:{
      "@":"/src/"
    }
  }
```

## 遇到 process is not defined 在 viteconfig 下配置

```
define:{
    "process.env":{}
  }
```

## 关于分支 vuex-setting 为搭建好的框架

1. 电脑全局安装：npm install -g json-server
2. 启动：json-server db.json --port 3001

## 关于 父子之间传值

1. 父传子：
   - defineProps 传给子组件数据
   - defineEmits 子组件调用父组件传过来的参数
2. 子传父：
   - defineExpose 抛出子组件的方法或对象
   ```
   <child ref="root"></child>
   ....
   const root = ref(null)
   (root.value as any).*
   ```

## 配置 json-server 接口调用

## 关于 封装 axios 的请求方式

- https://blog.csdn.net/weixin_44213308/article/details/113681316

1. 安装 axios、vue-axios，或者 npm 安装：npm install axios --save || npm install vue-axios --save
2. 编写 request，主要加入一个超时时间 return axios，请求拦截器和响应拦截器
3. main.ts 中引入 Vueaxios,axios(已经改为 request 的某个方法)
4. 编写接口文件，引入 request 请求接口
5. 在 vue 文件中请求接口

- 配置开发环境和生产环境

1.  env.production VITE_APP_SERVICE_URL= '/'
2.  env.development VITE_APP_BASE_API= 'http://172.16.41.237:12071/'
3.  配置详见 axios 的配置

## 关于第三方插件的使用

1. 安装 elementUI: yarn add element-plus
2. 配置 voler 支持

```
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["element-plus/global"]
  }
}
```

2. 按需导入需要安装 npm install -D unplugin-vue-components unplugin-auto-import
3. 配置 vite.config.ts

```
plugins: [
    // ...
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
```

4. 如果部分插件没有样式，需要再 main.ts 中引入 import "element-plus/theme-chalk/index.css";

## pinia 的安装使用

1. 安装 vuex： yarn add pinia@next
2. main.ts 引入

```
import {createPinia} from 'pinia';
//创建实例
const pinia = createPinia();
use(pinia)
```

3. 开始正常使用
4. 数据持久化：https://blog.csdn.net/qq_44285092/article/details/122627683

## router 的使用

1. 下载 yarn add vue-router@next
2. 创建文件 router/index.ts
3. main.ts 挂载

```
import router from "./router"
use(router)
```

## scss 的使用和安装

1. npm install sass-loader --save-dev
2. npm install node-sass --save-dev
3. npm install sass --save-dev

#### 注：createWebHashHistory 的 base 参数是额外增加的，如下：

- 提供可选的 base。默认是 location.pathname + location.search。如果 head 中有一个 <base>，它的值将被忽略，而采用这个参数。但请注意它会影响所有的 history.pushState() 调用，这意味着如果你使用一个 <base> 标签，它的 href 值必须与这个参数相匹配 (请忽略 # 后面的所有内容)

```
// at https://example.com/folder
createWebHashHistory() // 给出的网址为 `https://example.com/folder#`
createWebHashHistory('/folder/') // 给出的网址为 `https://example.com/folder/#`
```
