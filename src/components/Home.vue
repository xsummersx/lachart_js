<!--
 * @Author: your name
 * @Date: 2022-02-23 18:37:02
 * @LastEditTime: 2022-02-23 21:10:14
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\components\HelloWorld.vue
-->

<template>
  <h1>{{ count }}</h1>
  <!-- elementUI测试 -->
  <el-button type="danger">Danger</el-button>
  <el-alert title="success alert" type="success" />
  <h2>{{ store.name }}</h2>
  <h2>{{ store.doubleCont }}</h2>
  <a>123312<span>sdklgjaslg</span>></a>
</template>
<script setup>
import { ref } from "vue";
import { getInfo } from "@/api/getUser";
import { useStore } from "@/store/index";
//import axios from "@/axios/http";
const count = ref(0);
const store = useStore();
setTimeout(() => {
  store.changState("张三");
}, 1500);
//axios测试
// axios.get("userInfo").then((res) => {
//   console.log(res);
// });
//axios测试二
getInfo().then((res) => {
  console.log(res);
});
</script>

<style scoped lang="scss">
a {
  color: #42b983;
  span {
    color: red;
  }
}
</style>
