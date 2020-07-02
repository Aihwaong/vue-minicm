<template>
    <div class="main">
        <el-input placeholder="输入关键字进行过滤" v-model="filterText" size="small"></el-input>

        <el-tree
            class="filter-tree"
            :data="data"
            :props="defaultProps"
            default-expand-all
            :highlight-current="highlight"
            :filter-node-method="filterNode"
            ref="tree"
        >
            <span
                class="custom-tree-node"
                slot-scope="{ node, data }"
                style="display: flex;justify-content: space-between;width: 100%;"
            >
                <span>{{ node.label }}</span>
                <span>
                    <el-button
                        icon="el-icon-circle-plus-outline"
                        v-if="data.parentid == 1"
                        type="primary"
                        size="mini"
                        class="tree-btn"
                        @click="() => addDialog(data)"
                        plain
                    >新增菜单</el-button>
                    <el-button
                        icon="el-icon-edit"
                        type="success"
                        size="mini"
                        class="tree-btn"
                        @click="() => updateDialog(data)"
                        plain
                    >修改菜单</el-button>
                    <el-button
                        icon="el-icon-delete"
                        type="danger"
                        size="mini"
                        class="tree-btn"
                        @click="() => del(data)"
                        plain
                    >删除</el-button>
                </span>
            </span>
        </el-tree>
        <!-- 弹窗 -->
        <el-dialog title="新增菜单" :visible.sync="dialogVisible" width="450px">
            <el-form
                ref="form"
                :rules="rules"
                :model="form"
                label-width="90px"
                hide-required-asterisk
            >
                <el-form-item label="上级菜单" prop="parentid">
                    <el-select v-model="form.parentid" placeholder="请选择上级菜单" @change="parentChange">
                        <el-option
                            v-for="(item, key) in parent"
                            :key="key"
                            :label="item.name"
                            :value="item.parentid"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="菜单名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="权限路由" prop="url">
                    <el-input v-model="form.url"></el-input>
                </el-form-item>
                <el-form-item label="组件路由" prop="path">
                    <el-input v-model="form.path"></el-input>
                </el-form-item>
                <el-form-item label="组件名称" prop="component">
                    <el-input v-model="form.component"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="success" @click="add()" plain>确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "systemMenu",
    data: () => ({
        highlight: true,
        filterText: "",
        data: [],
        defaultProps: {
            children: "children",
            label: "name"
        },
        dialogVisible: false,
        parent: [],
        form: {
            parentid: "",
            name: "",
            url: "",
            path: "",
            component: ""
        },
        rules: {
            parentid: [
                { required: true, message: "请选择上级菜单", trigger: "blur" }
            ],
            name: [
                { required: true, message: "请输入菜单名称", trigger: "blur" }
            ],
            url: [
                { required: true, message: "请输入权限路由", trigger: "blur" }
            ],
            path: [
                { required: true, message: "请输入组件路由", trigger: "blur" }
            ],
            component: [
                { required: true, message: "请输入组件名称", trigger: "blur" }
            ]
        }
    }),
    mounted() {
        this.initMenuData();
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },
    methods: {
        initMenuData() {
            this.postRequest("/system/menu/getMenuList").then(response => {
                if (response) {
                    this.data = response;
                }
            });
        },
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        addDialog(data) {
            this.form = {
                parentid: "",
                name: "",
                url: "",
                path: "",
                component: ""
            };
            this.formInit(data);
            this.resetForm();
            this.dialogVisible = true;
        },
        parentChange(data) {
            console.log(data);
        },
        // 菜单新增
        add(data) {
            this.$refs.form.validate(valid => {
                if (valid) {
                    if (
                        !this.form.id ||
                        typeof this.form.id == "undefined" ||
                        this.form.id == 0
                    ) {
                        this.postRequest("/system/menu/", this.form).then(
                            resp => {
                                if (resp) {
                                    this.dialogVisible = false;
                                    this.initMenuData();
                                }
                            }
                        );
                    } else {
                        this.putRequest("/system/menu/", this.form).then(
                            resp => {
                                if (resp) {
                                    this.dialogVisible = false;
                                    this.initMenuData();
                                }
                            }
                        );
                    }
                } else {
                    return false;
                }
            });
        },
        // 菜单
        updateDialog(data) {
            this.getRequest("/system/menu/" + data.id).then(response => {
                if (response) {
                    this.formInit(response);
                    this.form = response;
                }
            });
            this.dialogVisible = true;
        },
        del(data) {
            this.$confirm("确定要删除该菜单吗？", "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
            .then(() => {
                this.deleteRequest("/system/menu/" + data.id).then(
                    response => {
                        if (response) {
                            this.initMenuData();
                        }
                    }
                );
            })
            .catch(() => {});
        },
        // 初始化下拉选项数据
        formInit(data) {
            if (data.id != "") {
                let parent = [{ name: "顶级菜单", parentid: 1 }];
                parent.push({ name: data.name, parentid: data.id });
                this.form.parentid = "";
                this.parent = parent;
            } else {
            }
        },
        // 移除字段验证
        resetForm() {
            if (this.$refs["form"] != undefined) {
                this.$refs["form"].clearValidate();
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.main {
    width: 500px;
    .filter-tree {
        margin-top: 10px;
        .tree-btn {
            padding: 4px;
        }
    }
}
</style>
