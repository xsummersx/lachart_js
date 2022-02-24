<!--
 * @Author: your name
 * @Date: 2022-02-24 14:13:13
 * @LastEditTime: 2022-02-24 16:36:29
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
    style="height: 300px; width: 400px; border: 1px solid #eee"
  />
  <el-button @click="codeChange">格式化</el-button>
</template>
<script>
import { VAceEditor } from "vue3-ace-editor";

//引入主题
import "brace/mode/javascript";
import "brace/theme/chrome";
export default {
  name: "Editor",
  data() {
    return {
      content: "",
      editorOptions: {
        // 设置代码编辑器的样式
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
        fontSize: 14,
        showPrintMargin: false, //去除编辑器里的竖线
      },
    };
  },
  components: {
    VAceEditor,
  },
  mounted() {},
  methods: {
    codeChange() {
      let jsonText = JSON.stringify(this.content);
      this.content = jsonText;
      console.log(this.content);
    },
  },
};
</script>
