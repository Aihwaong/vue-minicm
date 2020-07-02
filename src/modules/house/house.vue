<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">房屋登记</el-button>
                <el-button
                    type="danger"
                    :disabled="delCheckBtnDisabled"
                    @click="delCheck"
                    size="small"
                    plain
                >批量删除</el-button>
            </div>
            <div class="search-content">
                <el-cascader
                    v-model="buildingAreaCascader"
                    :props="{label:'areaName', value:'id'}"
                    :options="buildingAreaData"
                    @change="searchCascaderChange"
                    size="small"
                    clearable
                    style="width:180px;margin-right:5px"
                ></el-cascader>
                <el-input
                    placeholder="通过楼层查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.storey"
                    size="small"
                    clearable 
                    style="width: 150px;margin-right: 5px"
                ></el-input>
                <el-input
                    placeholder="通过房号查找"
                    prefix-icon="el-icon-search"
                    v-model="selectCondition.roomNumber"
                    size="small"
                    clearable 
                    style="width: 150px;margin-right: 5px"
                ></el-input>
                <el-select
                    v-model="selectCondition.chamber"
                    placeholder="房屋类型【室】"
                    size="small"
                    clearable 
                    style="width: 140px;margin-right: 5px"
                >
                    <el-option
                        v-for="(item, key) in chamberData"
                        :key="key"
                        :label="item.chamberName"
                        :value="item.id"
                    ></el-option>
                </el-select>
                <el-select
                    v-model="selectCondition.hall"
                    placeholder="房屋类型【厅】"
                    size="small"
                    clearable 
                    style="width: 140px;margin-right: 5px"
                >
                    <el-option
                        v-for="(item, key) in hallData"
                        :key="key"
                        :label="item.hallName"
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
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="ridgepoleName" label="楼栋" width="70"></el-table-column>
            <el-table-column prop="unitName" label="单元" width="70"></el-table-column>
            <el-table-column prop="storey" label="楼层" width="70"></el-table-column>
            <el-table-column prop="roomNumber" label="房号" width="70"></el-table-column>
            <el-table-column prop="houseType" label="房屋类型" width="100"></el-table-column>
            <el-table-column prop="floorSpace" label="建筑面积（平米）"></el-table-column>
            <el-table-column prop="status" label="状态" width="70" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="登记时间" width="180" :formatter="renderTime"></el-table-column>
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
        <el-dialog title="房屋登记" :visible.sync="dialogVisible" @closed="dialogColosed" width="450px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                label-width="90px"
                size="small"
                :hide-required-asterisk="true"
            >
                <el-form-item label="栋、单元" prop="ridgepole">
                    <el-cascader
                        v-model="buildingAreaCascader"
                        :props="{label:'areaName', value:'id'}"
                        :options="buildingAreaData"
                        @change="buildingCascaderChange"
                        clearable
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="楼层" prop="storey">
                    <el-input v-model="form.storey" size="small" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="房号" prop="roomNumber">
                    <el-input v-model="form.roomNumber" size="small" style="width:203px"></el-input>
                </el-form-item>
                <el-form-item label="房屋类型" prop="chamber">
                    <el-select v-model="form.chamber" placeholder="请选择类型" size="small">
                        <el-option
                            v-for="(item, key) in chamberData"
                            :key="key"
                            :label="item.chamberName"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="hall">
                    <el-select v-model="form.hall" placeholder="请选择类型" size="small">
                        <el-option
                            v-for="(item, key) in hallData"
                            :key="key"
                            :label="item.hallName"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="建筑面积" prop="floorSpace">
                    <el-input v-model="form.floorSpace" size="small" style="width:203px"></el-input>
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
    </div>
</template>

<script>
export default {
    data() {
        return {
            REQUEST_URL: "/house/",
            dialogVisible: false,
            keyword: "",
            buildingAreaData: [],
            ridgepoleData: [],
            unitData: [],
            chamberData: [],
            hallData: [],
            form: {
                id: "",
                ridgepole: "",
                unit: "",
                storey: "",
                roomNumber: "",
                chamber: "",
                hall: "",
                floorSpace: "",
                status: "1"
            },
            buildingAreaCascader: [],
            rules: {
                ridgepole: [
                    {
                        required: true,
                        message: "请选择楼栋",
                        trigger: "blur"
                    }
                ],
                unit: [
                    {
                        required: true,
                        message: "请选择单元",
                        trigger: "blur"
                    }
                ],
                storey: [
                    {
                        required: true,
                        message: "请输入楼层",
                        trigger: "blur"
                    }
                ],
                roomNumber: [
                    {
                        required: true,
                        message: "请输入房号",
                        trigger: "blur"
                    }
                ],
                chamber: [
                    {
                        required: true,
                        message: "请选择类型",
                        trigger: "blur"
                    }
                ],
                hall: [
                    {
                        required: true,
                        message: "请选择类型",
                        trigger: "blur"
                    }
                ],
                floorSpace: [
                    {
                        required: true,
                        message: "请输入建筑面积",
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
                ridgepole: "",
                unit: "",
                storey: "",
                roomNumber: "",
                chamber: "",
                hall: ""
            },
            selectUnitData: []
        };
    },
    mounted() {
        this.initTableData();
        this.initbuildingAreaData();
        this.initChamberData();
        this.initHallData();
    },
    methods: {
        initTableData() {
            if (this.selectCondition.ridgepole == undefined) this.selectCondition.ridgepole = "";
            if (this.selectCondition.unit == undefined) this.selectCondition.unit = "";
            this.getRequest(
                this.REQUEST_URL +
                    "?ridgepole=" +
                    this.selectCondition.ridgepole +
                    "&unit=" + 
                    this.selectCondition.unit +
                    "&storey=" + 
                    this.selectCondition.storey +
                    "&roomNumber=" + 
                    this.selectCondition.roomNumber + "" +
                    "&chamber=" + 
                    this.selectCondition.chamber +
                    "&hall=" + 
                    this.selectCondition.hall +
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
        initUnitData() {
            this.getRequest(
                this.REQUEST_URL + "getBuildingAreas/" + this.form.ridgepole
            ).then(response => {
                if (response) {
                    this.form.unit = response[0].id;
                    this.unitData = response;
                }
            });
        },
        initbuildingAreaData() {
            this.getRequest(this.REQUEST_URL + "getBuildingAreasTree/").then(
                response => {
                    if (response) {
                        this.buildingAreaData = response;
                    }
                }
            );
        },
        initChamberData() {
            this.getRequest(this.REQUEST_URL + "getChambers/").then(
                response => {
                    if (response) {
                        this.form.chamber = response[0].id;
                        this.chamberData = response;
                    }
                }
            );
        },
        initHallData() {
            this.getRequest(this.REQUEST_URL + "getHalls/").then(response => {
                if (response) {
                    this.form.hall = response[0].id;
                    this.hallData = response;
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
        buildingCascaderChange(data) {
            this.form.ridgepole = data[0];
            this.form.unit = data[1];
        },
        searchCascaderChange(data) {
            this.selectCondition.ridgepole = data[0];
            this.selectCondition.unit = data[1];
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
                    this.buildingAreaCascader = [resp.ridgepole, resp.unit];
                    this.form = resp;
                    this.form.status = resp.status == 1 ? "1" : "0";
                }
            });
            this.dialogVisible = true;
        },
        add() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    let param = {
                        id: ""
                    };
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
            this.$confirm("确定要删除该停车场吗？", "温馨提示", {
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
                this.buildingAreaCascader = [];
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
        width: 90%;
        display: flex !important;
        // justify-content: space-between !important;
        flex-flow: column;
        margin-bottom: 10px;
        .search-content {
            margin-top: 10px;
        }
    }
    .table {
        width: 90%;
    }
    .pagination {
        margin-top: 10px;
    }
}
</style>