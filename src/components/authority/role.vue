<template>
    <div class="main">
        <div class="search-main">
            <div>
                <el-button type="primary" plain @click="addDialog()" size="small">新增权限组</el-button>
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
                    placeholder="请输入权限组名称"
                    prefix-icon="el-icon-search"
                    v-model="keyword"
                    size="small"
                    style="width: 350px;margin-right: 10px"
                ></el-input>
                <el-button icon="el-icon-search" type="primary" @click="initTableData()" size="small" plain>搜索</el-button>
            </div>
        </div>
        <el-table class="table" :data="tableData" @selection-change="selectionChange" size="small">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="title" label="权限组名称" width="140"></el-table-column>
            <el-table-column prop="roleIdentify" label="权限标识" width="140"></el-table-column>
            <el-table-column prop="status" label="状态" width="140" :formatter="formatStatus"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" :formatter="formatTime"></el-table-column>
            <el-table-column label="操作" width="350">
                <template slot-scope="scope">
                    <el-button
                        @click="editDialog(scope.row)"
                        icon="el-icon-edit"
                        type="success"
                        size="small"
                        plain
                    >编辑</el-button>
                    <el-button
                        @click="roleDialog(scope.row)"
                        icon="el-icon-user"
                        type="info"
                        size="small"
                        plain
                    >组员</el-button>
                    <el-button
                        @click="menuRoleDialog(scope.row)"
                        icon="el-icon-s-flag"
                        type="warning"
                        size="small"
                        plain
                    >权限</el-button>
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
        <!-- 信息编辑弹窗 -->
        <el-dialog title="新增权限组" :visible.sync="dialogVisible" @closed="dialogColosed" width="450px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="权限组名称" prop="title">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="权限标识" prop="roleIdentify">
                    <el-input v-model="form.roleIdentify"></el-input>
                </el-form-item>
                <el-form-item label="用户状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择用户状态">
                        <el-option label="启用" value="1"></el-option>
                        <el-option label="禁用" value="0"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false" plain>取 消</el-button>
                <el-button type="success" @click="add()" plain>确 定</el-button>
            </span>
        </el-dialog>
        <!-- 权限组分配弹窗 -->
        <el-dialog
            title="组员管理"
            :visible.sync="roleDialogVisible"
            @closed="roleDialogColosed"
            width="680px"
        >
            <el-transfer
                filterable
                :filter-method="filterMethod"
                filter-placeholder="请输入权限组名称"
                v-model="transfer.value"
                :data="transfer.data"
                @change="transferChange"
                :titles="['所有权限组', '组内权限组']"
                :props="{
                    key: 'id',
                    label: 'realName'
                }"
            ></el-transfer>
            <span slot="footer" class="dialog-footer">
                <el-button @click="roleDialogVisible = false" plain>关 闭</el-button>
            </span>
        </el-dialog>
        <!-- 权限分配 弹窗 -->
        <el-dialog
            title="权限分配"
            :visible.sync="menuRoleDialogVisible"
            @closed="menuRoleDialogColosed"
            width="400px"
        >
            <el-tree
                show-checkbox
                default-expand-all
                node-key="id"
                ref="tree"
                highlight-current
                :data="roleTree.roleTreeData"
                :props="roleTree.props"
                :default-checked-keys="roleTree.checkMenus"
            ></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="menuRoleDialogVisible = false" size="small" plain>关 闭</el-button>
                <el-button type="success" @click="setMenuRole()" size="small" plain>确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            REQUEST_URL: "/system/authority/role/",
            dialogVisible: false,
            roleDialogVisible: false,
            menuRoleDialogVisible: false,
            keyword: "",
            form: {
                id: "",
                title: "",
                roleIdentify: "",
                status: "1"
            },
            rules: {
                title: [
                    {
                        required: true,
                        message: "请输入权限组名称",
                        trigger: "blur"
                    }
                ],
                roleIdentify: [
                    {
                        required: true,
                        message: "请输入权限标识",
                        trigger: "blur"
                    }
                ]
            },
            pagin: {
                total: 0,
                size: 10,
                current: 1
            },
            transfer: {
                data: [],
                value: [],
                id: ""
            },
            tableData: [],
            tableCheckData: [],
            delCheckBtnDisabled: true,
            roleTree: {
                rid: "",
                roleTreeData: [
                    {
                        id: 1,
                        label: "一级 1",
                        children: [
                            {
                                id: 4,
                                label: "二级 1-1",
                                children: [
                                    {
                                        id: 9,
                                        label: "三级 1-1-1"
                                    },
                                    {
                                        id: 10,
                                        label: "三级 1-1-2"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 2,
                        label: "一级 2",
                        children: [
                            {
                                id: 5,
                                label: "二级 2-1"
                            },
                            {
                                id: 6,
                                label: "二级 2-2"
                            }
                        ]
                    },
                    {
                        id: 3,
                        label: "一级 3",
                        children: [
                            {
                                id: 7,
                                label: "二级 3-1"
                            },
                            {
                                id: 8,
                                label: "二级 3-2"
                            }
                        ]
                    }
                ],
                props: {
                    label: "name"
                },
                checkMenus: []
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
            this.$confirm("确定要删除该组吗？", "温馨提示", {
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
                                this.initTableData();
                            }
                        }
                    );
                })
                .catch(() => {});
        },
        // 弹窗关闭时回调， 初始化验证
        dialogColosed() {
            if (this.$refs["form"] != undefined) {
                this.form.id = "";
                this.$refs["form"].resetFields();
                this.$refs["form"].clearValidate();
            }
        },
        // 时间格式化
        formatTime(row, column, cellValue, index) {
            var date = new Date(row.createTime).toJSON();
            return new Date(+new Date(date) + 8 * 3600 * 1000)
                .toISOString()
                .replace(/T/g, " ")
                .replace(/\.[\d]{3}Z/, "");
        },
        // status字段格式化
        formatStatus(row, column, cellValue, index) {
            return row.status == 1 ? "启用" : "禁用";
        },
        // ------------ 分页 ------------
        // 每页数量改变回调
        handleSizeChange(size) {
            console.log("size-change" + this.pagin.current * size);
            this.pagin.size = size;
            this.initTableData();
        },
        // 页数改变回调
        handleCurrentChange(current) {
            console.log("CurrentChange" + current);
            this.pagin.current = current;
            this.initTableData();
        },
        // ------------ 穿梭框 — 组员管理 ------------
        roleDialog(row) {
            this.transfer.data = [];
            this.transfer.value = [];
            // 获取所有权限组
            this.getRequest("/system/authority/perssonel/getAllPersonnel").then(
                response => {
                    if (response) {
                        this.transfer.data = response;
                        console.log(this.transfer.data);
                    }
                }
            );
            // 获取组内人员
            this.getRequest("/system/authority/personnelRole/" + row.id).then(
                response => {
                    if (response) {
                        response.forEach(element => {
                            this.transfer.value.push(element.pid);
                        });
                        console.log(this.transfer.value);
                    }
                }
            );
            this.transfer.id = row.id;
            this.roleDialogVisible = true;
        },
        filterMethod(query, item) {
            return item.realName.indexOf(query) > -1;
        },
        transferChange(value, direction, movedKeys) {
            let URL =
                "/system/authority/personnelRole/?rid=" + this.transfer.id;
            movedKeys.forEach(element => {
                URL += "&perssonelId=" + element;
            });
            if (direction == "right") {
                console.log("add");
                this.putRequest(URL).then(response => {
                    if (response) {
                    }
                });
            } else if (direction == "left") {
                console.log("delete");
                this.deleteRequest(URL).then(response => {
                    if (response) {
                    }
                });
            }
            console.log(value, direction, movedKeys);
        },
        roleDialogColosed() {},
        // ------------ Tree — 权限管理 ------------
        menuRoleDialog(row) {
            this.getRequest("/system/authority/menuRole/").then(response => {
                if (response) {
                    this.roleTree.roleTreeData = response;
                }
            });
            this.getRequest("/system/authority/menuRole/" + row.id).then(
                response => {
                    if (response) {
                        this.roleTree.checkMenus = response;
                    }
                }
            );
            this.roleTree.id = row.id;
            this.menuRoleDialogVisible = true;
        },
        setMenuRole() {
            let menus = this.$refs.tree.getCheckedKeys(true);
            let url = "/system/authority/menuRole/";
            url += "?rid=" + this.roleTree.id;
            menus.forEach(element => {
                url += "&mid=" + element;
            });
            console.log(url);
            this.putRequest(url).then(response => {
                if (response) {
                }
            });
            this.menuRoleDialogVisible = true;
        },
        menuRoleDialogColosed() {
            this.roleTree.checkMenus = [];
            this.roleTree.id = "";
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