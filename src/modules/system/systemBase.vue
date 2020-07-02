<template>
    <div class="main">
        <el-tabs v-model="activeName">
            <el-tab-pane label="楼宇区域管理" name="first"><buildingArea></buildingArea></el-tab-pane>
            <el-tab-pane label="停车场管理" name="second"><parkingArea></parkingArea></el-tab-pane>
            <el-tab-pane label="维修类型管理" name="third"><repairType></repairType></el-tab-pane>
            <el-tab-pane label="房屋类型管理" name="fourth"><houseType></houseType></el-tab-pane>
            <el-tab-pane label="通知类型管理" name="fifth"><noticeType></noticeType></el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import buildingArea from "../../components/basic/buildingArea";
import parkingArea from "../../components/basic/parkingArea";
import repairType from "../../components/basic/repairType";
import houseType from "../../components/basic/houseType";
import noticeType from "../../components/basic/noticeType";
export default {
    name: "base",
    data: () => ({
        activeName: "first"
    }),
    components: {
        buildingArea,
        parkingArea,
        repairType,
        houseType,
        noticeType
    }
};
</script>

<style scoped>

</style>