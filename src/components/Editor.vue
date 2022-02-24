<!--
 * @Author: your name
 * @Date: 2022-02-24 14:13:13
 * @LastEditTime: 2022-02-24 16:16:33
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\components\Editor.vue
-->
<template>
  <VAceEditor
    v-model:value="content"
    lang="javascript"
    theme="chrome"
    :options="editorOptions"
    style="height: 300px; width: 400px; border: 1px solid red"
  />
  <el-button @click="codeChange">123</el-button>
</template>
<script>
import { VAceEditor } from "vue3-ace-editor";
import * as ace from "ace-builds/src-noconflict/ace";
//引入主题
import "brace/mode/javascript";
import "brace/theme/chrome";
ace.config.set("basePath", "/assets/ui/");
ace.config.set("modePath", "");
ace.config.set("themePath", "");
export default {
  name: "Editor",
  data() {
    return {
      content: "",
      editorOptions: {
        showPrintMargin: false, //去除编辑器里的竖线
      },
    };
  },
  components: {
    VAceEditor,
  },
  methods: {
    editorInit: function () {},
    codeChange() {
      console.log(this.content);
    },
  },
};
</script>
