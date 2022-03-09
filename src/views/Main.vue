<!--
 * @Author: your name
 * @Date: 2022-02-21 16:04:36
 * @LastEditTime: 2022-03-09 13:49:41
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
      <el-button
        class="fl"
        @click="saveBtn"
        type="success"
        v-if="store.$state.UserInfo.UserID == creatID && store.$state.UserInfo.UserID"
        >保存</el-button
      >
      <el-button
        class="fl"
        type="primary"
        :plain="IsPlain"
        @click="CollectBtn"
        v-if="false"
        :icon="Star"
        >收藏</el-button
      >
      <el-button
        class="fl"
        @click="delBtn"
        type="danger"
        v-if="store.$state.UserInfo.UserID == creatID && store.$state.UserInfo.UserID"
        >删除</el-button
      >
      <el-input
        v-if="store.$state.UserInfo.UserID == creatID && store.$state.UserInfo.UserID"
        class="fl"
        autocomplete="off"
        placeholder="请输入统计图名称"
        v-model="chartName"
        style="width: 350px; margin-left: 12px"
        :rules="[
          {
            min: 2,
            max: 30,
            message: '请输入2~30位文本',
          },
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur',
          },
        ]"
      ></el-input>
      <el-select
        v-if="store.$state.UserInfo.UserID == creatID && store.$state.UserInfo.UserID"
        v-model="chartType"
        placeholder="请选择类型"
      >
        <el-option label="折线图" value="饼图"></el-option>
        <el-option label="柱状图" value="柱状图"></el-option>
        <el-option label="饼图" value="饼图"></el-option>
        <el-option label="散点图" value="散点图"></el-option>
        <el-option label="地理坐标图" value="地理坐标图"></el-option>
        <el-option label="雷达图" value="雷达图"></el-option>
        <el-option label="仪表盘" value="仪表盘"></el-option>
        <el-option label="3D图" value="3D图"></el-option>
        <el-option label="其他类型" value="其他类型"></el-option>
      </el-select>
      <el-tag class="ml-2 tag fr" type="danger">echarts：5.3.0</el-tag>
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
import { NewChart } from "@/api/API";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/store/index";
//接口
import { UploadImage, SaveImageType, GetOnlyImageInfo, DeleteImageNum } from "@/api/API";
import { ElMessageBox } from "element-plus";
const store = useStore();
let content = ref(""); //统计图的Option
//子组件的类
const editor = ref(null);
const aceHeight = ref("816px"); //框的高度
//router
const route = useRoute();
const router = useRouter();
let myChart;
//统计图基本信息
const Num = ref("");
const chartName = ref(""); //统计图的名字
const chartType = ref(""); //统计图类型
const creatID = ref(""); //创建者名字
//钩子函数
onMounted(() => {
  myChart = init(document.getElementById("Main"));
  //新建的页面
  if (!route.query.Num) {
    content.value = NewChart().option;
    let myStr = `myChart.setOption(${content.value})`;
    eval(myStr);
  } else {
    //旧的页面
    GetOnlyImageInfo({ Num: route.query.Num }).then((res) => {
      Num.value = route.query.Num;
      chartName.value = res.data.Data.ChartName;
      chartType.value = res.data.Data.Type;
      creatID.value = res.data.Data.CreatID;
      content.value = res.data.Data.Option;
      //let option = eval(content.value);
      let myStr = `myChart.setOption(${content.value})`;
      eval(myStr);
    });
  }
});
/*
 * 模块说明
 * @ 统计图option操作模块
 */
const BtnReload = () => {
  myChart = init(document.getElementById("Main"));
  let myStr = `myChart.setOption(${editor.value.content})`;
  eval(myStr);
};
//格式化代码
const Format = () => {
  editor.value.forMatter();
};
/*
 * 模块说明
 * @ 收藏模块
 */
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
/*
 * 模块说明
 * @ 保存模块
 */
//保存方法
const saveBtn = async () => {
  if (chartName.value == "" || chartType.value == "") {
    ElMessage({
      message: "统计图名称或类型不能为空~",
      type: "warning",
    });
  } else {
    let chartID = "";
    console.log("Num:" + Num.value);
    if (Num.value) {
      chartID = Num.value;
    } else {
      chartID = new Date().getTime() + store.$state.UserInfo.UserID;
    }
    //第一步上传图片
    let imgResult = await uploadPic(chartID);
    if (imgResult.data.Code == 1) {
      //第二部保存图片路径
      let imgInfo = {
        Type: chartType.value,
        ChartName: chartName.value,
        Option: content.value,
        Img: imgResult.data.Data,
        CreatName: store.$state.UserInfo.UserName,
        CreatID: store.$state.UserInfo.UserID,
      };
      let obj = {
        Num: chartID,
        UserID: store.$state.UserInfo.UserID,
        ImageInfo: JSON.stringify(imgInfo),
      };
      SaveImageType(obj).then((res) => {
        if (res.data.Code == 1) {
          ElMessage({
            message: "保存成功~",
            type: "success",
          });
        }
        router.push("/Main?Num=" + chartID);
        setTimeout(() => {
          window.location.reload();
        }, 800);
      });
    } else {
      ElMessage({
        message: "图片上传失败~",
        type: "error",
      });
    }
  }
};
//图片上传
const uploadPic = async (chartID) => {
  let offcan = myChart.getDataURL({
    pixelRatio: 2,
    backgroundColor: "#fff",
  });
  var blob = b64toBlob(offcan);
  const formData = new FormData();
  formData.append("file", blob);
  let response = await UploadImage(formData, { Num: chartID });
  return response;
};
const b64toBlob = (dataurl, filename = "file") => {
  let arr = dataurl.split(",");
  let mime = arr[0].match(/:(.*?);/)[1];
  let suffix = mime.split("/")[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime,
  });
};
/*
 * 模块说明
 * @ 删除模块
 */
const delBtn = () => {
  ElMessageBox.confirm("是否确定删除本作品？", "删除", {
    confirmButtonText: "是",
    cancelButtonText: "否",
  })
    .then(() => {
      DeleteImageNum({ Num: Num.value }).then((res) => {
        if (res.data.Data) {
          ElMessage({
            message: "删除成功，即将关闭页面~",
            type: "success",
          });
          setTimeout(() => {
            window.close();
          }, 1200);
        }
      });
    })
    .catch(() => {
      ElMessage({
        message: "删除失败~",
        type: "error",
      });
    });
};
</script>
<style scoped lang="scss">
.headerShaw {
  box-shadow: 0px 0px 16px #666;
  position: relative;
  z-index: 100;
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
