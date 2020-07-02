<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">来访登记</el-button>
                <el-button
                    type="danger"
                    :disabled="delCheckBtnDisabled"
                    @click="delCheck"
                    size="small"
                    plain
                >批量删除</el-button>
            </div>
            <div>
                <el-input
                    placeholder="通过访客姓名查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.realName"
                    size="small"
                    clearable
                    style="width: 150px;margin-right: 10px"
                ></el-input>
                <el-input
                    placeholder="通过联系方式查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.telephone"
                    size="small"
                    clearable
                    style="width: 150px;margin-right: 10px"
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
            <el-table-column prop="realName" label="访客名称" width="100"></el-table-column>
            <el-table-column prop="telephone" label="联系方式" width="110"></el-table-column>
            <el-table-column prop="sex" label="性别" width="100" :formatter="formatSex"></el-table-column>
            <el-table-column prop="remark" label="登记备注" width="300"></el-table-column>
            <el-table-column prop="status" label="状态" width="140" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" :formatter="renderTime"></el-table-column>
            <el-table-column label="操作" width="180">
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
        <el-dialog title="来访登记" :visible.sync="dialogVisible" @closed="dialogColosed" width="450px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                size="small"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="访客姓名" prop="realName">
                    <el-input v-model="form.realName" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="联系方式" prop="telephone">
                    <el-input
                        v-model="form.telephone"
                        maxlength="11"
                        show-word-limit
                        style="width:203px"
                    ></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input
                        v-model="form.remark"
                        type="textarea"
                        maxlength="250"
                        show-word-limit
                        :rows="3"
                        style="width:203px"
                    ></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-select v-model="form.sex" placeholder="请选择性别">
                        <el-option label="男" value="1"></el-option>
                        <el-option label="女" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option label="启用" value="1"></el-option>
                        <el-option label="禁用" value="0"></el-option>
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
export default {
    data() {
        return {
            REQUEST_URL: "/visitor/",
            dialogVisible: false,
            keyword: "",
            form: {
                id: "",
                realName: "",
                telephone: "",
                remark: "",
                sex: "1",
                status: "1"
            },
            rules: {
                realName: [
                    {
                        required: true,
                        message: "请输入访客姓名",
                        trigger: "blur"
                    }
                ],
                telephone: [
                    {
                        required: true,
                        message: "请输入手机号码",
                        trigger: "blur"
                    },
                    {
                        pattern: /^1[3456789]\d{9}$/,
                        message: "手机号码格式不正确，请重新输入",
                        trigger: "blur"
                    }
                ],
                sex: [
                    {
                        required: true,
                        message: "请选择性别",
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
            delCheckBtnDisabled: true,
            pagin: {
                total: 0,
                size: 10,
                current: 1
            },
            selectCondition: {
                realName: "",
                telephone: "",
                dates: null
            }
        };
    },
    mounted() {
        this.initTableData();
    },
    methods: {
        initTableData() {
            let url =
                this.REQUEST_URL +
                "?realName=" +
                this.selectCondition.realName +
                "&telephone=" +
                this.selectCondition.telephone +
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
                    this.form.sex = resp.sex == 1 ? "1" : "0";
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
            this.$confirm("确定要删除该类型吗？", "温馨提示", {
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
            return row.status == 1 ? "启用" : "禁用";
        },
        formatSex(row, column, cellValue, index) {
            return row.status == 1 ? "男" : "女";
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