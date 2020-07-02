<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">新增车位</el-button>
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
                    v-model="selectCondition.parkingAreaId"
                    placeholder="通过停车场查找"
                    size="small"
                    clearable
                    style="width: 203px;margin-right: 10px"
                >
                    <el-option
                        v-for="(item, key) in parkingAreaData"
                        :key="key"
                        :label="item.areaName"
                        :value="item.id"
                        clearable
                    ></el-option>
                </el-select>
                <el-input
                    placeholder="通过车位编号查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.number"
                    size="small"
                    style="width: 203px;margin-right: 10px"
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
            <el-table-column prop="areaName" label="所在停车场"></el-table-column>
            <el-table-column prop="number" label="车位编号" width="100"></el-table-column>
            <el-table-column prop="measure" label="车位面积"></el-table-column>
            <el-table-column prop="business" label="使用情况" :formatter="formatSBusiness"></el-table-column>
            <el-table-column prop="status" label="状态" width="140" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" :formatter="renderTime"></el-table-column>
            <el-table-column label="操作" width="300">
                <template slot-scope="scope">
                    <el-button
                        @click="editDialog(scope.row)"
                        icon="el-icon-edit"
                        type="success"
                        size="small"
                        plain
                    >编辑</el-button>
                    <el-button
                        @click="registerDialog(scope.row)"
                        icon="el-icon-document-checked"
                        type="warning"
                        size="small"
                        plain
                    >使用登记</el-button>
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
        <el-dialog title="新增车位" :visible.sync="dialogVisible" @closed="dialogColosed" width="400px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="所在车位" prop="parkingAreaId">
                    <el-select v-model="form.parkingAreaId" placeholder="请选择车位" size="small">
                        <el-option
                            v-for="(item, key) in parkingAreaData"
                            :key="key"
                            :label="item.areaName"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车位编号" prop="number">
                    <el-input v-model="form.number" size="small" style="width: 203px"></el-input>
                </el-form-item>
                <el-form-item label="车位面积" prop="measure">
                    <el-input v-model="form.measure" size="small" style="width: 203px"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态" size="small">
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
        <!-- 使用登记 -->
        <el-dialog
            title="使用登记"
            :visible.sync="registerDialogVisible"
            @closed="registerDialogColosed"
            width="400px"
        >
            <el-form
                ref="registerForm"
                :rules="registerRules"
                :model="registerForm"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="查询业主" v-if="isRegister">
                    <el-autocomplete
                        class="inline-input"
                        popper-class="my-autocomplete"
                        v-model="registerForm.state"
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
                <el-form-item label="车位编号" prop="number">
                    <el-input
                        v-model="registerForm.number"
                        size="small"
                        :disabled="true"
                        style="width: 203px"
                    ></el-input>
                </el-form-item>
                <el-form-item label="业主姓名" prop="houseHoldName">
                    <el-input
                        v-model="registerForm.houseHoldName"
                        size="small"
                        style="width: 203px"
                        :disabled="true"
                    ></el-input>
                </el-form-item>
                <el-form-item label="联系方式" prop="measure">
                    <el-input
                        v-model="registerForm.houseHoldTelephone"
                        size="small"
                        style="width: 203px"
                        :disabled="true"
                    ></el-input>
                </el-form-item>
                <el-form-item label="登记方式" prop="status">
                    <el-select
                        v-model="registerForm.registerWay"
                        :disabled="!isRegister"
                        placeholder="请选择状态"
                        size="small"
                    >
                        <el-option label="购买" value="1"></el-option>
                        <el-option label="租赁" value="0"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="registerDialogVisible = false" size="small" plain>取 消</el-button>
                <el-button
                    type="danger"
                    v-if="!isRegister"
                    @click="deRegister()"
                    size="small"
                    plain
                >撤 销</el-button>
                <el-button
                    type="success"
                    v-if="isRegister"
                    @click="enRegister()"
                    size="small"
                    plain
                >登 记</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            REQUEST_URL: "/parking/",
            dialogVisible: false,
            keyword: "",
            form: {
                id: "",
                number: "",
                parkingAreaId: "",
                measure: "",
                remark: "",
                status: "1"
            },
            rules: {
                number: [
                    {
                        required: true,
                        message: "请输入车位编号",
                        trigger: "blur"
                    }
                ],
                parkingAreaId: [
                    {
                        required: true,
                        message: "请选择所在车位",
                        trigger: "blur"
                    }
                ],
                measure: [
                    {
                        required: true,
                        message: "请输入车位面积",
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
            parkingAreaData: [],
            delCheckBtnDisabled: true,
            pagin: {
                total: 0,
                size: 10,
                current: 1
            },
            selectCondition: {
                number: "",
                parkingAreaId: ""
            },
            // 使用登记
            registerDialogVisible: false,
            isRegister: true,
            state: "",
            registerForm: {
                state: "",
                number: "",
                houseHoldId: "",
                parkingLotId: "",
                registerWay: "0",
                houseHoldName: "",
                houseHoldTelephone: ""
            },
            registerRules: {
                houseHoldName: [
                    {
                        required: true,
                        message: "请选择业主",
                        trigger: "blur"
                    }
                ]
            }
        };
    },
    mounted() {
        this.initTableData();
        this.initParkingAreaData();
    },
    methods: {
        initTableData() {
            this.getRequest(
                this.REQUEST_URL +
                    "?number=" +
                    this.selectCondition.number +
                    "&parkingAreaId=" +
                    this.selectCondition.parkingAreaId +
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
        initParkingAreaData() {
            this.getRequest(this.REQUEST_URL + "parkingAreas/").then(
                response => {
                    if (response) {
                        this.parkingAreaData = response;
                    }
                }
            );
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
            this.$confirm("确定要删除该车位吗？", "温馨提示", {
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
        formatSBusiness(row, column, cellValue, index) {
            switch (row.business) {
                case 1:
                    return "空置";
                    break;
                case 2:
                    return "租赁";
                    break;
                case 3:
                    return "出售";
                    break;
            }
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

        // --------  车位使用登记 -----------

        registerDialog(row) {
            this.registerForm.number = row.number;
            this.registerForm.parkingLotId = row.id;
            if (row.business != 1) this.isRegisters(row);

            this.registerDialogVisible = true;
        },
        enRegister() {
            this.$refs.registerForm.validate(valid => {
                if (valid) {
                    let param = {
                        parkingLotId: this.registerForm.parkingLotId,
                        householdId: this.registerForm.houseHoldId,
                        registerWay: this.registerForm.registerWay
                    };
                    this.postRequest(
                        this.REQUEST_URL + "register/",
                        param
                    ).then(response => {
                        if (response) {
                            this.initTableData();
                            this.registerDialogVisible = false;
                        }
                    });
                } else {
                    return false;
                }
            });
        },
        deRegister() {
            this.deleteRequest(
                this.REQUEST_URL +
                    "register/?id=" +
                    this.registerForm.parkingLotId
            ).then(response => {
                if (response) {
                    this.initTableData();
                    this.isRegister = true;
                    this.registerDialogVisible = false;
                }
            });
            console.log(this.registerForm);
        },
        isRegisters(row) {
            this.isRegister = false;
            this.getRequest(this.REQUEST_URL + "houseHold/" + row.id).then(
                response => {
                    if (response) {
                        this.registerForm.houseHoldName = response.realName;
                        this.registerForm.houseHoldTelephone =
                            response.telephone;
                    }
                }
            );
        },
        querySearch(queryString, cb) {
            console.log(queryString);
            // 调用 callback 返回建议列表的数据
            this.getRequest(this.REQUEST_URL + "register/" + queryString).then(
                response => {
                    if (response) {
                        cb(response);
                    }
                }
            );
        },
        // 查询选中
        handleSelect(item) {
            this.registerForm.houseHoldId = item.id;
            this.registerForm.houseHoldName = item.realName;
            this.registerForm.houseHoldTelephone = item.telephone;
        },
        registerDialogColosed() {
            this.registerForm.houseHoldId = "";
            this.registerForm.houseHoldName = "";
            this.registerForm.houseHoldTelephone = "";
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
        width: 90%;
    }
    .pagination {
        margin-top: 10px;
    }
}
.my-autocomplete {
    li {
        line-height: normal;
        padding: 7px;

        .name {
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .phone {
            font-size: 12px;
            color: #b4b4b4;
        }

        .highlighted .phone {
            color: #ddd;
        }
    }
}
</style>