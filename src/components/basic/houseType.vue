<template>
    <div class="main">
        <el-tabs v-model="activeName" :tab-position="tabPosition">
            <el-tab-pane label="类型【室】" name="first"><chamber></chamber></el-tab-pane>
            <el-tab-pane label="类型【厅】" name="second"><hall></hall></el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import chamber from "../../components/basic/chamber";
import hall from "../../components/basic/hall";
export default {
    name: "base",
    data: () => ({
        activeName: "first",
        tabPosition: 'left'
    }),
    components: {
        chamber,
        hall,
    }
};
</script>

<style scoped>

</style>