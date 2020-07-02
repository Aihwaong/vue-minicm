<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-dropdown @command="delCheck">
                    <el-button
                        size="small"
                        type="primary"
                        style="margin-right: 5px;margin-left: 5px"
                        plain
                        :disabled="delCheckBtnDisabled"
                    >
                        批量处理
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="2">处理中</el-dropdown-item>
                        <el-dropdown-item command="3">已处理</el-dropdown-item>
                        <el-dropdown-item command="4">已取消</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <div>
                <el-select v-model="selectCondition.repairTypeId" clearable placeholder="通过分类查找" size="small" style="width: 140px;margin-right: 5px">
                    <el-option v-for="(item, key) in repairTypeData" :key="key" :label="item.title" :value="item.id"></el-option>
                </el-select>
                <el-select v-model="selectCondition.status" clearable placeholder="请选择状态" size="small" style="width: 140px;margin-right: 5px">
                    <el-option label="待处理" value="1"></el-option>
                    <el-option label="处理中" value="2"></el-option>
                    <el-option label="已处理" value="3"></el-option>
                    <el-option label="已取消" value="4"></el-option>
                </el-select>
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
            <el-table-column prop="repairTypeName" label="报修类型" width="100"></el-table-column>
            <el-table-column prop="description" label="报修内容" :formatter="formatContent" width="450"></el-table-column>
            <el-table-column prop="status" label="状态" :formatter="formatStatus" width="100"></el-table-column>
            <el-table-column prop="createTime" label="报修时间" width="180" :formatter="renderTime"></el-table-column>
            <el-table-column label="操作" width="280">
                <template slot-scope="scope">
                    <el-button
                        @click="editDialog(scope.row)"
                        icon="el-icon-search"
                        type="success"
                        size="small"
                        plain
                    >查看</el-button>
                    <el-dropdown @command="commandClick">
                        <el-button
                            size="small"
                            type="primary"
                            style="margin-right: 5px;margin-left: 5px"
                            plain
                        >
                            报修处理
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item :command="{status:2, title:'处理中', data:scope.row}">处理中</el-dropdown-item>
                            <el-dropdown-item :command="{status:3, title:'已处理', data:scope.row}">已处理</el-dropdown-item>
                            <el-dropdown-item :command="{status:4, title:'已取消', data:scope.row}">已取消</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
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
        <el-dialog title="报修详情" :visible.sync="dialogVisible" @closed="dialogColosed">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                size="small"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="报修类型" prop="hallName">
                    <el-input v-model="form.repairTypeName" :disabled="true" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="类型名称" prop="hallName">
                    <el-input v-model="form.description" type="textarea" :rows="5" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-input v-model="form.status" :disabled="true" style="width:203px"></el-input>    
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false" size="small" plain>关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            REQUEST_URL: "/repair/",
            dialogVisible: false,
            keyword: "",
            form: {
                id: "",
                status: "1"
            },
            rules: {
                hallName: [
                    {
                        required: true,
                        message: "请输入类型名称",
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
            repairTypeData:[],
            selectCondition: {
                repairTypeId:"",
                status:"",
            }
        };
    },
    mounted() {
        this.initTableData();
        this.initRepairTypeData ();
    },
    methods: {
        initTableData() {
            this.getRequest(
                this.REQUEST_URL +
                    "?repairTypeId=" +
                    this.selectCondition.repairTypeId +
                    "&status=" +
                    this.selectCondition.status +
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
        initRepairTypeData () {
            this.getRequest(this.REQUEST_URL + "repairType/").then(response => {
                if (response) {
                    this.repairTypeData = response;
                }
            })
        },
        selectionChange(selection) {
            if (selection.length > 0) {
                this.delCheckBtnDisabled = false;
            } else {
                this.delCheckBtnDisabled = true;
            }
            this.tableCheckData = selection;
        },
        delCheck(status) {
            let count = this.tableCheckData.length;
            let url = this.REQUEST_URL + "sta/?status=" + status;
            this.tableCheckData.forEach(element => {
                url += "&idList=" + element.id;
            });
            console.log(url);
            this.$confirm("您确定要处理这" + count + "条数据吗？", "温馨提示", {
                confirmButtonText: "确 定",
                cancelButtonText: "取 消",
                type: "warning",
                center: true
            })
                .then(() => {
                    this.putRequest(url).then(response => {
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
                    this.form.status = this.formatStatus(resp);
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
            this.$confirm("确定要删除该数据吗？", "温馨提示", {
                confirmButtonText: "确 定",
                cancelButtonText: "取 消",
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
        formatStatus(row) {
            // return row.status == 1 ? "启用" : "禁用";
            switch (row.status) {
                case 1:
                    return "待处理";
                    break;
                case 2:
                    return "处理中";
                    break;
                case 3:
                    return "已处理";
                    break;
                case 4:
                    return "已取消";
                    break;
            }
        },
        formatContent(row, column, cellValue, index) {
            return row.description.substr(0, 50) + "...";
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
        commandClick(row) {
            console.log(row);
            this.form.id = row.data.id;
            this.form.status = row.status;
            console.log(this.form);
            this.$confirm(
                "确定要将该数据修改成" + row.title + "吗？",
                "温馨提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true
                }
            )
                .then(() => {
                    this.putRequest(this.REQUEST_URL, this.form).then(resp => {
                        if (resp) {
                            this.initTableData();
                        }
                    });
                })
                .catch(() => {});
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