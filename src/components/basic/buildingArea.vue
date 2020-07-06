<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">新增楼栋</el-button>
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
                    placeholder="请输入楼栋"
                    prefix-icon="el-icon-search"
                    v-model="keyword"
                    size="small"
                    style="width: 200px;margin-right: 10px"
                ></el-input>
                <el-button icon="el-icon-search" type="primary" @click="initTableData()" size="small" plain>搜索</el-button>
            </div>
        </div>
        <el-table class="table" :data="tableData" @selection-change="selectionChange" size="small">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="areaName" label="区域名称" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="140" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" :formatter="renderTime"></el-table-column>
            <el-table-column label="操作" width="290">
                <template slot-scope="scope">
                    <el-button
                        @click="editDialog(scope.row)"
                        icon="el-icon-edit"
                        type="success"
                        size="small"
                        plain
                    >编辑</el-button>
                    <el-button
                        @click="addUnitDialog(scope.row)"
                        icon="el-icon-edit"
                        type="warning"
                        size="small"
                        plain
                    >单元管理</el-button>
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
        <el-dialog title="新增区域" :visible.sync="dialogVisible" @closed="dialogColosed" width="450px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="区域名称" prop="areaName">
                    <el-input v-model="form.areaName" size="small"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" size="small" placeholder="请选择用户状态">
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
        <!-- 单元弹窗 -->
        <el-dialog
            title="新增单元"
            :visible.sync="unitDialogVisible"
            @closed="unitDialogColose"
            width="450px"
        >
            <el-form
                :inline="true"
                ref="form"
                :rules="rules"
                :model="form"
                class="demo-form-inline"
            >
                <el-form-item>
                    <el-input v-model="form.areaName" size="mini" placeholder="请输入单元名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="mini" @click="add">添加</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="unitData" stripe style="width: 100%" size="mini">
                <el-table-column prop="areaName" label="单元名称"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button
                            @click="editDialog(scope.row)"
                            icon="el-icon-edit"
                            type="success"
                            size="mini"
                            plain
                        >编辑</el-button>
                        <el-button
                            @click="del(scope.row)"
                            icon="el-icon-delete"
                            type="danger"
                            size="mini"
                            plain
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="unitDialogVisible = false" size="mini" plain>取 消</el-button>
                <el-button type="success" @click="add()" size="mini" plain>确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        let passwordCheck = (rule, value, callback) => {
            console.log(value);
            if (value == "" && this.form.id == "") {
                callback(new Error("请输入密码"));
            } else {
                callback();
            }
        };
        return {
            REQUEST_URL: "/system/basic/buildingArea/",
            dialogVisible: false,
            unitDialogVisible: false,
            keyword: "",
            form: {
                id: "",
                pid: 0,
                areaName: "",
                status: "1"
            },
            rules: {
                areaName: [
                    {
                        required: true,
                        message: "此项不能为空，请输入",
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
            unitData: [
                {
                    date: "2016-05-02",
                    name: "王小虎",
                    address: "上海市普陀区金沙江路 1518 弄"
                }
            ],
            unitTablePid: "",
            tableCheckData: [],
            delCheckBtnDisabled: true,
            pagin: {
                total: 0,
                size: 10,
                current: 1
            }
        };
    },
    mounted() {
        this.initTableData();
    },
    methods: {
        initTableData() {
            this.getRequest(
                this.REQUEST_URL +
                    "?keyWord=" +
                    this.keyword +
                    "&page=" +
                    this.pagin.current +
                    "&size=" +
                    this.pagin.size
            ).then(resp => {
                if (resp) {
                    this.pagin.total = resp.total;
                    this.tableData = resp.data;
                }
            });
        },
        // Table复选框
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
                            if ((this.pagin.total - count) % 10 == 0) {
                                this.pagin.current = this.pagin.current - 1;
                            }
                            this.initTableData();
                        }
                    });
                })
                .catch(() => {});
        },
        addDialog() {
            // this.form = {
            //     id: "",
            //     pid: 0,
            //     areaName: "",
            //     status: "1"
            // };
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
                                    if (this.form.pid == 0) {
                                        this.initTableData();
                                    } else {
                                        this.unitInitData(this.unitTablePid);
                                    }
                                }
                            }
                        );
                    } else {
                        this.putRequest(this.REQUEST_URL, this.form).then(
                            resp => {
                                if (resp) {
                                    this.dialogVisible = false;
                                    if (this.form.pid == 0) {
                                        this.initTableData();
                                    } else {
                                        this.unitInitData(this.unitTablePid);
                                    }
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
            this.$confirm("确定要删除该区域吗？", "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
                .then(() => {
                    this.deleteRequest(this.REQUEST_URL + row.id).then(
                        response => {
                            if (response) {
                                if ((this.pagin.total - 1) % 10 == 0) {
                                    this.pagin.current = this.pagin.current - 1;
                                }
                                if (this.form.pid == 0) {
                                    this.initTableData();
                                } else {
                                    this.unitInitData(this.unitTablePid);
                                }
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
        // ------------ 子单元 ------------
        unitInitData() {
            this.getRequest(
                this.REQUEST_URL + "/getUnit/" + this.unitTablePid
            ).then(resp => {
                if (resp) {
                    this.unitData = resp;
                }
            });
        },
        addUnitDialog(row) {
            this.form.pid = row.id;
            this.unitTablePid = row.id;
            this.unitInitData();
            this.unitDialogVisible = true;
        },
        unitDialogColose() {
            this.unitTablePid = "";
            this.unitData = [];
        },
        unitEditDialog() {},
        unitAdd() {}
    }
};
</script>
<style lang="scss" scoped>
.main {
    .search-main {
        width: 80%;
        display: flex !important;
        justify-content: space-between !important;
        margin-bottom: 10px;
    }
    .table {
        width: 80%;
    }
    .pagination {
        margin-top: 10px;
    }
}
</style>