<!--
 * @Author: your name
 * @Date: 2022-02-17 20:08:24
 * @LastEditTime: 2022-02-24 19:27:02
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\views\index.vue
-->
<template>
  <div class="MainBox">
    <Head></Head>
    <List></List>
    <Feet></Feet>
  </div>
</template>
<script setup>
import Head from "@/components/Head/Head.vue";
import List from "@/components/Main/List.vue";
import Feet from "@/components/Head/Feet.vue";
</script>
<style scoped>
.MainBox {
  background: #f1f3f7;
  height: 100%;
  width: 100%;
}
</style>
