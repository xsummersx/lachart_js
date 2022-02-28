<!--
 * @Author: your name
 * @Date: 2022-02-21 16:04:36
 * @LastEditTime: 2022-02-24 20:54:08
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\components\Main\Main.vue
-->
<template>
  <Head class="headerShaw" />

  <div class="leftEdit">
    <div class="ItemBox">
      <el-button type="primary" class="btn" @click="BtnReload">刷新</el-button>
      <el-button plain class="btn" @click="Format">格式化</el-button>
    </div>
    <Editor :aceHeight="aceHeight" :content="content" ref="editor"></Editor>
  </div>
  <div class="rightBox">
    <div class="ItemBox">
      <el-tag class="ml-2 tag" type="danger">echarts：5.3.0</el-tag>
    </div>
    <div class="chartBox">
      <div class="echartBox" style="width: 100%; height: 780px" id="Main"></div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { init } from "echarts";
import { onMounted } from "vue";
import Editor from "@/components/Main/Editor.vue";
import Head from "@/components/Head/Head.vue";
//接口
import { getChartDetail } from "@/api/getInfo.js";
let content = ref("");
//子组件的类
const editor = ref(null);
const aceHeight = ref("816px"); //框的高度
onMounted(() => {
  let myChart = init(document.getElementById("Main"));
  getChartDetail().then((res) => {
    content.value = res.data.option;
    console.log(content.value);
    //let option = eval(content.value);
    let myStr = `myChart.setOption(${content.value})`;
    eval(myStr);
  });
});
//刷新
const BtnReload = () => {
  console.log(editor);
  let myChart = init(document.getElementById("Main"));
  let myStr = `myChart.setOption(${editor.value.content})`;
  eval(myStr);
};
//格式化代码
const Format = () => {
  editor.value.forMatter();
};
</script>
<style scoped lang="scss">
.headerShaw {
  box-shadow: 0px 0px 16px #666;
  position: relative;
  z-index: 10001;
}
.ItemBox {
  height: 32px;
}
.leftEdit {
  width: 30%;
  float: left;
  height: v-bind(aceHeight);
  background-color: #fff;
  margin-top: 15px;
  .btn {
    border-radius: 0;
    float: right;
    margin-right: -1px;
  }
}
.rightBox {
  border-radius: 16px;
  margin-top: 15px;
  float: left;
  width: calc(70% - 30px);
  margin-left: 15px;

  .chartBox {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0px 0px 12px #ccc;
    height: 780px;
    padding: 10px;
  }
}
</style>
