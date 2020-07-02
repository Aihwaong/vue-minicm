<template>
    <el-tabs v-model="activeName">
            <el-tab-pane label="职员管理" name="first"><perssonel></perssonel></el-tab-pane>
            <el-tab-pane label="权限组管理" name="second"><role></role></el-tab-pane>
        </el-tabs>
</template>
<script>
import perssonel from "../../components/authority/perssonel";
import role from "../../components/authority/role";
export default {
    name: "authority",
    data: () => ({
        activeName: "first"
    }),
    components: {
        perssonel,
        role,
    }
};
</script>

<style scoped>

</style>