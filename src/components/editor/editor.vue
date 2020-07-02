
<template>
    <quill-editor
        class="editor"
        v-model="content"
        ref="myQuillEditor"
        :options="editorOption"
        @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)"
        @change="onEditorChange($event)"
    ></quill-editor>
</template>
<script>
import { quillEditor } from "vue-quill-editor";
export default {
    name: "Editor",
    data() {
        return {
            content: null,
            editorOption: {}
        };
    },
    methods: {
        onEditorBlur() {},
        onEditorFocus() {
            //获得焦点事件
        },
        onEditorChange() {
            //内容改变事件
        }
    }
};
</script>