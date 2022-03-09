<!--
 * @Author: your name
 * @Date: 2022-02-20 16:31:04
 * @LastEditTime: 2022-03-09 09:08:50
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\components\Head\Head.vue
-->
<template>
  <div class="Title">
    <div class="firstBox">
      <img class="logo" :src="rose" />
      <h3>LaCharts</h3>
    </div>
    <!-- 已登录状态 -->
    <div class="lastBox" v-if="UserID">
      <el-button type="success" style="margin-right: 15px" @click="goToNewChart"
        >新建统计图</el-button
      >
      <span class="Text"
        >欢迎您，<b class="bCol">{{ UserName }}</b></span
      >
      <div class="ExOut" @click="Export">
        <span class="Text"> 退出登录</span>
        <svg
          t="1645355741984"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2063"
          width="20"
          height="20"
        >
          <path
            d="M511.987 902.209c-49.499 0-97.577-9.494-142.794-28.32-43.71-18.103-82.907-44.048-116.591-77.104-33.688-33.066-60.125-71.585-78.621-114.451-19.13-44.378-28.837-91.53-28.837-140.145 0-58.162 14.532-115.909 41.994-167.062 26.551-49.425 65.122-92.823 111.567-125.494 12.904-9.077 30.833-6.134 40.056 6.5 9.223 12.638 6.28 30.204-6.629 39.226-39.248 27.683-71.824 64.268-94.207 105.994-23.493 43.732-35.393 91.108-35.393 140.837 0 81.139 32.197 157.426 90.668 214.783 58.433 57.379 136.143 88.981 218.789 88.981 82.624 0 160.356-31.603 218.825-88.981 58.465-57.355 90.637-133.643 90.637-214.783 0-49.673-11.873-97.133-35.393-140.837-22.388-41.692-54.986-78.309-94.244-105.938-12.873-9.018-15.874-26.588-6.62-39.221 9.25-12.634 27.147-15.604 40.024-6.5 46.473 32.665 85.099 76.063 111.627 125.489 27.486 51.154 42.018 108.904 42.018 167.066 0 48.609-9.704 95.762-28.862 140.171-18.473 42.866-44.933 81.386-78.616 114.446-33.693 33.061-72.892 58.973-116.596 77.165-45.244 18.712-93.294 28.178-142.797 28.178v0zM520.609 511.54c-15.848 0-28.691-12.55-28.691-28.128v-333.465c0-15.521 12.845-28.156 28.691-28.156 15.848 0 28.719 12.634 28.719 28.156v333.465c0 15.577-12.873 28.128-28.719 28.128v0z"
            p-id="2064"
            fill="#ffffff"
          ></path>
        </svg>
      </div>
    </div>
    <!-- 未登录状态 -->
    <div v-if="!UserID" class="lastBox">
      <el-button type="success" @click="GotoLogin">去登录</el-button>
      <el-button type="warning" @click="GotoReg">还没有账号？先去注册</el-button>
    </div>
  </div>
</template>
<script setup>
import rose from "@/assets/img/rose.png";
import { useStore, clearToken } from "@/store/index";
import { useRouter } from "vue-router";
const store = useStore();
const router = useRouter();
const { PrimaryBlue } = store.$state.ColorObj;
const { MainBlue } = store.$state.ColorObj;
const { MainRed } = store.$state.ColorObj;
const { MainYellow } = store.$state.ColorObj;
const { MainOrange } = store.$state.ColorObj;
const { UserID, UserName } = store.$state.UserInfo;
//退出登录
const Export = () => {
  //清楚缓存
  clearToken();
  router.push("/Login");
};
//去登录
const GotoLogin = () => {
  router.push("/Login");
};
//去注册
const GotoReg = () => {
  router.push({
    path: "/Login",
    query: {
      signUpMode: true,
    },
  });
};
//新建统计图
const goToNewChart = () => {
  // router.push({
  //   path: "/Main",
  // });
  //弹出一个新页面
  window.open(location.origin + "/#/Main");
};
</script>
<style scoped>
.Title {
  height: 60px;
  background-color: v-bind(PrimaryBlue);
  padding: 5px 15px;
}
.firstBox {
  display: flex;
  height: 60px;
  width: 150px;
  justify-content: space-around;
  align-items: center;
  float: left;
}
.logo {
  width: 28px;
  height: 28px;
}
h3 {
  font-size: 24px;
  font-weight: bold;
  background-image: linear-gradient(90deg, v-bind(MainBlue), v-bind(MainRed), v-bind(MainYellow));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
.lastBox {
  height: 60px;
  float: right;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.ExOut {
  display: flex;
  justify-content: space-around;
  align-items: center;
  cursor: pointer;
  margin-left: 20px;
}
.ExOut:hover span,
.ExOut:hover svg {
  opacity: 0.8;
}
.Text {
  font-size: 14px;
  color: #fff;
  margin-right: 5px;
}
.bCol {
  color: v-bind(MainOrange);
}
</style>
