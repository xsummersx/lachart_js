<!--
 * @Author: your name
 * @Date: 2022-02-20 13:47:55
 * @LastEditTime: 2022-02-24 17:00:06
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\components\Login\Forget.vue
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
          required: true,
          message: '账号不能为空',
          trigger: 'blur',
        },
        {
          min: 6,
          max: 30,
          message: '请输入密码6~30位',
        },
      ]"
    >
      <el-input autocomplete="off" placeholder="请输入账号" v-model="formData.emailText"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="danger" @click="forget()" class="submit_btn">重置密码</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
const formData = ref({
  emailText: "",
  pwdText: "",
});

const formRef = ref();
const forget = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage({
        message: "提交成功",
        type: "success",
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
