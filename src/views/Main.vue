<!--
 * @Author: your name
 * @Date: 2022-02-21 16:04:36
 * @LastEditTime: 2022-03-01 11:36:53
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
      <el-button class="fl" style="margin-right: 12px" @click="saveBtn" type="success"
        >保存</el-button
      >
      <el-tag class="ml-2 tag fr" type="danger">echarts：5.3.0</el-tag>
      <el-button class="fl" type="primary" :plain="IsPlain" @click="CollectBtn" :icon="Star"
        >收藏</el-button
      >
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
import { Star } from "@element-plus/icons-vue";
//接口
import { getChartDetail } from "@/api/getInfo.js";
let content = ref("");
//子组件的类
const editor = ref(null);
const aceHeight = ref("816px"); //框的高度
let myChart;
onMounted(() => {
  myChart = init(document.getElementById("Main"));
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
  myChart = init(document.getElementById("Main"));
  let myStr = `myChart.setOption(${editor.value.content})`;
  eval(myStr);
};
//格式化代码
const Format = () => {
  editor.value.forMatter();
};
//***收藏功能块***//
let IsPlain = ref(false);
const CollectBtn = (e) => {
  IsPlain.value = !IsPlain.value;
  //失去焦点
  let target = e.target;
  if (target.nodeName == "SPAN" || target.nodeName == "I") {
    target = e.target.parentNode;
  }
  target.blur();
};
//**下载图片 */
const saveBtn = () => {
  // src.value = myChart.getDataURL({
  //   pixelRatio: 2,
  //   backgroundColor: "#fff",
  // });
  let offcan = myChart.getDataURL({
    pixelRatio: 2,
    backgroundColor: "#fff",
  });
  console.log(offcan);
  const block = offcan.split(";");
  const contentType = block[0].split(":")[1];
  const realData = block[1].split(",")[1];
  var blob = b64toBlob(realData, contentType);
  const formData = new FormData();
  formData.append("blob", blob);
  // $.ajax({
  //   url: url,
  //   data: formData,
  //   type: "POST",
  //   async: true,
  //   error: function (err) {},
  //   success: function (data) {},
  // });
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
.fr {
  float: right;
}
</style>
