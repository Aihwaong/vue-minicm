<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">车辆登记</el-button>
                <el-button
                    type="danger"
                    :disabled="delCheckBtnDisabled"
                    @click="delCheck"
                    size="small"
                    plain
                >批量删除</el-button>
            </div>
            <div>
                <el-select v-model="selectCondition.external" size="small" style="width:150px;margin-right:5px" placeholder="通过状态查找">
                        <el-option label="允许通行" value="1"></el-option>
                        <el-option label="禁止通行" value="0"></el-option>
                    </el-select>
                <el-input
                    placeholder="通过车牌号查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.plateNumber"
                    size="small"
                    style="width: 200px;margin-right: 10px"
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
            <el-table-column prop="plateNumber" label="车牌号码" width="100"></el-table-column>
            <el-table-column prop="contacts" label="联系人" width="100"></el-table-column>
            <el-table-column prop="telephone" label="联系电话" width="100"></el-table-column>
            <el-table-column prop="brand" label="车辆品牌" width="100"></el-table-column>
            <el-table-column prop="type" label="车辆型号" width="100"></el-table-column>
            <el-table-column prop="external" label="登记来源" width="100" :formatter="formatExternal"></el-table-column>
            <el-table-column prop="status" label="通行状态" width="140" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="登记时间" width="180" :formatter="renderTime"></el-table-column>
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
        <el-dialog title="新增类型" :visible.sync="dialogVisible" @closed="dialogColosed" width="400px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                size="small"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="登记来源" prop="external">
                    <el-select v-model="form.external" @change="externalChange" placeholder="请选择来源">
                        <el-option label="小区业主" value="0"></el-option>
                        <el-option label="外来车辆" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="查询业主" v-if="external">
                    <el-autocomplete
                        class="inline-input"
                        v-model="state"
                        :fetch-suggestions="querySearch"
                        placeholder="请输入业主姓名或联系方式"
                        :trigger-on-focus="false"
                        @select="handleSelect"
                        size="small"
                        style="width: 203px"
                    >
                        <i class="el-icon-search" slot="suffix"></i>
                        <template slot-scope="{ item }">
                            <div class="name">{{ item.realName }}</div>
                            <span class="phone">{{ item.telephone }}</span>
                        </template>
                    </el-autocomplete>
                </el-form-item>
                <el-form-item label="车牌号码" prop="plateNumber">
                    <el-input v-model="form.plateNumber" style="width: 203px"></el-input>
                </el-form-item>
                <el-form-item label="联系人" prop="contacts">
                    <el-input v-model="form.contacts" style="width: 203px" :disabled="external"></el-input>
                </el-form-item>
                <el-form-item label="联系号码" prop="telephone">
                    <el-input v-model="form.telephone" style="width: 203px" :disabled="external"></el-input>
                </el-form-item>
                <el-form-item label="车辆品牌" prop="brand">
                    <el-input v-model="form.brand" style="width: 203px"></el-input>
                </el-form-item>
                <el-form-item label="车辆型号" prop="type">
                    <el-input v-model="form.type" style="width: 203px"></el-input>
                </el-form-item>

                <el-form-item label="通行状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option label="允许通行" value="1"></el-option>
                        <el-option label="禁止通行" value="0"></el-option>
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
            REQUEST_URL: "/vehicle/",
            dialogVisible: false,
            keyword: "",
            form: {
                id: "",
                householdId: "",
                plateNumber: "",
                contacts: "",
                telephone: "",
                brand: "",
                type: "",
                external: "0",
                status: "1"
            },
            state: "",
            external: true,
            rules: {
                plateNumber: [
                    {
                        required: true,
                        message: "请输入车牌号码",
                        trigger: "blur"
                    },
                    {
                        pattern: /(^[\u4E00-\u9FA5]{1}[A-Z0-9]{6}$)|(^[A-Z]{2}[A-Z0-9]{2}[A-Z0-9\u4E00-\u9FA5]{1}[A-Z0-9]{4}$)|(^[\u4E00-\u9FA5]{1}[A-Z0-9]{5}[挂学警军港澳]{1}$)|(^[A-Z]{2}[0-9]{5}$)|(^(08|38){1}[A-Z0-9]{4}[A-Z0-9挂学警军港澳]{1}$)/,
                        message: "车牌号码不正确，请重新输入",
                        trigger: "blur"
                    }
                ],
                contacts: [
                    {
                        required: true,
                        message: "请输入联系人",
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
                brand: [
                    {
                        required: true,
                        message: "请输入车辆品牌",
                        trigger: "blur"
                    }
                ],
                external: [
                    {
                        required: true,
                        message: "请选择登记来源",
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
                plateNumber: "",
                external: "",
            },
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
            return row.status == 1 ? "允许通行" : "禁止通行";
        },
        formatExternal(row, column, cellValue, index) {
            return row.external == "1" ? "外来车辆" : "小区车辆";
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
        externalChange(value) {
            if (value == 1) {
                this.external = false;
            } else {
                this.external = true;
            }
            if (this.$refs["form"] != undefined) {
                this.$refs["form"].resetFields();
                this.$refs["form"].clearValidate();
            }
        },
        querySearch(queryString, cb) {
            console.log(queryString);
            // 调用 callback 返回建议列表的数据
            this.getRequest(
                this.REQUEST_URL + "houseHolds/?keyword=" + queryString
            ).then(response => {
                if (response) {
                    cb(response);
                }
            });
        },
        // 选中
        handleSelect(item) {
            this.state = item.realName;
            this.form.householdId = item.id;
            this.form.contacts = item.realName;
            this.form.telephone = item.telephone;
            console.log(item);
            console.log(this.state);
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