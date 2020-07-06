<template>
    <div class="main">
        <el-container>
            <el-header class="header">
                <div class="header-title">Mini社区管理系统</div>
                <el-dropdown @command="commandClick">
                    <span class="el-dropdown-link">
                        <div class="user-info">
                            <div class="user-name">{{userInfo.realName}}</div>
                            <el-avatar
                                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                            ></el-avatar>
                        </div>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item icon="el-icon-s-custom" command="persson">个人中心</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-s-help" command="setting">设置</el-dropdown-item>
                        <el-dropdown-item divided icon="el-icon-turn-off" command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-header>
            <el-container class="left-menu">
                <el-aside width="200px">
                    <el-menu router unique-opened>
                        <el-submenu :index="index + ''" v-for="(item, index) in initRouters" :key="index">
                            <template slot="title">
                                <i :class="item.iconCls"></i>
                                <span>{{item.name}}</span>
                            </template>
                            <el-menu-item
                                :index="child.path"
                                v-for="(child, keys) in item.children"
                                :key="keys"
                            >{{child.name}}</el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-aside>
                <el-container>
                    <el-main>
                        <el-breadcrumb class="breadcrumb"
                            separator-class="el-icon-arrow-right"
                            v-if="this.$router.currentRoute.path!='/index'"
                        >
                            <el-breadcrumb-item class="breadcrumb-index" :to="{ path: '/index' }">首页</el-breadcrumb-item>
                            <el-breadcrumb-item>{{this.$router.currentRoute.name}}</el-breadcrumb-item>
                        </el-breadcrumb>
                        
                        <div v-if="this.$router.currentRoute.path=='/index'">（规划中）</div>
                        <router-view />
                    </el-main>
                    <!-- <el-footer class="footer">
                        <div>www.aihwaong.com</div>
                    </el-footer> -->
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script>
export default {
    name: "index",
    data: () => ({
        userInfo: []
    }),
    mounted() {
        this.init();
    },
    computed: {
        initRouters() {
            console.log(this.$store.state.routes);
            return this.$store.state.routes;
        }
    },
    methods: {
        init() {
            this.userInfo = JSON.parse(window.sessionStorage.getItem("user"));
            console.log(this.userInfo);
        },
        commandClick(commandTag) {
            switch (commandTag) {
                case "persson":
                    break;
                case "setting":
                    break;
                case "logout":
                    this.$confirm("是否退出登录?", "提示", {
                        confirmButtonText: "退出",
                        cancelButtonText: "取消",
                        type: "warning"
                    }).then(() => {
                        // 清除token & roles 清空sessionStorage
                        this.$store.commit('clearToken');
                        this.$store.commit('clearRoles');
                        sessionStorage.clear();
                        this.$router.replace("/");
                    });
                    break;
            }
        },
        menuClick(index, path) {}
    }
};
</script>
<style lang="scss" scoped>
$font-white: #ffffff; // 字体颜色
$bg-color: #f56c6c;
$bg-color-01: #ffc8c8;
.main {
    .header {
        background-color: $bg-color;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0px 15px;
        box-sizing: border-box;
        .header-title {
            color: $font-white;
            font-size: 20px;
        }
        .el-dropdown-link {
            color: $font-white;
        }
        .user-info {
            display: flex;
            .user-name {
                display: grid;
                align-content: center;
                vertical-align: middle;
                margin-right: 10px;
            }
        }
    }
    .left-menu {
        .el-submenu__title:hover,
        .el-menu-item:hover {
            background-color: $bg-color-01 !important;
        }
        .el-menu-item.is-active {
            color: $bg-color;
        }
    }
    .breadcrumb {
        margin-bottom: 20px;
    }
    .breadcrumb-index .el-breadcrumb__inner.is-link:hover {
        color: $bg-color-01 !important;
    }
    .footer {
        color: $font-white;
        display: flex;
        align-items: center;
        background-color: $bg-color;
    }
}
</style>
