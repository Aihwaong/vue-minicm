<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">信息登记</el-button>
                <el-button
                    type="danger"
                    :disabled="delCheckBtnDisabled"
                    @click="delCheck"
                    size="small"
                    plain
                >批量删除</el-button>
            </div>
            <div class="search-content">
                <el-input
                    placeholder="通过姓名查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.realName"
                    size="small"
                    clearable
                    style="width: 150px;margin-right: 5px"
                ></el-input>
                <el-input
                    placeholder="通过身份证查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.identityDocument"
                    size="small"
                    clearable
                    style="width: 200px;margin-right: 5px"
                ></el-input>
                <el-select
                    v-model="selectCondition.nation"
                    placeholder="通过民族查找"
                    size="small"
                    clearable
                    style="width: 150px;margin-right: 5px"
                >
                    <el-option
                        v-for="(item, key) in nationData"
                        :key="key"
                        :label="item.name"
                        :value="item.id"
                    ></el-option>
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
            <el-table-column type="selection" width="45"></el-table-column>
            <el-table-column fixed prop="realName" label="业主姓名" width="100"></el-table-column>
            <el-table-column prop="sex" label="性别" width="80" :formatter="formatSex"></el-table-column>
            <el-table-column prop="age" label="年龄" width="80"></el-table-column>
            <el-table-column prop="nativePlace" label="籍贯" width="120"></el-table-column>
            <el-table-column prop="telephone" label="联系方式" width="120"></el-table-column>
            <el-table-column prop="identityDocument" label="身份证" width="160"></el-table-column>
            <el-table-column prop="nationName" label="民族" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="100" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="登记时间" width="180" :formatter="renderTime"></el-table-column>
            <el-table-column fixed="right" label="操作" width="285">
                <template slot-scope="scope">
                    <el-button
                        @click="editDialog(scope.row)"
                        icon="el-icon-edit"
                        type="success"
                        size="small"
                        plain
                    >编辑</el-button>
                    <el-button
                        @click="checkInDialog(scope.row)"
                        icon="el-icon-office-building"
                        type="warning"
                        size="small"
                        plain
                    >房屋登记</el-button>
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
            :title="btnTitle"
            :visible.sync="dialogVisible"
            @closed="dialogColosed"
            width="400px"
        >
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                size="small"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="业主姓名" prop="realName">
                    <el-input v-model="form.realName" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="联系方式" prop="telephone">
                    <el-input v-model="form.telephone" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="身份证" prop="identityDocument">
                    <el-input v-model="form.identityDocument" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="籍贯" prop="nativePlace">
                    <el-input v-model="form.nativePlace" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="民族" prop="nation">
                    <el-select v-model="form.nation" placeholder="请选择民族" size="small">
                        <el-option
                            v-for="(item, key) in nationData"
                            :key="key"
                            :label="item.name"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="性别" prop="realName">
                    <el-select v-model="form.sex" placeholder="请选择状态">
                        <el-option label="男" value="1"></el-option>
                        <el-option label="女" value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option label="在住" value="1"></el-option>
                        <el-option label="非在住" value="0"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false" size="small" plain>取 消</el-button>
                <el-button type="success" @click="add()" size="small" plain>确 定</el-button>
            </span>
        </el-dialog>
        <!-- 房屋登记 -->
        <el-dialog title="房屋登记" :visible.sync="checkInDialogVisible">
            <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                plain
                @click="checkInAddDialog()"
                size="small"
            >信息登记</el-button>
            <el-table :data="checkInData" style="width: 100%" max-height="350">
                <el-table-column prop="ridgepoleName" label="楼栋"></el-table-column>
                <el-table-column prop="unitName" label="单元"></el-table-column>
                <el-table-column prop="storey" label="楼层"></el-table-column>
                <el-table-column prop="roomNumber" label="房号"></el-table-column>
                <el-table-column
                    prop="createTime"
                    :formatter="renderTime "
                    label="登记日期"
                    width="200"
                ></el-table-column>
                <el-table-column fixed="right" label="操作" width="120">
                    <template slot-scope="scope">
                        <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="onConfirm(scope.row)">
                            <el-button
                                slot="reference"
                                type="danger"
                                icon="el-icon-delete"
                                size="mini"
                                plain
                            >移除</el-button>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="checkInDialogVisible = false" size="small" plain>关 闭</el-button>
            </span>
        </el-dialog>
        <!-- 入住登记 Form -->
        <el-dialog
            title="房屋登记"
            :visible.sync="checkInFormDialogVisible"
            @closed="checkInFormColosed"
            width="400px"
        >
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                size="small"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="楼栋">
                    <el-cascader
                        v-model="buildingAreaCascader"
                        :props="{label:'areaName', value:'id'}"
                        :options="buildingAreaData"
                        @change="buildingCascaderChange"
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="房屋" prop="houseId">
                    <el-select v-model="cheInForm.houseId" placeholder="请选择房屋" size="small">
                        <el-option
                            v-for="(item, key) in houseData"
                            :key="key"
                            :label="item.label"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option label="在住" value="1"></el-option>
                        <el-option label="非在住" value="0"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="checkInFormDialogVisible = false" size="small" plain>取 消</el-button>
                <el-button type="success" @click="addCheckIn()" size="small" plain>确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            REQUEST_URL: "/household/",
            dialogVisible: false,
            checkInDialogVisible: false,
            checkInFormDialogVisible: false,
            btnTitle: "信息登记",
            form: {
                id: "",
                realName: "",
                telephone: "",
                identityDocument: "442111199609221215",
                nation: "",
                nativePlace: "",
                sex: "1",
                age:"",
                status: "1"
            },
            rules: {
                realName: [
                    {
                        required: true,
                        message: "请输入业主名称",
                        trigger: "blur"
                    }
                ],
                telephone: [
                    {
                        required: true,
                        message: "请输入联系方式",
                        trigger: "blur"
                    },
                    {
                        pattern: /^1[3456789]\d{9}$/,
                        message: "手机号码格式不正确，请重新输入",
                        trigger: "blur"
                    }
                ],
                nation: [
                    {
                        required: true,
                        message: "请选择民族",
                        trigger: "blur"
                    }
                ],
                identityDocument: [
                    {
                        required: true,
                        message: "请输入身份证号码",
                        trigger: "blur"
                    },
                    {
                        pattern: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/,
                        message: "格式有误，请重新输入",
                        trigger: "blur"
                    }
                ],
                status: [
                    {
                        required: true,
                        message: "请选择状态",
                        trigger: "blur"
                    }
                ],
                houseId: [
                    {
                        required: true,
                        message: "请选择房屋",
                        trigger: "blur"
                    }
                ]
            },
            tableData: [],
            tableCheckData: [],
            nationData: [],
            delCheckBtnDisabled: true,
            checkInData: [],
            buildingAreaData: [],
            buildingAreaCascader: [],
            houseData: [],
            pagin: {
                total: 0,
                size: 10,
                current: 1
            },
            selectCondition: {
                realName: "",
                telephone: "",
                nation: "",
                identityDocument: ""
            },
            cheInForm: {
                householdId: "",
                houseId: ""
            }
        };
    },
    mounted() {
        this.initTableData();
        this.initNationData();
    },
    methods: {
        // 初始化数据
        initTableData() {
            this.getRequest(
                this.REQUEST_URL +
                    "?realName=" +
                    this.selectCondition.realName +
                    "&identityDocument=" +
                    this.selectCondition.identityDocument +
                    "&nation=" +
                    this.selectCondition.nation +
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
        // 初始化获取民族信息
        initNationData() {
            this.getRequest(this.REQUEST_URL + "/getNations").then(response => {
                if (response) {
                    this.nationData = response;
                }
            });
        },
        // Table checkBox变化回调
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
            this.btnTitle = "信息登记";
            this.dialogVisible = true;
        },
        editDialog(row) {
            this.btnTitle = "信息编辑";
            this.getRequest(this.REQUEST_URL + row.id).then(resp => {
                if (resp) {
                    this.form = resp;
                    this.form.status = resp.status == 1 ? "1" : "0";
                }
            });
            this.dialogVisible = true;
        },
        add() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    this.form.age = this.renderAge(this.form.identityDocument);
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
            let date = new Date(row.createTime).toJSON();
            return new Date(+new Date(date) + 8 * 3600 * 1000)
                .toISOString()
                .replace(/T/g, " ")
                .replace(/\.[\d]{3}Z/, "");
        },
        renderAge(identityCard) {
            let len = (identityCard + "").length;
            if (len == 0) {
                return 0;
            } else {
                if (len != 15 && len != 18) {
                    //身份证号码只能为15位或18位其它不合法
                    return 0;
                }
            }
            let strBirthday = "";
            if (len == 18) {
                //处理18位的身份证号码从号码中得到生日和性别代码
                strBirthday =
                    identityCard.substr(6, 4) +
                    "/" +
                    identityCard.substr(10, 2) +
                    "/" +
                    identityCard.substr(12, 2);
            }
            if (len == 15) {
                strBirthday =
                    "19" +
                    identityCard.substr(6, 2) +
                    "/" +
                    identityCard.substr(8, 2) +
                    "/" +
                    identityCard.substr(10, 2);
            }
            //时间字符串里，必须是“/”
            let birthDate = new Date(strBirthday);
            let nowDateTime = new Date();
            let age = nowDateTime.getFullYear() - birthDate.getFullYear();
            //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
            if (
                nowDateTime.getMonth() < birthDate.getMonth() ||
                (nowDateTime.getMonth() == birthDate.getMonth() &&
                    nowDateTime.getDate() < birthDate.getDate())
            ) {
                age--;
            }
            return age;
        },
        formatStatus(row, column, cellValue, index) {
            return row.status == 1 ? "在住" : "非在住";
        },
        formatSex(row, column, cellValue, index) {
            return row.status == 1 ? "男" : "女";
        },

        // -------------- 分页 --------------

        // 每页数量改变回调
        handleSizeChange(size) {
            this.pagin.size = size;
            this.initTableData();
        },
        // 页数改变回调
        handleCurrentChange(current) {
            this.pagin.current = current;
            this.initTableData();
        },

        // -------------- 入住登记 --------------
        initcheckInData() {
            this.getRequest(
                "/household/house/getCheckInHouse/" + this.cheInForm.householdId
            ).then(response => {
                if (response) {
                    this.checkInData = response;
                }
            });
        },
        checkInDialog(row) {
            this.cheInForm.householdId = row.id;
            this.initcheckInData();
            this.checkInDialogVisible = true;
        },
        checkInAddDialog() {
            this.getRequest("/house/getBuildingAreasTree/").then(response => {
                if (response) {
                    this.buildingAreaData = response;
                }
            });
            this.checkInFormDialogVisible = true;
        },
        buildingCascaderChange(data) {
            let url =
                "/household/getHouses/?ridgepole=" +
                data[0] +
                "&unit=" +
                data[1];
            this.getRequest(url).then(response => {
                if (response) {
                    response.forEach(element => {
                        element.label =
                            element.storey + "-楼-" + element.roomNumber;
                    });
                    this.houseData = response;
                    this.cheInForm.houseId = "";
                }
            });
        },
        checkInFormColosed() {
            this.buildingAreaCascader = [];
            this.houseData = [];
            this.cheInForm.houseId = "";
            if (this.$refs["form"] != undefined) {
                this.$refs["form"].clearValidate();
            }
        },
        addCheckIn() {
            console.log(this.cheInForm);
            this.postRequest("/household/checkIn/", this.cheInForm).then(
                response => {
                    if (response) {
                        this.checkInFormDialogVisible = false;
                        this.initcheckInData();
                    }
                }
            );
        },
        onConfirm(data) {
            console.log(data);
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