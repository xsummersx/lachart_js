<!--
 * @Author: your name
 * @Date: 2022-02-20 13:47:55
 * @LastEditTime: 2022-02-24 17:09:27
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\components\Login\LoginBox.vue
-->
<template>
  <!-- 登录 -->
  <el-form
    autocomplete="off"
    ref="formRef"
    label-width="60px"
    :model="formData"
    class="loginForm sign-in-form"
  >
    <el-form-item
      label="账号"
      prop="emailText"
      :rules="[
        {
          min: 6,
          max: 30,
          message: '请输入账号6~30位',
        },
        {
          required: true,
          message: '账号不能为空',
          trigger: 'blur',
        },
      ]"
    >
      <el-input autocomplete="off" placeholder="请输入账号" v-model="formData.emailText"></el-input>
    </el-form-item>
    <el-form-item
      label="密码"
      prop="pwdText"
      :rules="[
        {
          required: true,
          message: '密码不能为空',
          trigger: 'blur',
        },
        {
          min: 6,
          max: 30,
          message: '请输入密码6~30位',
        },
      ]"
    >
      <el-input
        autocomplete="off"
        type="password"
        placeholder="请输入密码"
        v-model="formData.pwdText"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="success" @click="customLogin" class="submit_btn">游客登录</el-button>
      <el-button type="primary" @click="submit()" class="submit_btn">登录</el-button>
    </el-form-item>
    <slot name="forget"></slot>
  </el-form>
</template>
<script setup>
import { ref } from "vue";
import { Login } from "@/api/getInfo";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useStore } from "@/store/index";

const formData = ref({
  emailText: "",
  pwdText: "",
});
const formRef = ref();
const router = useRouter();
const store = useStore();
//初始化判断是否为登录状态
if (localStorage.getItem("UserID")) {
  router.push("/");
}
//游客登录
const customLogin = () => {
  store.setUserInfo("laChart游客");
  router.push("/");
};
//点击登录
const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      Login().then((res) => {
        if (res.status === 200) {
          ElMessage({
            message: "登录成功",
            type: "success",
          });
          store.setUserInfo(formData.value.emailText);
          router.push("/");
        }
      });
    } else {
      ElMessage({
        message: "提交失败",
        type: "error",
      });
    }
  });
};
</script>
<style scoped>
.sign-in-form {
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
  background: #fff;
  padding: 35px;
  border: 1px solid #f1f3f7;
  border-radius: 16px;
}
</style>
