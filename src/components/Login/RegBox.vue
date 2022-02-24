<template>
  <!-- 登录 -->
  <el-form
    autocomplete="off"
    ref="formRef"
    label-width="100px"
    :model="formData"
    class="loginForm sign-in-form"
  >
    <el-form-item
      label="账号"
      prop="adminText"
      :rules="[
        {
          required: true,
          message: '账号不能为空',
          trigger: 'blur',
        },
        {
          min: 6,
          max: 30,
          message: '请输入账号6~30位',
        },
      ]"
    >
      <el-input autocomplete="off" placeholder="请输入账号" v-model="formData.adminText"></el-input>
    </el-form-item>
    <el-form-item
      label="密码"
      prop="pwdText1"
      :rules="[
        {
          required: true,
          message: '密码不能为空',
          trigger: 'blur',
        },
        {
          min: 6,
          max: 30,
          message: '请输入密码6~30',
        },
      ]"
    >
      <el-input
        autocomplete="off"
        type="password"
        placeholder="请输入密码"
        v-model="formData.pwdText1"
      ></el-input>
    </el-form-item>
    <el-form-item
      label="确认密码"
      prop="pwdText2"
      :rules="[
        {
          validator: checkPwd,
          trigger: 'blur',
        },
        {
          required: true,
          message: '密码不能为空',
          trigger: 'blur',
        },
      ]"
    >
      <el-input
        autocomplete="off"
        type="password"
        placeholder="请再次输入密码"
        v-model="formData.pwdText2"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="regForm()" class="submit_btn">注册</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const formData = reactive({
  adminText: "",
  pwdText1: "",
  pwdText2: "",
});

const formRef = ref();
const checkPwd = (rule, value, callback) => {
  if (value.trim().length == 0) {
    callback(new Error("密码不能为空"));
  } else if (value != formData.pwdText1) {
    callback(new Error("2次密码不一致"));
  } else {
    callback();
  }
};
const regForm = () => {
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
<style scoped>
.sign-in-form {
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
  background: #fff;
  padding: 35px;
  border: 1px solid #f1f3f7;
  border-radius: 16px;
}
</style>
