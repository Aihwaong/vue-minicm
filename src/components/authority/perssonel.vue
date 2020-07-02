<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">新增职员</el-button>
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
                    placeholder="请输入职员名称"
                    prefix-icon="el-icon-search"
                    v-model="keyword"
                    size="small"
                    style="width: 350px;margin-right: 10px"
                ></el-input>
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
            <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
            <el-table-column prop="telephone" label="联系方式" width="140"></el-table-column>
            <el-table-column prop="account" label="登录账号" width="140"></el-table-column>
            <el-table-column prop="remark" label="备注"></el-table-column>
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
        <el-dialog title="新增职员" :visible.sync="dialogVisible" @closed="dialogColosed" width="450px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                label-width="90px"
                size="small"
                hide-required-asterisk
            >
                <el-form-item label="职员姓名" prop="realName">
                    <el-input v-model="form.realName"></el-input>
                </el-form-item>
                <el-form-item label="联系号码" prop="telephone">
                    <el-input v-model="form.telephone"></el-input>
                </el-form-item>
                <el-form-item label="登录账号" prop="account">
                    <el-input v-model="form.account"></el-input>
                </el-form-item>
                <el-form-item label="登录密码" prop="password">
                    <el-input v-model="form.password" placeholder="编辑时不填默认不修改"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" v-model="form.remark" maxlength="250" show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="用户状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择用户状态">
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
        let passwordCheck = (rule, value, callback) => {
            console.log(value);
            if (value == "" && this.form.id == "") {
                callback(new Error("请输入密码"));
            } else {
                callback();
            }
        };
        return {
            REQUEST_URL: "/system/authority/perssonel/",
            dialogVisible: false,
            keyword: "",
            form: {
                id: "",
                realName: "",
                telephone: "",
                account: "",
                password: "",
                remark: "",
                status: "1"
            },
            rules: {
                realName: [
                    {
                        required: true,
                        message: "请输入职员姓名",
                        trigger: "blur"
                    }
                ],
                telephone: [
                    {
                        required: true,
                        message: "请输入联系号码",
                        trigger: "blur"
                    },
                    {
                        pattern: /^1[3456789]\d{9}$/,
                        message: "手机号码格式不正确，请重新输入",
                        trigger: "blur"
                    }
                ],
                account: [
                    {
                        required: true,
                        message: "请输入登录账号",
                        trigger: "blur"
                    }
                ],
                password: [{ validator: passwordCheck, trigger: "blur" }],
                path: [
                    {
                        required: true,
                        message: "请输入登录密码",
                        trigger: "blur"
                    }
                ],
                status: [
                    {
                        required: true,
                        message: "请选择用户状态",
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
            this.$confirm("确定要删除该职员吗？", "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
                .then(() => {
                    this.deleteRequest(this.REQUEST_URL + row.id).then(
                        response => {
                            if (response) {
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