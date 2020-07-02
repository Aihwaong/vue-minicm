<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">新增通知</el-button>
                <el-button
                    type="danger"
                    :disabled="delCheckBtnDisabled"
                    @click="delCheck"
                    size="small"
                    plain
                >批量删除</el-button>
            </div>
            <div>
                <el-select
                    v-model="selectCondition.typeId"
                    placeholder="通过分类查找"
                    size="small"
                    style="width: 150px;margin-right: 5px"
                    clearable
                >
                    <el-option
                        v-for="(item, key) in noticeTypeData"
                        :key="key"
                        :label="item.typeName"
                        :value="item.id"
                    ></el-option>
                </el-select>
                <el-input
                    placeholder="通过通知名称查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.title"
                    size="small"
                    clearable
                    style="width: 170px;margin-right: 10px"
                ></el-input>
                <el-input
                    placeholder="通过编辑名称查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.editor"
                    size="small"
                    clearable
                    style="width: 170px;margin-right: 10px"
                ></el-input>
                <el-date-picker
                    v-model="selectCondition.dates"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    size="small"
                    style="width: 300px;margin-right: 10px"
                ></el-date-picker>
                <el-button
                    icon="el-icon-search"
                    type="primary"
                    @click="initTableData()"
                    size="small"
                    plain
                >搜索</el-button>
            </div>
        </div>
        <el-table class="table" :data="tableData" @selection-change="selectionChange" size="small">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="typeName" label="通知分类" width="100"></el-table-column>
            <el-table-column prop="title" label="通知名称" width="200"></el-table-column>
            <el-table-column prop="editor" label="编辑名称" width="100"></el-table-column>
            <el-table-column prop="description" label="通知简要" width="250"></el-table-column>
            <el-table-column prop="status" label="状态" width="140" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" :formatter="renderTime"></el-table-column>
            <el-table-column fixed="right" label="操作" width="180">
                <template slot-scope="scope">
                    <el-button
                        @click="editDialog(scope.row)"
                        icon="el-icon-edit"
                        type="success"
                        size="small"
                        plain
                    >编辑</el-button>
                    <el-button
                        @click="del(scope.row)"
                        icon="el-icon-delete"
                        type="danger"
                        size="small"
                        plain
                    >删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
            class="pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagin.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagin.total"
        ></el-pagination>
        <!-- 弹窗 -->
        <el-dialog
            title="新增通知"
            :visible.sync="dialogVisible"
            @closed="dialogColosed"
            width="1000px"
        >
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                size="small"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="通知类型" prop="typeId">
                    <el-select v-model="form.typeId" placeholder="请选择类型">
                        <el-option
                            v-for="(item, key) in noticeTypeData"
                            :key="key"
                            :label="item.typeName"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="编辑" prop="editor">
                    <el-input
                        v-model="form.editor"
                        maxlength="20"
                        show-word-limit
                        style="width:203px"
                    ></el-input>
                </el-form-item>
                <el-form-item label="通知标题" prop="title">
                    <el-input
                        v-model="form.title"
                        maxlength="50"
                        show-word-limit
                        style="width:250px"
                    ></el-input>
                </el-form-item>

                <el-form-item label="简要" prop="description">
                    <el-input
                        v-model="form.description"
                        type="textarea"
                        maxlength="250"
                        show-word-limit
                        :rows="3"
                        style="width:250px"
                    ></el-input>
                </el-form-item>
                <el-form-item label="通知内容">
                    <quill-editor
                        class="editor"
                        v-model="form.content"
                        ref="myQuillEditor"
                        :options="editorOption"
                        @blur="onEditorBlur($event)"
                        @focus="onEditorFocus($event)"
                        @change="onEditorChange($event)"
                    ></quill-editor>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态" style="width:100px">
                        <el-option label="发布" value="1"></el-option>
                        <el-option label="草稿" value="0"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false" size="small" plain>取 消</el-button>
                <el-button type="success" @click="add()" size="small" plain>确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { quillEditor } from "vue-quill-editor";
export default {
    data() {
        return {
            REQUEST_URL: "/notice/",
            dialogVisible: false,
            keyword: "",
            form: {
                id: "",
                typeId: "",
                title: "",
                editor: "",
                description: "",
                content: "",
                status: "1"
            },
            rules: {
                title: [
                    {
                        required: true,
                        message: "请输入通知标题",
                        trigger: "blur"
                    }
                ],
                editor: [
                    {
                        required: true,
                        message: "请输入编辑名称",
                        trigger: "blur"
                    }
                ],
                description: [
                    {
                        required: true,
                        message: "请输入通知简要",
                        trigger: "blur"
                    }
                ],
                typeId: [
                    {
                        required: true,
                        message: "请选择类型",
                        trigger: "blur"
                    }
                ],
                status: [
                    {
                        required: true,
                        message: "请选择状态",
                        trigger: "blur"
                    }
                ]
            },
            tableData: [],
            tableCheckData: [],
            noticeTypeData: [],
            delCheckBtnDisabled: true,
            pagin: {
                total: 0,
                size: 10,
                current: 1
            },
            selectCondition: {
                typeId: "",
                title: "",
                editor: "",
                dates: []
            },
            // ------  Editor -------
            content: null,
            editorOption: {}
        };
    },
    mounted() {
        this.initTableData();
        this.initNoticeTypeData();
    },
    methods: {
        initTableData() {
            let url =
                this.REQUEST_URL +
                "?typeId=" +
                this.selectCondition.typeId +
                "&title=" +
                this.selectCondition.title +
                "&editor=" +
                this.selectCondition.editor +
                "&page=" +
                this.pagin.current +
                "&size=" +
                this.pagin.size;
            if (
                this.selectCondition.dates != null &&
                this.selectCondition.dates != ""
            ) {
                url += "&dates=" + this.selectCondition.dates;
            }
            this.getRequest(url).then(resp => {
                if (resp) {
                    this.pagin.total = resp.total;
                    this.tableData = resp.data;
                }
            });
        },
        initNoticeTypeData() {
            this.getRequest(this.REQUEST_URL + "noticeType/").then(response => {
                if (response) {
                    this.noticeTypeData = response;
                }
            });
        },
        selectionChange(selection) {
            if (selection.length > 0) {
                this.delCheckBtnDisabled = false;
            } else {
                this.delCheckBtnDisabled = true;
            }
            this.tableCheckData = selection;
        },
        delCheck() {
            let count = this.tableCheckData.length;
            let url = this.REQUEST_URL + "?";
            this.tableCheckData.forEach(element => {
                url += "idList=" + element.id + "&";
            });
            console.log(url);
            this.$confirm("您确定要删除这" + count + "条数据吗？", "温馨提示", {
                confirmButtonText: "删 除",
                cancelButtonText: "取 消",
                type: "warning",
                center: true
            })
                .then(() => {
                    this.deleteRequest(url).then(response => {
                        if (response) {
                            let num = this.pagin.total - count;
                            if (num != 0 && num % 10 == 0) {
                                this.pagin.current = this.pagin.current - 1;
                            }
                            this.initTableData();
                        }
                    });
                })
                .catch(() => {});
        },
        addDialog() {
            this.dialogVisible = true;
        },
        editDialog(row) {
            this.getRequest(this.REQUEST_URL + row.id).then(resp => {
                if (resp) {
                    this.form = resp;
                    this.form.status = resp.status == 1 ? "1" : "0";
                }
            });
            this.dialogVisible = true;
        },
        add(data) {
            this.$refs.form.validate(valid => {
                if (valid) {
                    if (this.form.id == "") {
                        this.postRequest(this.REQUEST_URL, this.form).then(
                            resp => {
                                if (resp) {
                                    this.dialogVisible = false;
                                    this.initTableData();
                                }
                            }
                        );
                    } else {
                        this.putRequest(this.REQUEST_URL, this.form).then(
                            resp => {
                                if (resp) {
                                    this.dialogVisible = false;
                                    this.initTableData();
                                }
                            }
                        );
                    }
                } else {
                    return false;
                }
            });
        },
        del(row) {
            this.$confirm("确定要删除该通知吗？", "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
                .then(() => {
                    this.deleteRequest(this.REQUEST_URL + row.id).then(
                        response => {
                            if (response) {
                                let num = this.pagin.total - 1;
                                if (num != 0 && num % 10 == 0) {
                                    this.pagin.current = this.pagin.current - 1;
                                }
                                this.initTableData();
                            }
                        }
                    );
                })
                .catch(() => {});
        },
        dialogColosed() {
            if (this.$refs["form"] != undefined) {
                this.form.id = "";
                this.$refs["form"].resetFields();
                this.$refs["form"].clearValidate();
            }
        },
        renderTime(row, column, cellValue, index) {
            var date = new Date(row.createTime).toJSON();
            return new Date(+new Date(date) + 8 * 3600 * 1000)
                .toISOString()
                .replace(/T/g, " ")
                .replace(/\.[\d]{3}Z/, "");
        },
        formatStatus(row, column, cellValue, index) {
            return row.status == 1 ? "发布" : "草稿";
        },
        // ------------ 分页 ------------
        // 每页数量改变回调
        handleSizeChange(size) {
            this.pagin.size = size;
            this.initTableData();
        },
        // 页数改变回调
        handleCurrentChange(current) {
            console.log("CurrentChange" + current);
            this.pagin.current = current;
            this.initTableData();
        },
        // ------------ Editor -------------
        onEditorBlur() {},
        onEditorFocus() {
            //获得焦点事件
        },
        onEditorChange(content) {
            //内容改变事件
            // this.form.content = content.html;
            console.log(this.form);
        }
    }
};
</script>
<style lang="scss" scoped>
.main {
    .search-main {
        width: 90%;
        display: flex !important;
        justify-content: space-between !important;
        margin-bottom: 10px;
    }
    .table {
        width: 90%;
    }
    .pagination {
        margin-top: 10px;
    }
}
</style>