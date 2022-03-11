<!--
 * @Author: your name
 * @Date: 2022-02-24 14:13:13
 * @LastEditTime: 2022-03-10 19:42:24
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \lachart_js\src\components\Editor.vue
-->
<template>
  <VAceEditor
    v-model:value="content"
    lang="json"
    theme="chrome"
    :options="editorOptions"
    :style="{ height: aceHeight }"
    style="width: 100%; border: 1px solid #eee"
    ref="editorDOM"
  />
</template>
<script>
import { VAceEditor } from "vue3-ace-editor";

//引入主题
import "brace/mode/json";
import "brace/theme/chrome";
export default {
  name: "Editor",
  props: {
    content: String,
    aceHeight: String,
  },
  data() {
    return {
      editorOptions: {
        // 设置代码编辑器的样式
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
        fontSize: 14,
        showPrintMargin: false, //去除编辑器里的竖线
      },
      enpt: "",
    };
  },
  components: {
    VAceEditor,
  },
  mounted() {
    setTimeout(() => {
      this.forMatter();
    }, 200);
  },
  methods: {
    //延时格式化

    //格式化代码
    forMatter() {
      let cont = this.content;
      //let contStr = JSON.stringify(this.content, null, 2);
      //this.$refs.editorDOM._editor.getSession().setTabSize(2);
      // this.$refs.editorDOM._editor.getSession().setUseWrapMode(true);
      //格式化JSON
      this.$refs.editorDOM._editor.setValue(cont);
    },
    setContent(cont) {
      this.$refs.editorDOM._editor.setValue(cont);
    },
    getContent() {
      return this.$refs.editorDOM._editor.getValue();
    },
  },
};
</script>
