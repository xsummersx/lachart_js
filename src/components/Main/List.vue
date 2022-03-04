<!--
 * @Author: your name
 * @Date: 2022-02-21 11:17:10
 * @LastEditTime: 2022-03-03 19:22:31
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart\src\components\Main\List.vue
-->
<template>
  <div class="ListBox">
    <el-row v-if="dataList.length > 0">
      <el-col :span="4" v-for="(item, index) in dataList" :key="index">
        <div class="Item" @click="detail">
          <div class="ItemTitle">{{ item.chartName }}</div>
          <el-image
            style="width: 100%; height: 100%"
            class="ImgBox"
            :src="item.img"
            fit="cover"
          ></el-image>
          <div class="ItemFeet">
            <div class="ItemBox" style="float: left">
              <div class="Title">时间：</div>
              <div class="Content">{{ item.time }}</div>
            </div>
            <div class="ItemBox" style="float: right">
              <div class="Title">收藏量：</div>
              <div class="Content">{{ item.collect }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <div v-else>列表暂无数据</div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { GetAllImageList } from "@/api/API";
const router = useRouter();
const dataList = ref([]);
//mount
onMounted(() => {
  GetAllImageList().then((res) => {
    console.log(res);
    if (res.data.Code == 1) {
      dataList.value = res.data.Data;
    }
  });
});
//跳转到详情页面
const detail = () => {
  router.push("/Main");
};
</script>
<style scoped>
.ListBox {
  width: 98%;
  margin: 20px auto;
  min-height: 790px;
}
.Item {
  width: 90%;
  overflow: hidden;
  background-color: #fff;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
}
.Item:hover {
  box-shadow: 0px 0px 16px #ccc;
}
.ItemTitle {
  line-height: 34px;
  padding: 0 15px;
  color: #666;
  font-weight: bold;
  border-bottom: 1px solid #f1f3f7;
}
.ItemFeet {
  border-top: 1px solid #f1f3f7;
  line-height: 34px;
}
.ItemBox {
  width: 50%;
  display: flex;
  justify-content: center;
}
.Title {
  color: #aaa;
  font-size: 12px;
}
.Content {
  color: #333;
  font-size: 12px;
}
</style>
